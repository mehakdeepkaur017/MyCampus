import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const timetableUpdateSchema = z.object({
  subject: z.string().optional(),
  faculty: z.string().optional(),
  room: z.string().optional(),
  day: z.string().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    const data = timetableUpdateSchema.parse(body);

    const existingClass = await prisma.timetable.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const finalData = { ...existingClass, ...data };

    if (finalData.startTime >= finalData.endTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    // Check for overlap excluding self
    const overlaps = await prisma.timetable.findMany({
      where: {
        id: { not: resolvedParams.id },
        day: finalData.day,
        OR: [
          { room: finalData.room },
          { faculty: finalData.faculty }
        ]
      }
    });

    const hasOverlap = overlaps.some(existing => {
      return finalData.startTime < existing.endTime && finalData.endTime > existing.startTime;
    });

    if (hasOverlap) {
      return NextResponse.json({ error: "Scheduling conflict: Overlapping class for the selected room or faculty" }, { status: 409 });
    }

    const updatedClass = await prisma.timetable.update({
      where: { id: resolvedParams.id },
      data,
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    await prisma.timetable.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
