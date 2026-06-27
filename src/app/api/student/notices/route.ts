import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoUser = user?.email === "admin@mycampus.edu" || user?.email === "student@mycampus.edu";

    const notices = await prisma.notice.findMany({
      where: {
        isDemoData: isDemoUser ? true : false,
        OR: [
          { department: null, semester: null },
          { department: user?.department || undefined, semester: user?.semester || undefined }
        ]
      },
      orderBy: [
        { pinned: "desc" },
        { createdAt: "desc" }
      ],
      include: {
        admin: {
          select: { name: true, avatar: true }
        }
      }
    });

    return NextResponse.json(notices);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}
