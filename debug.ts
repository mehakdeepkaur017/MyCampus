import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: "student@example.com" }
  });
  console.log("Users with email student@example.com:", users.length);
  for (const user of users) {
    console.log("User ID:", user.id, "Role:", user.role);
    const count = await prisma.attendance.count({ where: { studentId: user.id } });
    console.log("Attendance count for this user:", count);
  }
}
main().finally(() => prisma.$disconnect());
