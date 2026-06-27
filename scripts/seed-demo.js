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
    { name: "Data Structures", faculty: "Dr. Smith", room: "Room 101" },
    { name: "Web Development", faculty: "Prof. Johnson", room: "Lab 3" },
    { name: "Database Systems", faculty: "Dr. Williams", room: "Room 205" }
  ];

  for (const sub of subjects) {
    await prisma.timetable.create({
      data: {
        subject: sub.name,
        faculty: sub.faculty,
        room: sub.room,
        day: "Monday",
        startTime: "09:00",
        endTime: "10:30",
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
        startTime: "11:00",
        endTime: "12:30",
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

  const a1 = await prisma.assignment.create({
    data: {
      title: "Implement A* Search Algorithm",
      subject: "Data Structures",
      department,
      semester,
      dueDate: nextWeek,
      isDemoData: true
    }
  });

  const a2 = await prisma.assignment.create({
    data: {
      title: "Build a REST API",
      subject: "Web Development",
      department,
      semester,
      dueDate: nextMonth,
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
      isDemoData: true
    }
  });

  console.log('Creating Submissions...');
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: a1.id,
      studentId: student.id,
      status: "SUBMITTED",
      submissionUrl: "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1DBSM/FzDQEwF38wyhWCF4sSSxJLUFCA/EUkXwQUB/0wMxQplmSDRzLw0hZLU4mIIRx3CVAoAWnUWmgplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjkzCmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1BhcmVudCA0IDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNSAwIFI+Pj4+L0NvbnRlbnRzIDIgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZXMvS2lkc1sxIDAgUl0vQ291bnQgMT4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKCjYgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDQgMCBSPj4KZW5kb2JqCgo3IDAgb2JqCjw8L1Byb2R1Y2VyKEdob3N0c2NyaXB0IDkuNTMpL0NyZWF0aW9uRGF0ZShEOjIwMjMxMDI0MTIzNDU2Wik+PgplbmRvYmoKCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDE2MSAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxNDIgMDAwMDAgbiAKMDAwMDAwMDI2NSAwMDAwMCBuIAowMDAwMDAwMzIzIDAwMDAwIG4gCjAwMDAwMDA0MTEgMDAwMDAgbiAKMDAwMDAwMDQ2MCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOC9Sb290IDYgMCBSL0luZm8gNyAwIFI+PgpzdGFydHhyZWYKNTQ3CiUlRU9GCg=="
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
