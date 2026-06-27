import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Since timetable doesn't have a direct relation to student in our simple schema,
    // we fetch all. In a real app, it would be filtered by student's department/semester.
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    const timetable = await prisma.timetable.findMany({
      where: isDemoUser ? { isDemoData: true } : { isDemoData: false },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}
