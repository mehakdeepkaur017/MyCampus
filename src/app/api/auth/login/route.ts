import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import * as z from "zod";
import { cookies } from "next/headers";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["STUDENT", "ADMIN"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Your account has been disabled. Please contact administration." }, { status: 403 });
    }

    if (user.role !== data.role) {
      return NextResponse.json(
        { error: `You do not have access to the ${data.role} portal` },
        { status: 403 }
      );
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

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
      message: "Logged in successfully",
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
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
