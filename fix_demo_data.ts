import { prisma } from './src/lib/prisma';

async function main() {
  console.log("Updating Notices...");
  const noticeResult = await prisma.notice.updateMany({
    data: { isDemoData: true }
  });
  console.log(`Updated ${noticeResult.count} notices.`);

  console.log("Updating Timetables...");
  const timetableResult = await prisma.timetable.updateMany({
    data: { isDemoData: true }
  });
  console.log(`Updated ${timetableResult.count} timetables.`);

  console.log("Updating AdminNotes...");
  const adminNoteResult = await prisma.adminNote.updateMany({
    data: { isDemoData: true }
  });
  console.log(`Updated ${adminNoteResult.count} admin notes.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
