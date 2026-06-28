import Link from "next/link";
import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminMobileBottomNav } from "@/components/admin-mobile-bottom-nav";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  ShieldAlert,
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
    <div className="flex h-[100dvh] w-full bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-[260px] flex-col bg-[#0f172a] text-slate-300 md:flex h-full shadow-xl z-20 shrink-0">
        <div className="flex h-20 items-center gap-3 px-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-inner">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white leading-none block">Admin</span>
            <span className="text-xl font-bold tracking-tight text-white leading-none block">Portal</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-8 overflow-y-auto hide-scrollbar">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3.5 rounded-full px-5 py-3 text-[15px] font-medium transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-5 w-5 text-slate-400" strokeWidth={2} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/50">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-800/50 p-2 pr-3">
            <Link href="/admin/dashboard/settings" className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer hover:bg-slate-800 p-1.5 rounded-xl transition-colors">
              <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || "Admin"} className="h-full w-full object-cover" />
                ) : (
                  (user?.name || "A").charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">{user?.name || "Loading..."}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || "..."}</p>
              </div>
            </Link>
            
            <div className="flex shrink-0">
              <ThemeToggle />
              <form action="/api/auth/logout" method="POST">
                <button 
                  type="submit"
                  className="h-9 w-9 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 p-4 md:p-8 relative bg-slate-50 dark:bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>

        <AdminMobileBottomNav />
      </div>
    </div>
  );
}
