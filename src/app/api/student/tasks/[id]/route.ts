import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const taskUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  progress: z.number().min(0).max(100).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await req.json();
    const data = taskUpdateSchema.parse(body);

    // Auto-update status based on progress if progress is being updated
    if (data.progress !== undefined) {
      if (data.progress === 100) data.status = "COMPLETED";
      else if (data.progress > 0) data.status = "IN_PROGRESS";
      else if (data.progress === 0 && !data.status) data.status = "TODO";
    }

    // Verify task belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingTask || existingTask.studentId !== session.userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: resolvedParams.id },
      data: {
        ...data,
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    // Verify task belongs to user
    const existingTask = await prisma.task.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingTask || existingTask.studentId !== session.userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
