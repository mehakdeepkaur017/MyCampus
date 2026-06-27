import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import * as z from "zod";

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Department is required"),
  semester: z.number().min(1),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoAdmin = adminUser?.email === "admin@mycampus.edu";

    const whereClause: any = { role: "STUDENT" };
    const demoEmailFilter = [
      { email: { endsWith: "@example.com" } },
      { email: { endsWith: "@mycampus.edu" } },
      { email: { startsWith: "demo" } }
    ];
    
    if (isDemoAdmin) {
      // Demo admin only sees demo accounts
      whereClause.OR = demoEmailFilter;
    } else {
      // Real admins never see demo accounts
      whereClause.NOT = { OR: demoEmailFilter };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        semester: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = studentSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const student = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        department: data.department,
        semester: data.semester,
        isActive: data.isActive,
        role: "STUDENT",
      },
      select: { id: true, name: true, email: true, department: true, semester: true, isActive: true }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
