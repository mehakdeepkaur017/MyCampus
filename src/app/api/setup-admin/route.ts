import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "admin@mycampus.com";
    const password = "password123";
    const name = "System Admin";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "ADMIN",
      },
      create: {
        email,
        name,
        password: hashedPassword,
        department: "Administration",
        semester: 0,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ message: "Admin created", email: admin.email, password });
  } catch (error) {
    return NextResponse.json({ error: "Failed to setup admin" }, { status: 500 });
  }
}
