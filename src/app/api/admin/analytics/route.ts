import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({ where: { id: session.userId } });
    const isDemoAdmin = adminUser?.email === "admin@mycampus.edu";

    // Student filter: demo admin sees demo students, real admin sees real students
    const demoEmailFilter = [
      { email: { endsWith: "@example.com" } },
      { email: { endsWith: "@mycampus.edu" } },
      { email: { startsWith: "demo" } }
    ];

    const studentWhereClause: any = { role: "STUDENT" };
    if (isDemoAdmin) {
      studentWhereClause.OR = demoEmailFilter;
    } else {
      studentWhereClause.NOT = { OR: demoEmailFilter };
    }

    // Data filter: demo admin sees isDemoData=true, real admin sees own data only
    const assignmentFilter = isDemoAdmin 
      ? { isDemoData: true } 
      : { isDemoData: false, createdById: session.userId };
    const noticeFilter = isDemoAdmin 
      ? { isDemoData: true } 
      : { isDemoData: false, adminId: session.userId };

    // Get filtered student IDs first for attendance filtering
    const filteredStudents = await prisma.user.findMany({
      where: studentWhereClause,
      select: { id: true }
    });
    const studentIds = filteredStudents.map(s => s.id);

    const [
      totalStudents,
      attendanceRecords,
      activeTasks,
      totalNotices,
      recentStudents,
      departmentGroup
    ] = await Promise.all([
      filteredStudents.length,
      prisma.attendance.findMany({
        where: { studentId: { in: studentIds } },
        select: { status: true }
      }),
      prisma.assignment.count({ where: assignmentFilter }),
      prisma.notice.count({ where: noticeFilter }),
      prisma.user.findMany({
        where: studentWhereClause,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, department: true, createdAt: true }
      }),
      prisma.user.groupBy({
        by: ['department'],
        where: studentWhereClause,
        _count: { id: true }
      })
    ]);

    const totalAttendanceRecords = attendanceRecords.length;
    const presentRecords = attendanceRecords.filter(r => r.status === "PRESENT").length;
    const attendancePercentage = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
      : 0;

    const departmentDistribution = departmentGroup
      .filter(g => g.department !== null)
      .map(g => ({
        name: g.department,
        students: g._count.id
      }))
      .sort((a, b) => b.students - a.students); // Sort by highest count

    return NextResponse.json({
      totalStudents,
      attendancePercentage,
      activeTasks,
      totalNotices,
      recentStudents,
      departmentDistribution
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
