import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    const notes = await prisma.adminNote.findMany({
      where: {
        adminId: session.userId,
        ...(isDemoUser ? { isDemoData: true } : { isDemoData: false })
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admin notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const noteSchema = z.object({
      title: z.string().min(1, "Title is required"),
      content: z.string().min(1, "Content is required"),
      category: z.string().min(1, "Category is required"),
      subject: z.string().optional().nullable(),
      department: z.string().optional().nullable(),
      semester: z.coerce.number().optional().nullable(),
      attachmentUrl: z.string().optional().nullable(),
    });

    const validatedData = noteSchema.parse(body);

    const note = await prisma.adminNote.create({
      data: {
        ...validatedData,
        adminId: session.userId,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("AdminNote create error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
