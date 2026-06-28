import Link from "next/link";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserNav } from "@/components/user-nav";
import { AdminMobileNav } from "@/components/admin-mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  ShieldAlert,
  Menu,
  BarChart3,
  Settings,
  BookOpen,
  LogOut,
  CheckSquare
} from "lucide-react";

const sidebarLinks = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/admin/dashboard/students", icon: Users },
  { name: "Attendance", href: "/admin/dashboard/attendance", icon: BarChart3 },
  { name: "Timetable", href: "/admin/dashboard/timetable", icon: Calendar },
  { name: "Assignments", href: "/admin/dashboard/assignments", icon: CheckSquare },
  { name: "Notices", href: "/admin/dashboard/notices", icon: Bell },
  { name: "Notes", href: "/admin/dashboard/notes", icon: BookOpen },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  });

  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen w-full bg-slate-100 dark:bg-[#0a0a0a]">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-900 md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-inner">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Admin Portal</span>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0a0a0a]/80 px-4 md:px-6 backdrop-blur-xl">
          <AdminMobileNav />
          
          <div className="hidden md:flex flex-1">
            {/* Search */}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
