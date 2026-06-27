import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const noteUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  subject: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  semester: z.coerce.number().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = noteUpdateSchema.parse(await req.json());

    const note = await prisma.adminNote.update({
      where: {
        id: id,
        adminId: session.userId, // Ensures they own it
      },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        subject: data.subject || null,
        department: data.department || null,
        semester: data.semester || null,
        attachmentUrl: data.attachmentUrl || null,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.adminNote.delete({
      where: {
        id: id,
        adminId: session.userId, // Ensures they own it
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
