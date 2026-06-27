"use client"

import { useState, useEffect } from "react"
import { User, Mail, BookOpen, GraduationCap, Lock, ShieldCheck, Loader2, Calendar, UserCircle } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type ProfileData = {
  name: string
  email: string
  department: string | null
  semester: number | null
  createdAt: string
  dob: string | null
  gender: string | null
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional(),
  semester: z.coerce.number().min(1).max(8).optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  password: z.string().optional(),
}).refine(data => !data.password || data.password.length >= 6, {
  message: "Password must be at least 6 characters",
  path: ["password"],
})

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      department: "",
      semester: 1,
      dob: "",
      gender: "",
      password: "",
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/student/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        form.reset({
          name: data.name || "",
          department: data.department || "",
          semester: data.semester || 1,
          dob: data.dob || "",
          gender: data.gender || "",
          password: "",
        })
      }
    } catch (error) {
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })

      if (res.ok) {
        toast.success("Profile updated successfully")
        fetchProfile()
      } else {
        const data = await res.json()
        toast.error(data.error || "Update failed")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (res.ok) window.location.href = "/"
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-[200px] rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-[400px] w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-indigo-500" />
            Profile Management
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">Manage your personal details and account security.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Identity Card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/60 dark:border-slate-800/60 shadow-lg p-1">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-32 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <Card className="bg-white/50 dark:bg-slate-950/40 backdrop-blur-md border-0 shadow-none rounded-[1.8rem]">
              <CardContent className="p-8 sm:p-10 relative z-10">
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 pb-10 border-b border-slate-200 dark:border-slate-800/50">
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20 flex items-center justify-center text-5xl font-bold text-white relative shrink-0">
                    {profile.name?.charAt(0) || "U"}
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                      <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-left flex-1 pt-2">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{profile.name}</h2>
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-lg">
                        <Mail className="h-4 w-4" /> {profile.email}
                      </span>
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-lg">
                        <GraduationCap className="h-4 w-4" /> Student Account
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><User className="h-4 w-4 text-indigo-500" /> Full Name</FormLabel>
                        <FormControl><Input {...field} className="h-12 rounded-xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><BookOpen className="h-4 w-4 text-purple-500" /> Department</FormLabel>
                        <FormControl><Input {...field} className="h-12 rounded-xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-purple-500" placeholder="e.g. Computer Science" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><Calendar className="h-4 w-4 text-fuchsia-500" /> Semester</FormLabel>
                        <FormControl><Input type="number" min={1} max={8} {...field} className="h-12 rounded-xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-fuchsia-500" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><UserCircle className="h-4 w-4 text-emerald-500" /> Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <SelectItem value="Male" className="cursor-pointer">Male</SelectItem>
                            <SelectItem value="Female" className="cursor-pointer">Female</SelectItem>
                            <SelectItem value="Other" className="cursor-pointer">Other</SelectItem>
                            <SelectItem value="Prefer not to say" className="cursor-pointer">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold"><Calendar className="h-4 w-4 text-amber-500" /> Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} className="h-12 rounded-xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500 max-w-[50%]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/50 flex justify-end">
                   <p className="text-xs text-slate-400 font-medium">
                     Account created on {format(new Date(profile.createdAt), "MMMM d, yyyy")}
                   </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 relative overflow-hidden rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 p-1">
              <Card className="bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm border-0 shadow-none h-full rounded-[1.8rem]">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">Security</h3>
                      <p className="text-sm text-slate-500">Update your password</p>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="password" placeholder="New Password (min 6 characters)" {...field} className="h-12 rounded-xl bg-white dark:bg-slate-900/50 border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-6 flex justify-end">
                    <Button type="submit" className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95">
                      Save All Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logout Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 p-1">
               <Card className="bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm border-0 shadow-none h-full rounded-[1.8rem] flex flex-col justify-center">
                <CardContent className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Device Security</h3>
                  <p className="text-sm text-slate-500 mb-6 px-4">End your current session across this device.</p>
                  <Button type="button" onClick={handleLogout} variant="destructive" className="w-full h-12 rounded-xl font-bold bg-rose-600 hover:bg-rose-500">
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

        </form>
      </Form>
    </div>
  )
}
