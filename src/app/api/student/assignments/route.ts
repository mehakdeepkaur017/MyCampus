import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    // Get unique subjects from Timetable
    const distinctTimetables = await prisma.timetable.findMany({
      where: {
        ...(isDemoUser ? { isDemoData: true } : { isDemoData: false })
      },
      select: { subject: true },
      distinct: ['subject']
    });
    
    const subjects = distinctTimetables.map(t => t.subject);

    // Get assignments ONLY for those subjects
    const assignments = await prisma.assignment.findMany({
      where: {
        subject: {
          in: subjects
        },
        isDemoData: isDemoUser ? true : false,
        OR: [
          { department: null, semester: null },
          { department: user?.department || undefined, semester: user?.semester || undefined }
        ]
      },
      orderBy: { dueDate: "asc" },
      include: {
        submissions: {
          where: { studentId: session.userId }
        }
      }
    });



    return NextResponse.json({ assignments, subjects });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}
