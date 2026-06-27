const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up existing demo data...');
  
  // Clean all records with isDemoData = true
  await prisma.assignmentSubmission.deleteMany({
    where: { assignment: { isDemoData: true } }
  });
  await prisma.assignment.deleteMany({ where: { isDemoData: true } });
  await prisma.notice.deleteMany({ where: { isDemoData: true } });
  await prisma.adminNote.deleteMany({ where: { isDemoData: true } });
  await prisma.timetable.deleteMany({ where: { isDemoData: true } });
  
  console.log('Fetching users...');
  let admin = await prisma.user.findUnique({ where: { email: 'admin@mycampus.edu' } });
  let student = await prisma.user.findUnique({ where: { email: 'student@mycampus.edu' } });
  
  if (!admin || !student) {
    console.error('Demo users not found!');
    process.exit(1);
  }

  const department = "Computer Science";
  const semester = 3;

  await prisma.user.update({
    where: { id: student.id },
    data: { department, semester }
  });

  // Also clean old attendance/tasks/notes for the demo student so they don't have lingering irrelevant data
  await prisma.attendance.deleteMany({ where: { studentId: student.id } });
  await prisma.task.deleteMany({ where: { studentId: student.id } });
  await prisma.note.deleteMany({ where: { studentId: student.id } });

  console.log(`Updated student to ${department}, Sem ${semester}`);

  console.log('Creating Timetable entries...');
  const subjects = [
    { name: "Data Structures", faculty: "Dr. Smith", room: "Room 101", mTime: { start: "09:00", end: "10:30" }, wTime: { start: "09:00", end: "10:30" } },
    { name: "Web Development", faculty: "Prof. Johnson", room: "Lab 3", mTime: { start: "11:00", end: "12:30" }, wTime: { start: "11:00", end: "12:30" } },
    { name: "Database Systems", faculty: "Dr. Williams", room: "Room 205", mTime: { start: "13:30", end: "15:00" }, wTime: { start: "13:30", end: "15:00" } }
  ];

  for (const sub of subjects) {
    await prisma.timetable.create({
      data: {
        subject: sub.name,
        faculty: sub.faculty,
        room: sub.room,
        day: "Monday",
        startTime: sub.mTime.start,
        endTime: sub.mTime.end,
        department,
        semester,
        isDemoData: true
      }
    });
    await prisma.timetable.create({
      data: {
        subject: sub.name,
        faculty: sub.faculty,
        room: sub.room,
        day: "Wednesday",
        startTime: sub.wTime.start,
        endTime: sub.wTime.end,
        department,
        semester,
        isDemoData: true
      }
    });
  }

  console.log('Creating Assignments...');
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const a2 = await prisma.assignment.create({
    data: {
      title: "Build a REST API",
      subject: "Web Development",
      department,
      semester,
      dueDate: nextMonth,
      documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      isDemoData: true
    }
  });

  const a3 = await prisma.assignment.create({
    data: {
      title: "Database Normalization Case Study",
      subject: "Database Systems",
      department: null, 
      semester: null,
      dueDate: nextWeek,
      documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      isDemoData: true
    }
  });

  console.log('Creating Notices...');
  await prisma.notice.create({
    data: {
      adminId: admin.id,
      title: "Mid-Term Examination Schedule",
      content: "The mid-term examinations will commence from next week. Please check your respective portals for the detailed schedule.",
      type: "EXAM",
      department,
      semester,
      isDemoData: true
    }
  });

  await prisma.notice.create({
    data: {
      adminId: admin.id,
      title: "Campus Wi-Fi Maintenance",
      content: "Campus Wi-Fi will be down for maintenance on Saturday from 10:00 PM to 2:00 AM.",
      type: "GENERAL",
      department: null,
      semester: null,
      isDemoData: true
    }
  });

  console.log('Creating Admin Notes...');
  await prisma.adminNote.create({
    data: {
      adminId: admin.id,
      title: "Review A* Submissions",
      content: "Make sure to grade the A* search algorithm implementations by Friday.",
      category: "Grading",
      subject: "Data Structures",
      department,
      semester,
      isDemoData: true
    }
  });
  
  // Also create a few attendances for the demo student for the same subjects
  const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  await prisma.attendance.create({
      data: {
          studentId: student.id,
          subject: "Data Structures",
          date: pastWeek,
          status: "PRESENT"
      }
  });
  await prisma.attendance.create({
      data: {
          studentId: student.id,
          subject: "Web Development",
          date: pastWeek,
          status: "ABSENT"
      }
  });
  await prisma.attendance.create({
      data: {
          studentId: student.id,
          subject: "Database Systems",
          date: pastWeek,
          status: "PRESENT"
      }
  });

  console.log('Demo data seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
