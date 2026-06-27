import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const timetableSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  faculty: z.string().min(1, "Faculty is required"),
  room: z.string().min(1, "Room is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format (HH:MM)"),
  department: z.string().min(1, "Department is required"),
  semester: z.coerce.number().min(1, "Semester is required"),
});

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const semester = searchParams.get("semester");

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    const whereClause: any = isDemoUser 
      ? { isDemoData: true } 
      : { isDemoData: false, createdById: session.userId };
    
    if (department && department !== "all") {
      whereClause.department = department;
    }
    if (semester && semester !== "all") {
      whereClause.semester = parseInt(semester);
    }

    const timetable = await prisma.timetable.findMany({
      where: whereClause,
      orderBy: [{ startTime: "asc" }],
    });

    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = timetableSchema.parse(body);

    if (data.startTime >= data.endTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    // Check for overlap: same day AND (same room OR same faculty) AND time overlap
    const overlaps = await prisma.timetable.findMany({
      where: {
        day: data.day,
        OR: [
          { room: data.room },
          { faculty: data.faculty }
        ]
      }
    });

    const hasOverlap = overlaps.some(existing => {
      // Time overlap logic: newStart < existingEnd AND newEnd > existingStart
      return data.startTime < existing.endTime && data.endTime > existing.startTime;
    });

    if (hasOverlap) {
      return NextResponse.json({ error: "Scheduling conflict: Overlapping class for the selected room or faculty" }, { status: 409 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    const classSession = await prisma.timetable.create({
      data: {
        ...data,
        createdById: session.userId,
        isDemoData: isDemoUser
      }
    });

    return NextResponse.json(classSession, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to schedule class" }, { status: 500 });
  }
}
