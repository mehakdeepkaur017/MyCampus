"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Shield, Loader2, ArrowLeft, GraduationCap, UserCog } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export default function UnifiedLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student")

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get("tab")
      if (tabParam === "admin" || tabParam === "student") {
        setActiveTab(tabParam)
      }
      if (params.get("demo") === "true") {
        const email = params.get("email") || ""
        form.setValue("email", email)
        if (email.includes("admin")) {
          form.setValue("password", "admin123")
        } else {
          form.setValue("password", "student123")
        }
      }
    }
  }, [form])

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    try {
      const role = activeTab === "admin" ? "ADMIN" : "STUDENT"
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials")
      }

      toast.success(role === "ADMIN" ? "Admin access granted" : "Welcome back!")
      router.push(role === "ADMIN" ? "/admin/dashboard" : "/dashboard")
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

  const isAdmin = activeTab === "admin"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#020817] px-4 py-8 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000 ${isAdmin ? "bg-purple-900/30" : "bg-blue-900/30"}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-1000 ${isAdmin ? "bg-pink-900/20" : "bg-cyan-900/20"}`} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
      </div>

      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors z-20">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to home
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="space-y-8 bg-slate-900/60 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-800/60 relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-6 shadow-inner border ${isAdmin ? "bg-purple-500/10 border-purple-500/20" : "bg-blue-500/10 border-blue-500/20"}`}
              >
                {isAdmin ? (
                  <UserCog className="h-8 w-8 text-purple-400" />
                ) : (
                  <GraduationCap className="h-8 w-8 text-blue-400" />
                )}
              </motion.div>
            </AnimatePresence>
            
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isAdmin ? "Admin Portal" : "Student Login"}
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              {isAdmin ? "Restricted access. Authorized personnel only." : "Enter your credentials to access your account."}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => {
            setActiveTab(val);
            form.reset({ email: "", password: "" });
          }} className="w-full relative z-10 flex flex-col items-center">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-slate-700/50 p-1 rounded-xl mb-8">
              <TabsTrigger value="student" className="rounded-lg text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Student</TabsTrigger>
              <TabsTrigger value="admin" className="rounded-lg text-slate-300 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student" className="w-full mt-0 border-none p-0 outline-none">
              {/* Dummy content just to satisfy TabsContent structure if we share the form */}
            </TabsContent>
            <TabsContent value="admin" className="w-full mt-0 border-none p-0 outline-none">
              {/* Dummy content just to satisfy TabsContent structure if we share the form */}
            </TabsContent>

            <div className="w-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder={isAdmin ? "admin@mycampus.edu" : "student@mycampus.edu"} 
                            disabled={isLoading} 
                            className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700 h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            disabled={isLoading} 
                            className="bg-slate-950/50 border-slate-800 text-white focus-visible:ring-slate-700 h-11"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    className={`w-full mt-6 h-12 text-base font-semibold shadow-md transition-all ${
                      isAdmin 
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/25" 
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25"
                    }`} 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>
            </div>
          </Tabs>

          <div className="text-center text-sm text-slate-400 relative z-10 pt-4 border-t border-slate-800/50">
            Don't have an account?{" "}
            <Link href={`/register?tab=${activeTab}`} className={`font-medium transition-colors ${isAdmin ? "text-purple-400 hover:text-purple-300" : "text-blue-400 hover:text-blue-300"}`}>
              Create account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
