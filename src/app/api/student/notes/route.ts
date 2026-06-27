import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  subject: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    const personalNotes = await prisma.note.findMany({
      where: { studentId: session.userId },
      orderBy: { updatedAt: "desc" },
    });

    const adminNotes = await prisma.adminNote.findMany({
      where: {
        isDemoData: isDemoUser ? true : false,
        OR: [
          { department: null, semester: null },
          { department: user?.department || undefined, semester: user?.semester || undefined }
        ]
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ personalNotes, adminNotes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = noteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        subject: data.subject || null,
        attachmentUrl: data.attachmentUrl || null,
        studentId: session.userId,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("[NOTES_POST_ERROR]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
