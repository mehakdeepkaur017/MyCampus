import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
});

export async function GET() {
  // Force recompile 1
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { studentId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Force recompile 2
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        studentId: session.userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Task Creation Error:", error);
    return NextResponse.json({ error: "Failed to create task", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
