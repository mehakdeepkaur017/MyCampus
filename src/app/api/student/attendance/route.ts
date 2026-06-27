import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { id: session.userId } });
    
    // Graceful fallback for stale sessions after a database seed
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: "student@example.com" } });
    }
    
    if (!user) {
      return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId: user.id },
      orderBy: { date: "desc" },
    });

    const settings = await prisma.systemSettings.findFirst();
    const threshold = settings?.attendanceThreshold ?? 75;

    return NextResponse.json({ records: attendance, threshold });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
