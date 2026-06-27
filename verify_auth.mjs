import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import pgPkg from 'pg';
const { Pool } = pgPkg;
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("Creating test admin account...");
  const hashedPassword = await bcrypt.hash("adminpassword123", 10);
  
  await prisma.user.upsert({
    where: { email: "admin@university.edu" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "System Admin",
      email: "admin@university.edu",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  
  console.log("Admin account ready.");
  
  // Create student account via API
  console.log("Testing Student Registration...");
  const registerRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Student",
      email: `student_${Date.now()}@university.edu`,
      password: "studentpassword123",
      department: "Computer Science",
      semester: 3
    })
  });
  
  const studentCookie = registerRes.headers.get("set-cookie");
  const registerData = await registerRes.json();
  console.log("Student Registration:", registerRes.status, registerData);
  
  // Test Student accessing Admin API (should fail)
  console.log("Testing Student -> Admin API access...");
  const studentToAdminRes = await fetch("http://localhost:3000/api/admin/test", {
    headers: { "Cookie": studentCookie || "" }
  });
  console.log("Student -> Admin API status (Expected 403):", studentToAdminRes.status);
  
  // Test Admin Login
  console.log("Testing Admin Login...");
  const adminLoginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@university.edu",
      password: "adminpassword123",
      role: "ADMIN"
    })
  });
  
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  const adminData = await adminLoginRes.json();
  console.log("Admin Login:", adminLoginRes.status, adminData);
  
  // Test Admin accessing Admin API (should succeed)
  console.log("Testing Admin -> Admin API access...");
  const adminToAdminRes = await fetch("http://localhost:3000/api/admin/test", {
    headers: { "Cookie": adminCookie || "" }
  });
  console.log("Admin -> Admin API status (Expected 200):", adminToAdminRes.status);
  
  // Test Admin accessing Student API (should fail)
  console.log("Testing Admin -> Student API access...");
  const adminToStudentRes = await fetch("http://localhost:3000/api/student/test", {
    headers: { "Cookie": adminCookie || "" }
  });
  console.log("Admin -> Student API status (Expected 403):", adminToStudentRes.status);
  
  process.exit(0);
}

run().catch(console.error);
