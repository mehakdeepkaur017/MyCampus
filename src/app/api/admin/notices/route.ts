import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const noticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["ACADEMIC", "EVENT", "EXAM", "GENERAL", "EMERGENCY"]).default("GENERAL"),
  pinned: z.boolean().default(false),
  department: z.string().optional().nullable(),
  semester: z.coerce.number().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    const notices = await prisma.notice.findMany({
      where: isDemoUser 
        ? { isDemoData: true } 
        : { isDemoData: false, adminId: session.userId },
      orderBy: [
        { pinned: "desc" },
        { createdAt: "desc" }
      ],
      include: {
        admin: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(notices);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = noticeSchema.parse(body);

    const notice = await prisma.notice.create({
      data: {
        ...data,
        adminId: session.userId
      },
      include: {
        admin: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
