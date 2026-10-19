import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "portfolio-data.json");

// In-memory cache for rapid reads without exhausting DB connection pool
interface CacheEntry {
  data: any;
  etag: string;
  timestamp: number;
}
let memoryCache: CacheEntry | null = null;
let fallbackCache: any = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds memory TTL

function generateETag(data: any): string {
  try {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `W/"${Math.abs(hash).toString(36)}-${str.length.toString(36)}"`;
  } catch {
    return `W/"${Date.now().toString(36)}"`;
  }
}

function readFallbackData() {
  if (fallbackCache) return fallbackCache;
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    fallbackCache = JSON.parse(raw);
    return fallbackCache;
  } catch {
    return null;
  }
}

function writeFallbackDataAsync(data: any) {
  try {
    fs.promises
      .writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
      .then(() => {
        fallbackCache = data;
      })
      .catch(() => { });
  } catch { }
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

// Fetch all sections in parallel via Promise.all (single RTT instead of 4 sequential roundtrips)
async function getPortfolioDataFromDB() {
  const [config, experiences, projects, skills] = await Promise.all([
    prisma.config.findFirst({ include: { social: true } }),
    prisma.experience.findMany({ orderBy: { order: "asc" } }),
    prisma.project.findMany({ orderBy: { order: "asc" } }),
    prisma.skillItem.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!config) return null;

  return {
    config: {
      title: config.title || "",
      description: {
        long: config.descriptionLong || "",
        short: config.descriptionShort || "",
      },
      keywords: config.keywords || [],
      author: config.author || "",
      email: config.email || "",
      site: config.site || "",
      githubUsername: config.githubUsername || "",
      githubRepo: config.githubRepo || "",
      resumeUrl: (config as any).resumeUrl || "",
      profilePic: (config as any).profilePic || "/assets/me.jpg",
      snowfallEnabled: (config as any).snowfallEnabled ?? false,
      snowfallColorLight: (config as any).snowfallColorLight || "#000000",
      snowfallColorDark: (config as any).snowfallColorDark || "#ffffff",
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
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      title: exp.title || "",
      company: exp.company || "",
      description: exp.description || [],
      skills: exp.skills || [],
    })),
    projects: projects.map((proj) => ({
      id: proj.id,
      category: proj.category || "",
      title: proj.title || "",
      src: proj.src || "",
      screenshots: proj.screenshots || [],
      live: proj.live || "",
      github: proj.github || "",
      description: proj.description || "",
      skills: {
        frontend: proj.frontendSkills || [],
        backend: proj.backendSkills || [],
      },
    })),
    skills: skills.map((s) => ({
      id: s.id,
      name: s.name,
      label: s.label,
      shortDescription: s.shortDescription,
      color: s.color || undefined,
      icon: s.icon,
      order: s.order,
    })),
  };
}

// Persist updates in a single atomic array batch transaction (up to 10x faster than interactive tx)
async function savePortfolioDataToDB(body: any) {
  const ops: any[] = [];

  // 1. Config & Social
  if (body.config) {
    const c = body.config;
    ops.push(
      prisma.config.upsert({
        where: { id: 1 },
        update: {
          title: c.title ?? "",
          descriptionLong: c.description?.long ?? "",
          descriptionShort: c.description?.short ?? "",
          keywords: Array.isArray(c.keywords) ? c.keywords : [],
          author: c.author ?? "",
          email: c.email ?? "",
          site: c.site ?? "",
          githubUsername: c.githubUsername ?? "",
          githubRepo: c.githubRepo ?? "",
          resumeUrl: c.resumeUrl ?? "",
          profilePic: c.profilePic ?? "",
          snowfallEnabled: Boolean(c.snowfallEnabled),
          snowfallColorLight: c.snowfallColorLight ?? "#000000",
          snowfallColorDark: c.snowfallColorDark ?? "#ffffff",
        },
        create: {
          id: 1,
          title: c.title ?? "",
          descriptionLong: c.description?.long ?? "",
          descriptionShort: c.description?.short ?? "",
          keywords: Array.isArray(c.keywords) ? c.keywords : [],
          author: c.author ?? "",
          email: c.email ?? "",
          site: c.site ?? "",
          githubUsername: c.githubUsername ?? "",
          githubRepo: c.githubRepo ?? "",
          resumeUrl: c.resumeUrl ?? "",
          profilePic: c.profilePic ?? "",
          snowfallEnabled: Boolean(c.snowfallEnabled),
          snowfallColorLight: c.snowfallColorLight ?? "#000000",
          snowfallColorDark: c.snowfallColorDark ?? "#ffffff",
        },
      })
    );

    if (c.social) {
      ops.push(
        prisma.social.upsert({
          where: { configId: 1 },
          update: {
            telegram: c.social.telegram ?? "",
            linkedin: c.social.linkedin ?? "",
            instagram: c.social.instagram ?? "",
            facebook: c.social.facebook ?? "",
            github: c.social.github ?? "",
            phone: c.social.phone ?? "",
          },
          create: {
            configId: 1,
            telegram: c.social.telegram ?? "",
            linkedin: c.social.linkedin ?? "",
            instagram: c.social.instagram ?? "",
            facebook: c.social.facebook ?? "",
            github: c.social.github ?? "",
            phone: c.social.phone ?? "",
          },
        })
      );
    }
  }

  // 2. Experience (only sync if experience array is provided in payload)
  if (Array.isArray(body.experience)) {
    ops.push(prisma.experience.deleteMany({}));
    if (body.experience.length > 0) {
      ops.push(
        prisma.experience.createMany({
          data: body.experience.map((exp: any, index: number) => ({
            startDate: exp.startDate ?? "",
            endDate: exp.endDate ?? "",
            title: exp.title ?? "",
            company: exp.company ?? "",
            description: Array.isArray(exp.description) ? exp.description : [],
            skills: Array.isArray(exp.skills) ? exp.skills : [],
            order: index,
          })),
        })
      );
    }
  }

  // 3. Projects (only sync if projects array is provided in payload)
  if (Array.isArray(body.projects)) {
    ops.push(prisma.project.deleteMany({}));
    if (body.projects.length > 0) {
      ops.push(
        prisma.project.createMany({
          data: body.projects.map((proj: any, index: number) => ({
            id: proj.id || `proj_${index}`,
            category: proj.category ?? "",
            title: proj.title ?? "",
            src: proj.src ?? "",
            screenshots: Array.isArray(proj.screenshots) ? proj.screenshots : [],
            live: proj.live ?? "",
            github: proj.github ?? "",
            description: proj.description ?? "",
            frontendSkills: Array.isArray(proj.skills?.frontend) ? proj.skills.frontend : [],
            backendSkills: Array.isArray(proj.skills?.backend) ? proj.skills.backend : [],
            order: index,
          })),
        })
      );
    }
  }

  // 4. Skills (only sync if skills array is provided in payload)
  if (Array.isArray(body.skills)) {
    ops.push(prisma.skillItem.deleteMany({}));
    if (body.skills.length > 0) {
      ops.push(
        prisma.skillItem.createMany({
          data: body.skills.map((s: any, index: number) => ({
            id: s.id || `skill_${index}`,
            name: s.name ?? "",
            label: s.label ?? "",
            shortDescription: s.shortDescription ?? "",
            color: s.color || null,
            icon: s.icon ?? "",
            order: s.order ?? index,
          })),
        })
      );
    }
  }

  if (ops.length === 0) return null;

  // Execute in a single atomic transaction batch with auto-retry for transient connection pooler errors
  let lastError: any;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await prisma.$transaction(ops);
      lastError = null;
      break;
    } catch (err: any) {
      lastError = err;
      if (attempt === 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  // Fetch updated dataset to refresh cache and return to client
  const updatedData = await getPortfolioDataFromDB();
  if (updatedData) {
    memoryCache = {
      data: updatedData,
      etag: generateETag(updatedData),
      timestamp: Date.now(),
    };
    // writeFallbackDataAsync(updatedData);
  } else {
    memoryCache = null;
  }

  // Invalidate Next.js route caches
  try {
    revalidatePath("/");
    revalidatePath("/admin");
  } catch { }

  return updatedData;
}

export async function GET(req: NextRequest) {
  try {
    const skipCache = req.nextUrl.searchParams.get("refresh") === "true";
    const ifNoneMatch = req.headers.get("if-none-match");

    // Return cached in-memory response if available and not expired
    if (!skipCache && memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL_MS) {
      if (ifNoneMatch && ifNoneMatch === memoryCache.etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            "ETag": memoryCache.etag,
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        });
      }

      return NextResponse.json(memoryCache.data, {
        headers: {
          "ETag": memoryCache.etag,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "X-Cache": "HIT",
        },
      });
    }

    let dbData: any = null;
    try {
      dbData = await getPortfolioDataFromDB();
    } catch (dbErr: any) {
      console.warn("Database query failed, attempting to serve fallback:", dbErr?.message || dbErr);
    }

    // Fallback if DB is empty, incomplete, or temporarily unreachable
    if (!dbData || !dbData.config || !dbData.config.title) {
      const fallback = readFallbackData();
      if (fallback) {
        const etag = generateETag(fallback);
        if (ifNoneMatch && ifNoneMatch === etag) {
          return new NextResponse(null, { status: 304 });
        }
        return NextResponse.json(fallback, {
          headers: {
            "ETag": etag,
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            "X-Fallback": "true",
          },
        });
      } else {
        return NextResponse.json({ error: "No data available in database or fallback JSON." }, { status: 404 });
      }
    }

    // Populate memory cache
    const etag = generateETag(dbData);
    memoryCache = {
      data: dbData,
      etag,
      timestamp: Date.now(),
    };

    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "ETag": etag,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    return NextResponse.json(dbData, {
      headers: {
        "ETag": etag,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/portfolio-data:", error);
    // Even if top-level error occurs, attempt to serve fallback
    const fallback = readFallbackData();
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: { "X-Fallback": "true" },
      });
    }
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

async function handleSave(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const updatedData = await savePortfolioDataToDB(body);
    return NextResponse.json({ success: true, data: updatedData });
  } catch (error: any) {
    console.error("Error saving portfolio data:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleSave(req);
}

export async function PUT(req: NextRequest) {
  return handleSave(req);
}

export async function PATCH(req: NextRequest) {
  return handleSave(req);
}

