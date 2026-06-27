import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const settingsSchema = z.object({
  attendanceThreshold: z.number().min(0).max(100),
});

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.systemSettings.findFirst();
    
    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { attendanceThreshold: 75 }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = settingsSchema.parse(body);

    let settings = await prisma.systemSettings.findFirst();

    if (settings) {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { attendanceThreshold: data.attendanceThreshold }
      });
    } else {
      settings = await prisma.systemSettings.create({
        data: { attendanceThreshold: data.attendanceThreshold }
      });
    }

    return NextResponse.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
