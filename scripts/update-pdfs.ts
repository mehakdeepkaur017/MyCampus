import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const realisticDummyUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  
  await prisma.assignment.updateMany({
    data: {
      documentUrl: realisticDummyUrl
    }
  });

  await prisma.assignmentSubmission.updateMany({
    data: {
      submissionUrl: realisticDummyUrl
    }
  });

  console.log("Updated dummy PDFs to realistic URL.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
