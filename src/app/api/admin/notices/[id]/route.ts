import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const noticeUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  pinned: z.boolean().optional(),
  type: z.enum(["ACADEMIC", "EVENT", "EXAM", "GENERAL", "EMERGENCY"]).optional(),
  department: z.string().optional().nullable(),
  semester: z.coerce.number().optional().nullable(),
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
    const data = noticeUpdateSchema.parse(body);

    const notice = await prisma.notice.update({
      where: { id: resolvedParams.id },
      data,
      include: {
        admin: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(notice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update notice" }, { status: 500 });
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

    await prisma.notice.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: "Notice deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 });
  }
}
