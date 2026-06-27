import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import * as z from "zod";

const studentUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal("")),
  department: z.string().optional(),
  semester: z.number().optional(),
  isActive: z.boolean().optional(),
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
    const data = studentUpdateSchema.parse(body);

    const existingStudent = await prisma.user.findFirst({
      where: { id: resolvedParams.id, role: "STUDENT" },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updateData: any = { ...data };

    if (data.password && data.password.length >= 6) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }

    const student = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: { id: true, name: true, email: true, department: true, semester: true, isActive: true }
    });

    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
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

    const existingStudent = await prisma.user.findFirst({
      where: { id: resolvedParams.id, role: "STUDENT" },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
