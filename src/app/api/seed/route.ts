import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function GET() {
  try {
    console.log("Seeding dummy data...");

    // 1. Create Demo Admin and Student
    const adminPassword = await hash("admin123", 10);
    const studentPassword = await hash("student123", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@mycampus.edu" },
      update: {},
      create: {
        name: "Admin Demo",
        email: "admin@mycampus.edu",
        password: adminPassword,
        role: "ADMIN",
      },
    });

    const student = await prisma.user.upsert({
      where: { email: "student@mycampus.edu" },
      update: {},
      create: {
        name: "Demo Student",
        email: "student@mycampus.edu",
        password: studentPassword,
        role: "STUDENT",
        department: "Computer Science",
        semester: 4,
      },
    });

    // 2. Clear existing demo data to avoid duplicates on re-seeding
    await prisma.timetable.deleteMany({ where: { isDemoData: true } });
    await prisma.assignment.deleteMany({ where: { isDemoData: true } });
    await prisma.notice.deleteMany({ where: { isDemoData: true } });
    await prisma.adminNote.deleteMany({ where: { isDemoData: true } });

    // 3. Create coordinated Timetable entries
    const subjects = [
      { subject: "Software Engineering", faculty: "Prof. Alan Turing", room: "Turing Hall", day: "Monday", startTime: "09:00", endTime: "11:00" },
      { subject: "Data Structures", faculty: "Dr. Grace Hopper", room: "Lab 3", day: "Monday", startTime: "11:30", endTime: "13:00" },
      { subject: "Web Development", faculty: "Tim Berners-Lee", room: "Studio 2", day: "Tuesday", startTime: "10:00", endTime: "12:00" },
      { subject: "Machine Learning", faculty: "Dr. Geoffrey Hinton", room: "AI Lab", day: "Wednesday", startTime: "14:00", endTime: "16:30" },
    ];

    for (const s of subjects) {
      await prisma.timetable.create({ data: { ...s, isDemoData: true } });
    }

    // 4. Create coordinated Assignments based on subjects
    const dummyAssignments = [
      {
        title: "Build a REST API",
        subject: "Web Development",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        title: "Implement A* Search Algorithm",
        subject: "Data Structures",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      },
      {
        title: "Design Pattern Case Study",
        subject: "Software Engineering",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
      }
    ];

    for (const a of dummyAssignments) {
      await prisma.assignment.create({ data: { ...a, isDemoData: true } });
    }

    // 5. Create coordinated Notices
    const dummyNotices = [
      {
        title: "Welcome to the Spring Semester!",
        content: "We are thrilled to welcome all new and returning students to the Spring Semester. Please ensure you have checked your updated timetable.",
        priority: "HIGH",
        adminId: admin.id
      },
      {
        title: "Guest Lecture on AI",
        content: "Join us this Friday for a special guest lecture on the future of Machine Learning by Dr. Geoffrey Hinton.",
        priority: "MEDIUM",
        adminId: admin.id
      },
      {
        title: "Campus Wi-Fi Maintenance",
        content: "The campus Wi-Fi network will undergo scheduled maintenance this Saturday night between 2 AM and 4 AM.",
        priority: "LOW",
        adminId: admin.id
      }
    ];

    for (const n of dummyNotices) {
      await prisma.notice.create({ data: { ...n, isDemoData: true } });
    }

    // 6. Create Admin Notes (Study Materials)
    const dummyAdminNotes = [
      {
        title: "Data Structures - Chapter 1 Slides",
        content: "Here are the presentation slides for our first lecture covering Arrays, Linked Lists, and Big O Notation.",
        category: "Study",
        subject: "Data Structures",
        attachmentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        adminId: admin.id
      },
      {
        title: "Web Dev Project Guidelines",
        content: "Please review these guidelines before starting your final term project. Pay special attention to the API requirements.",
        category: "Project",
        subject: "Web Development",
        adminId: admin.id
      }
    ];

    for (const n of dummyAdminNotes) {
      await prisma.adminNote.create({ data: { ...n, isDemoData: true } });
    }

    // 7. Create a couple of Personal Notes for Demo Student
    // (We'll check if they exist first so we don't duplicate on refresh)
    const existingPersonal = await prisma.note.findFirst({ where: { studentId: student.id } });
    if (!existingPersonal) {
      await prisma.note.createMany({
        data: [
          {
            title: "Ideas for Web Dev Project",
            content: "- Build a task manager app\n- Use Next.js and Tailwind\n- Add dark mode!",
            category: "Project",
            subject: "Web Development",
            studentId: student.id
          },
          {
            title: "Books to read for ML",
            content: "Need to borrow 'Deep Learning' by Goodfellow from the library this weekend.",
            category: "Personal",
            subject: "Machine Learning",
            studentId: student.id
          }
        ]
      });
    }

    return NextResponse.json({ success: true, message: "Data seeded successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
