"use client"

import { useRouter } from "next/navigation"
import { LogOut, User as UserIcon, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserNav({ user }: { user: any }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push(user?.role === "ADMIN" ? "/admin/login" : "/login")
    router.refresh()
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="relative h-10 w-10 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" />
      }>
        <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800">
          <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
          <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2 rounded-3xl border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none bg-white dark:bg-[#0f1423]" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl mb-1">
            <div className="flex flex-col space-y-1.5">
              <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        
        <DropdownMenuGroup className="px-1 py-1">
          <DropdownMenuItem 
            className="p-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-1 group"
            onClick={() => router.push(user?.role === "ADMIN" ? "/admin/dashboard/profile" : "/dashboard/profile")}
          >
            <UserIcon className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span className="font-medium">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="p-3 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            onClick={() => router.push(user?.role === "ADMIN" ? "/admin/dashboard/settings" : "/dashboard/settings")}
          >
            <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span className="font-medium">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />
        
        <div className="px-1 py-1">
          <DropdownMenuItem 
            onClick={handleLogout} 
            className="p-3 rounded-xl cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-600 transition-colors" />
            <span className="font-medium">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
