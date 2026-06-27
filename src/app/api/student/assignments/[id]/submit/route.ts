import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const submitSchema = z.object({
  submissionUrl: z.string().min(1, "Submission file is required"),
  remarks: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const body = await req.json();
    const data = submitSchema.parse(body);

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: session.userId,
        }
      },
      update: {
        submissionUrl: data.submissionUrl,
        remarks: data.remarks,
        submittedAt: new Date(),
        status: "SUBMITTED"
      },
      create: {
        assignmentId,
        studentId: session.userId,
        submissionUrl: data.submissionUrl,
        remarks: data.remarks,
        status: "SUBMITTED"
      }
    });

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
  }
}
