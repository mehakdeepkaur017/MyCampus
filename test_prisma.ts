import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import { prisma } from './src/lib/prisma';

async function main() {
    try {
        const whereClause: any = { role: "STUDENT" };
        whereClause.OR = [
          { email: { endsWith: "@example.com" } },
          { email: { endsWith: "@mycampus.edu" } },
          { email: { startsWith: "demo" } }
        ];

        console.log("Executing findMany...");
        const students = await prisma.user.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true
          }
        });
        console.log("Success! Found:", students.length);
    } catch (e) {
        console.error("Prisma Error:", e);
    }
}
main();
