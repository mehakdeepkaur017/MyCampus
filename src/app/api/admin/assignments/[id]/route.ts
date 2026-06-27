import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete submissions first, then the assignment
    await prisma.assignmentSubmission.deleteMany({
      where: { assignmentId: id }
    });

    await prisma.assignment.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("DELETE_ASSIGNMENT_ERROR:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
