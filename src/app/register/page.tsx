"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Shield, Loader2, ArrowLeft, GraduationCap, UserCog } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  department: z.string().optional(),
  semester: z.coerce.number().optional(),
})

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeRole, setActiveRole] = useState<"student" | "admin">("student")

  const isAdmin = activeRole === "admin"

  const form = useForm({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      semester: 1,
    },
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get("tab")
      if (tabParam === "admin" || tabParam === "student") {
        setActiveRole(tabParam)
      }
    }
  }, [])

  async function onSubmit(values: any) {
    if (values.password !== values.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    setIsLoading(true)
    try {
      const payload: any = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: isAdmin ? "ADMIN" : "STUDENT",
      }
      if (!isAdmin) {
        payload.department = values.department
        payload.semester = values.semester
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      toast.success("Account created successfully!")
      router.push(isAdmin ? "/admin/dashboard" : "/dashboard")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function onFormError(errors: any) {
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      toast.error(firstError.message)
    }
  }

  function handleRoleSwitch(role: "student" | "admin") {
    setActiveRole(role)
    form.reset({ name: "", email: "", password: "", confirmPassword: "", department: "", semester: 1 })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020817] text-slate-50 selection:bg-indigo-500/30 px-4 py-8 relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-1000 ${isAdmin ? "bg-purple-900/30" : "bg-indigo-900/20"}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-1000 ${isAdmin ? "bg-pink-900/20" : "bg-fuchsia-900/20"}`} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
      </div>

      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors z-20 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>
      
      <div className="w-full max-w-lg space-y-8 bg-[#0a0f1e]/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-slate-800/60 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className={`relative h-16 w-16 mb-6 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg transition-colors duration-500 ${isAdmin ? "bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/30" : "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/30"}`}>
            {isAdmin ? (
              <UserCog className="h-8 w-8 text-white" />
            ) : (
              <GraduationCap className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Create an account
          </h1>
          <p className="text-slate-400 font-light">
            {isAdmin ? "Set up your administrator account" : "Enter your details below to create your student workspace"}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-900/50 border border-slate-700/50 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleRoleSwitch("student")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              !isAdmin 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isAdmin 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCog className="h-4 w-4" />
            Admin
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Full Name</FormLabel>
                  <FormControl>
                    <Input className="h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500" placeholder="John Doe" disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage className="text-rose-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Email Address</FormLabel>
                  <FormControl>
                    <Input className="h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500" type="email" placeholder={isAdmin ? "admin@university.edu" : "student@university.edu"} disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage className="text-rose-400" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Password</FormLabel>
                    <FormControl>
                      <Input className="h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500" type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className="text-rose-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Confirm Password</FormLabel>
                    <FormControl>
                      <Input className="h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500" type="password" placeholder="••••••••" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className="text-rose-400" />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Student-only fields */}
            {!isAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Department</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500" placeholder="Computer Science" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Semester</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-xl bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500" type="number" min={1} max={8} disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full h-14 mt-4 text-base font-bold rounded-xl text-white shadow-lg transition-all ${
                isAdmin 
                  ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/30" 
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                isAdmin ? "Create Admin Account" : "Create Student Account"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors hover:underline">
              Sign in securely
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
