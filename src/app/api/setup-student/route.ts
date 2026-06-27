import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "student@example.com";
    const password = "password123";
    const name = "Demo Student";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "STUDENT",
      },
      create: {
        email,
        name,
        password: hashedPassword,
        department: "Computer Science",
        semester: 3,
        role: "STUDENT",
      },
    });

    return NextResponse.json({ message: "Student created", email: student.email, password });
  } catch (error) {
    return NextResponse.json({ error: "Failed to setup student" }, { status: 500 });
  }
}
