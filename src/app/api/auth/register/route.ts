import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import * as z from "zod";
import { cookies } from "next/headers";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "ADMIN"]).default("STUDENT"),
  department: z.string().optional(),
  semester: z.number().min(1).max(8).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        department: data.role === "STUDENT" ? data.department : null,
        semester: data.role === "STUDENT" ? data.semester : null,
        role: data.role,
      },
    });

    // Generate JWT
    const token = await signToken({
      userId: user.id,
      role: user.role,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
    }
    console.error("REGISTER ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
