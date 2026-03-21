import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "portfolio-data.json");

function readFallbackData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function isAuthenticated(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return true;
  } catch {
    return false;
  }
}

// Convert from Prisma output back into the unified JSON shape needed by frontend
async function getPortfolioDataFromDB() {
  const config = await prisma.config.findFirst({ include: { social: true } });
  if (!config) return null;

  console.log("Fetching experiences and projects...");
  const experiences = await prisma.experience.findMany({ orderBy: { order: "asc" } });
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  
  console.log("Fetching skills (dynamic model)...");
  const skills = await (prisma as any).skillItem.findMany({ orderBy: { order: "asc" } });

  console.log(`Success: fetched ${experiences.length} exps, ${projects.length} projs, ${skills.length} skills.`);

  const returnData = {
    config: {
      title: config.title,
      description: {
        long: config.descriptionLong,
        short: config.descriptionShort,
      },
      keywords: config.keywords,
      author: config.author,
      email: config.email,
      site: config.site,
      githubUsername: config.githubUsername,
      githubRepo: config.githubRepo,
      resumeUrl: (config as any).resumeUrl,
      profilePic: (config as any).profilePic || "/assets/me.jpg",
      social: {
        telegram: config.social?.telegram || "",
        linkedin: config.social?.linkedin || "",
        instagram: config.social?.instagram || "",
        facebook: config.social?.facebook || "",
        github: config.social?.github || "",
        phone: config.social?.phone || "",
      },
    },
    experience: experiences.map((exp) => ({
      id: exp.id,
      startDate: exp.startDate,
      endDate: exp.endDate,
      title: exp.title,
      company: exp.company,
      description: exp.description,
      skills: exp.skills,
    })),
    projects: projects.map((proj) => ({
      id: proj.id,
      category: proj.category,
      title: proj.title,
      src: proj.src,
      screenshots: proj.screenshots,
      live: proj.live,
      github: proj.github,
      description: proj.description,
      skills: {
        frontend: proj.frontendSkills,
        backend: proj.backendSkills,
      },
    })),
    skills: skills.map((s: any) => ({
      id: s.id,
      name: s.name,
      label: s.label,
      shortDescription: s.shortDescription,
      color: s.color || undefined,
      icon: s.icon,
      order: s.order,
    })),
  };
  console.log("Final keys in getPortfolioDataFromDB:", Object.keys(returnData));
  return returnData;
}

// Persist the full JSON payload into Prisma
async function savePortfolioDataToDB(body: any) {
  await prisma.$transaction(async (tx) => {
    // 1. Upsert Config
    const configData = body.config;
    const config = await tx.config.upsert({
      where: { id: 1 },
      update: {
        title: configData.title,
        descriptionLong: configData.description.long,
        descriptionShort: configData.description.short,
        keywords: configData.keywords || [],
        author: configData.author,
        email: configData.email,
        site: configData.site,
        githubUsername: configData.githubUsername,
        githubRepo: configData.githubRepo,
        resumeUrl: (configData as any).resumeUrl || "",
        profilePic: (configData as any).profilePic || "",
      } as any,
      create: {
        id: 1,
        title: configData.title,
        descriptionLong: configData.description.long,
        descriptionShort: configData.description.short,
        keywords: configData.keywords || [],
        author: configData.author,
        email: configData.email,
        site: configData.site,
        githubUsername: configData.githubUsername,
        githubRepo: configData.githubRepo,
        resumeUrl: (configData as any).resumeUrl || "",
        profilePic: (configData as any).profilePic || "",
      } as any,
    });

    // 2. Upsert Social
    if (configData.social) {
      await tx.social.upsert({
        where: { configId: config.id },
        update: {
          telegram: configData.social.telegram,
          linkedin: configData.social.linkedin,
          instagram: configData.social.instagram,
          facebook: configData.social.facebook,
          github: configData.social.github,
          phone: configData.social.phone,
        },
        create: {
          configId: config.id,
          telegram: configData.social.telegram,
          linkedin: configData.social.linkedin,
          instagram: configData.social.instagram,
          facebook: configData.social.facebook,
          github: configData.social.github,
          phone: configData.social.phone,
        },
      });
    }

    // 3. Sync Experience (Clear and insert new)
    await tx.experience.deleteMany({});
    if (body.experience && Array.isArray(body.experience)) {
      await tx.experience.createMany({
        data: body.experience.map((exp: any, index: number) => ({
          startDate: exp.startDate,
          endDate: exp.endDate,
          title: exp.title,
          company: exp.company,
          description: exp.description || [],
          skills: exp.skills || [],
          order: index,
        })),
      });
    }

    // 4. Sync Projects (Clear and insert new)
    await tx.project.deleteMany({});
    if (body.projects && Array.isArray(body.projects)) {
      await tx.project.createMany({
        data: body.projects.map((proj: any, index: number) => ({
          id: proj.id || `proj_${index}`,
          category: proj.category,
          title: proj.title,
          src: proj.src,
          screenshots: proj.screenshots || [],
          live: proj.live,
          github: proj.github,
          description: proj.description,
          frontendSkills: proj.skills?.frontend || [],
          backendSkills: proj.skills?.backend || [],
          order: index,
        })),
      });
    }

    // 5. Sync Skills (Clear and insert new)
    console.log("Syncing skills...");
    await (tx as any).skillItem.deleteMany({});
    if (body.skills && Array.isArray(body.skills)) {
      await (tx as any).skillItem.createMany({
        data: body.skills.map((s: any, index: number) => ({
          id: s.id,
          name: s.name,
          label: s.label,
          shortDescription: s.shortDescription,
          color: s.color,
          icon: s.icon,
          order: s.order ?? index,
        })),
      });
    }
    console.log("Sync complete.");
  }, {
    maxWait: 10000,
    timeout: 30000, // 30 seconds to allow massive Base64 images to process
  });
}

export async function GET() {
  try {
    let dbData = await getPortfolioDataFromDB();
    
    // Instead of forcing a database overwrite, serve the fallback data strictly in READ-ONLY mode
    // This prevents accidental data loss if the DB is temporarily empty during a Prisma regeneration
    if (!dbData || !dbData.config || !dbData.config.title) {
      console.log("Database incomplete or empty. Serving portfolio-data.json as READ-ONLY fallback...");
      const fallback = readFallbackData();
      
      if (fallback) {
        return NextResponse.json(fallback);
      } else {
        return NextResponse.json({ error: "No data available in database or fallback JSON." }, { status: 404 });
      }
    }
    
    return NextResponse.json(dbData);
  } catch (error: any) {
    console.error("Error in GET /api/portfolio-data:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await savePortfolioDataToDB(body);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving portfolio data:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
