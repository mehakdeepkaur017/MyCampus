"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Mail, Lock, Loader2, Calendar, UserCircle, Building } from "lucide-react"
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
  createdAt: string
  dob: string | null
  gender: string | null
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  password: z.string().optional(),
}).refine(data => !data.password || data.password.length >= 6, {
  message: "Password must be at least 6 characters",
  path: ["password"],
})

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      department: "",
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
      const res = await fetch("/api/admin/profile")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        form.reset({
          name: data.name || "",
          department: data.department || "",
          dob: data.dob || "",
          gender: data.gender || "",
          password: "",
        })
      } else {
        toast.error("Failed to load profile")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (res.ok) {
        toast.success("Profile updated successfully")
        form.setValue("password", "")
        fetchProfile()
      } else {
        const data = await res.json()
        toast.error(data.error?.[0]?.message || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-8">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    )
  }

  const initials = profile.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header Profile Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 p-8 sm:p-10 shadow-xl shadow-purple-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="h-28 w-28 rounded-full bg-white/20 backdrop-blur-md p-1 border-2 border-white/40 shadow-2xl">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-inner">
              {initials}
            </div>
          </div>
          <div className="text-center sm:text-left text-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {profile.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-purple-100 font-medium">
              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                Administrator
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm">
                <Mail className="h-4 w-4" />
                {profile.email}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm">
                <Calendar className="h-4 w-4" />
                Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-slate-100 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden bg-white/50 dark:bg-[#0a0f1e]/50 backdrop-blur-xl">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-6">
          <CardTitle className="text-xl flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-purple-500" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your personal information and account security.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900" disabled value={profile.email} />
                  </FormControl>
                  <FormDescription>Your email address is used for login and cannot be changed.</FormDescription>
                </FormItem>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-xl" placeholder="e.g. Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-xl" type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="max-w-md">
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-xl" type="password" placeholder="Leave blank to keep current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting}
                  className="h-12 px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg shadow-purple-500/30"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
