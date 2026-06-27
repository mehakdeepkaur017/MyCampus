import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const noteUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  subject: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
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
    const data = noteUpdateSchema.parse(body);

    const existingNote = await prisma.note.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingNote || existingNote.studentId !== session.userId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const note = await prisma.note.update({
      where: { id: resolvedParams.id },
      data,
    });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
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

    const existingNote = await prisma.note.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingNote || existingNote.studentId !== session.userId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
