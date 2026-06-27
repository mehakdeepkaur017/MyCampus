import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";
import * as z from "zod";

const bulkAttendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  subject: z.string().min(1, "Subject is required"),
  records: z.array(z.object({
    studentId: z.string(),
    status: z.enum(["PRESENT", "ABSENT"]),
  })).min(1, "At least one record is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = bulkAttendanceSchema.parse(body);
    const dateObj = new Date(data.date);

    // Use a transaction to perform upserts or creates
    // We'll just delete existing records for these students on this date and create new ones
    const studentIds = data.records.map(r => r.studentId);

    // Ensure the date only compares Year, Month, Day to avoid timezone issues with time
    const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1);

    await prisma.$transaction(async (tx) => {
      // 1. Delete existing records for these students on this specific day
      await tx.attendance.deleteMany({
        where: {
          studentId: { in: studentIds },
          subject: data.subject,
          date: {
            gte: startOfDay,
            lt: endOfDay,
          }
        }
      });

      // 2. Insert new records
      const insertData = data.records.map(record => ({
        studentId: record.studentId,
        subject: data.subject,
        date: dateObj,
        status: record.status
      }));

      await tx.attendance.createMany({
        data: insertData
      });
    });

    return NextResponse.json({ message: "Attendance marked successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
