const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function savePortfolioDataToDB(body) {
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
        resumeUrl: configData.resumeUrl || "",
      },
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
        resumeUrl: configData.resumeUrl || "",
      },
    });

    if (configData.social) {
      await tx.social.upsert({
        where: { configId: config.id },
        update: {
          telegram: configData.social.telegram,
          linkedin: configData.social.linkedin,
          instagram: configData.social.instagram,
          facebook: configData.social.facebook,
          github: configData.social.github,
        },
        create: {
          configId: config.id,
          telegram: configData.social.telegram,
          linkedin: configData.social.linkedin,
          instagram: configData.social.instagram,
          facebook: configData.social.facebook,
          github: configData.social.github,
        },
      });
    }

    await tx.experience.deleteMany({});
    if (body.experience && Array.isArray(body.experience)) {
      await tx.experience.createMany({
        data: body.experience.map((exp, index) => ({
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

    await tx.project.deleteMany({});
    if (body.projects && Array.isArray(body.projects)) {
      await tx.project.createMany({
        data: body.projects.map((proj, index) => ({
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

    await tx.skillItem.deleteMany({});
    if (body.skills && Array.isArray(body.skills)) {
      await tx.skillItem.createMany({
        data: body.skills.map((s, index) => ({
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
  });
}

async function run() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'portfolio-data.json'), 'utf-8');
    const data = JSON.parse(raw);
    await savePortfolioDataToDB(data);
    console.log("SUCCESS SAVE");
  } catch (e) {
    console.error("ERROR SAVE:", e.message);
  }
}
run();
