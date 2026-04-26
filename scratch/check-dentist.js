const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const dentist = await prisma.dentist.findUnique({
    where: { slug: "javier-chandia-escandon" },
    select: { id: true, fullName: true, isPublished: true, slug: true }
  });
  console.log(JSON.stringify(dentist, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
