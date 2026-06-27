import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";
import bcrypt from "bcryptjs";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  department: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
});

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        email: true,
        department: true,
        createdAt: true,
        avatar: true,
        role: true,
        dob: true,
        gender: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = profileSchema.parse(body);
    
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.department) updateData.department = data.department;
    if (data.dob) updateData.dob = data.dob;
    if (data.gender) updateData.gender = data.gender;
    if (data.password && data.password.length >= 6) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        name: true,
        email: true,
        department: true,
      }
    });

    return NextResponse.json({ message: "Profile updated successfully", user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as z.ZodError<any>).issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
