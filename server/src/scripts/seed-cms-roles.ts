import { getPrisma } from "../lib/prisma";

const prisma = getPrisma();

const CMS_ROLES = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "SUPER_ADMIN",
    description: "Super Admin",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "ADMIN",
    description: "Admin",
  },
] as const;

async function seedCmsRoles() {
  for (const role of CMS_ROLES) {
    await prisma.cmsRole.upsert({
      where: { name: role.name },
      create: role,
      update: { description: role.description },
    });
  }
}

seedCmsRoles()
  .then(async () => {
    await prisma.$disconnect();
    console.info("[seed] CMS roles are ready.");
  })
  .catch(async (error) => {
    console.error("[seed] Failed to seed CMS roles.", error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  });
