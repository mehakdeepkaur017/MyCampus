# Smart Campus Utility App (Mini ERP)

A comprehensive, production-ready full-stack application built for modern universities and schools. Powered by **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL (Neon)** using the **Prisma ORM**.

## 🔑 Demo Credentials

To quickly test the application, you can use the following pre-configured demo accounts or click the **Demo Login** buttons on the login page:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@mycampus.edu` | `admin123` |
| **Student** | `student@mycampus.edu` | `student123` |

## ✨ Key Features

### Unified Authentication System
- **Dual-Role Login/Registration:** Seamlessly switch between Student and Admin portals on a single polished interface.
- **Dynamic Departments:** Department dropdowns automatically populate based on the active student roster (e.g., if a student registers under "Biotechnology", it instantly becomes available to admins everywhere).

### 🎓 Student Portal
- **Dashboard Overview:** Quick access to personalized metrics, upcoming classes, and recent assignments.
- **Interactive Timetable:** Date-aware weekly class schedule organized by day with automatic empty-state handling.
- **Attendance Tracker:** Visual attendance tracking (Present/Absent) powered by Recharts.
- **Assignments Module:** View upcoming assignments, submit work (supports file uploads/Base64), and view grades.
- **Task Management:** Kanban-style task manager with full CRUD and optimistic UI.
- **Personal Notes:** Private markdown-supported notebook for studying and projects.
- **Notice Board:** View public and pinned campus announcements.
- **Profile Management:** Editable user profile with avatar selection.

### 🛡️ Admin Portal
- **Analytics Dashboard:** Recharts-powered graphs tracking total students, active tasks, and campus-wide attendance percentage.
- **Student Management:** Full CRUD. Create accounts, edit details, reset passwords, and Disable/Enable user accounts.
- **Bulk Attendance:** Mark daily attendance for specific departments and semesters using database transactions.
- **Timetable Scheduling:** Schedule classes with built-in **Overlap Prevention** logic (blocks double-booking for the same room or faculty).
- **Assignments Management:** Create assignments targeting specific departments/semesters, grade student submissions, and manage deadlines.
- **Admin Notes:** Private notebook for faculty/admin use.
- **Notice Management:** Publish and pin critical announcements.

### 🎨 Design & UX
- **Premium Aesthetics:** Glassmorphism, smooth micro-animations, and dynamic gradient backgrounds.
- **Dark Mode Support:** Integrated light/dark mode toggles across all dashboards.
- **Responsive Layouts:** Fully optimized for mobile, tablet, and desktop viewing.

### 🔒 Security
- **Custom JWT Authentication:** Uses `jose` library to handle HTTP-only cookies securely at the edge.
- **Strict RBAC:** Middleware prevents cross-role access (Students cannot access `/admin/*`, Admins cannot access `/dashboard/*`).
- **API Guarding:** Every backend route independently verifies the user's role and session ID against the database.
- **Global Error Handling:** Custom 403, 404, and 500 pages.

---

## 📂 Project Structure

```text
├── prisma/
│   ├── schema.prisma       # PostgreSQL schema
│   └── migrations/         # Version-controlled DB migrations
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # Backend REST API routes
│   │   ├── admin/          # Admin UI (Dashboard, Modules)
│   │   ├── dashboard/      # Student UI (Dashboard, Modules)
│   │   └── login/          # Unified Login & Registration
│   ├── components/         # Reusable UI components (shadcn/ui)
│   ├── lib/                # Utilities, Prisma Client, JWT logic
│   └── proxy.ts            # Edge Middleware for RBAC filtering
├── verify_auth.mjs         # Automated security audit script
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS theming
└── package.json            # Project dependencies
```

---

## 🛠 Deployment & Environment

### Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
# Neon PostgreSQL Connection String
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

# Secret string for JWT generation
JWT_SECRET="your-super-secure-jwt-secret-key-32chars!"
```

### Vercel Deployment Steps
1. Push this repository to GitHub.
2. Import the repository into **Vercel**.
3. Under **Environment Variables** in Vercel, add `DATABASE_URL` and `JWT_SECRET`.
4. The Build Command is automatically detected as `next build` and Install Command as `npm install`.
5. Click **Deploy**. Vercel will build the Next.js app and deploy it automatically.

### Database Setup & Seeding
To apply the database schema to your Neon DB, run:
```bash
npx prisma generate
npx prisma db push
```

**Creating the Default Admin:**
You can use the unified registration page (`/register?tab=admin`) to create an admin account, or run the included `verify_auth.mjs` script to automatically seed a default Admin account:
```bash
node --env-file=.env verify_auth.mjs
```

