import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      select: { id: true, title: true, isDemoData: true, department: true }
    });
    return NextResponse.json({ assignments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
