import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

export const dynamic = 'force-dynamic';

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  dueDate: z.string().min(1, "Due date is required"),
  documentUrl: z.string().optional().nullable(),
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

    const whereClause: any = isDemoUser 
      ? { isDemoData: true } 
      : { isDemoData: false, createdById: session.userId };

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      orderBy: { dueDate: "asc" },
      include: {
        _count: {
          select: { submissions: true }
        },
        submissions: {
          include: {
            student: {
              select: { name: true, email: true }
            }
          },
          orderBy: { submittedAt: "desc" }
        }
      }
    });

    console.log("FETCHED ASSIGNMENTS FOR USER:", user?.email, "IS_DEMO:", isDemoUser, "COUNT:", assignments.length);

    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = assignmentSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        subject: data.subject,
        department: data.department || null,
        semester: data.semester || null,
        dueDate: new Date(data.dueDate),
        documentUrl: data.documentUrl || null,
        createdById: session.userId,
        isDemoData: isDemoUser,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    console.error("ASSIGNMENT_CREATE_ERROR:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || "Failed to create assignment" }, { status: 500 });
  }
}
