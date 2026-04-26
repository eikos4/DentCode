const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const dentists = await prisma.dentist.findMany({
    select: {
      id: true,
      fullName: true,
      isActive: true,
      isPublished: true,
      locations: { select: { id: true, region: true, city: true } }
    }
  });
  console.log(JSON.stringify(dentists, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
