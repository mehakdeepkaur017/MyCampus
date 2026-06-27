"use client"

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, Calendar, CheckCircle2, Shield, LayoutDashboard, Clock, UserCog, User, Key, UserPlus } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: <Calendar className="h-6 w-6 text-indigo-500" />,
    title: "Smart Timetable",
    description: "Never miss a class with dynamic, real-time timetable updates and notifications.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
    title: "Attendance Tracking",
    description: "Keep a close eye on your attendance percentage with beautiful visual charts.",
  },
  {
    icon: <LayoutDashboard className="h-6 w-6 text-fuchsia-500" />,
    title: "Task Management",
    description: "Organize your assignments and projects with our intuitive kanban and list views.",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-amber-500" />,
    title: "Digital Notes",
    description: "Create, format, and organize all your study notes in one secure place.",
  },
  {
    icon: <Clock className="h-6 w-6 text-rose-500" />,
    title: "Instant Notices",
    description: "Stay informed with instant updates and pinned notices from the administration.",
  },
  {
    icon: <Shield className="h-6 w-6 text-cyan-500" />,
    title: "Secure Access",
    description: "Enterprise-grade role-based access control protecting student and admin data.",
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-[#020817]/80 backdrop-blur-2xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white tracking-tighter">MC</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MyCampus</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
            <Link href="#demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">Live Demo</Link>
            <Link href="#auth" className="hover:text-slate-900 dark:hover:text-white transition-colors">Join Now</Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/login?tab=admin" className="hidden sm:block text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
              Admin Login
            </Link>
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)] transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32">
          <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            className="container mx-auto px-4 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-5xl mx-auto"
            >
              <Badge variant="outline" className="mb-8 px-4 py-1.5 rounded-full border-indigo-500/30 bg-indigo-500/10 text-indigo-300 backdrop-blur-sm">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  MyCampus v2.0 is now live
                </span>
              </Badge>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
                The Ultimate <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  Campus Experience
                </span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 font-light leading-relaxed">
                A premium, unified workspace that replaces your scattered tools. Timetables, attendance, tasks, and notices—all in one beautifully designed platform.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-base bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-full w-full sm:w-auto font-semibold">
                    Create your account <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full w-full sm:w-auto border-slate-300 hover:bg-slate-100 text-slate-700 bg-white/50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white dark:bg-slate-900/50 font-medium backdrop-blur-sm">
                    View Demo Accounts
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 relative border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#020817]/50 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Built for modern academics</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                We've thoughtfully designed every aspect of the campus experience. No more clunky portals—just smooth, intuitive tools.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 hover:border-indigo-500/50 transition-colors duration-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                    <CardContent className="p-8">
                      <div className="mb-6 inline-flex p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 shadow-inner border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform duration-500">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-100/30 dark:via-indigo-950/10 to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1">Try it out</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Experience the Demo</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                See exactly how the platform works for both students and administrators using our pre-configured demo accounts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Student Demo Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-8 md:p-10 rounded-3xl h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <User className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Student Portal</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Experience the student dashboard</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-10 flex-1">
                    <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <span className="text-slate-500 text-sm font-mono">Email</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium font-mono select-all">student@mycampus.edu</span>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <span className="text-slate-500 text-sm font-mono">Password</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium font-mono select-all">student123</span>
                    </div>
                  </div>

                  <Link href="/login?demo=true&email=student@mycampus.edu" className="w-full">
                    <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-base">
                      Log in as Student
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Admin Demo Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-8 md:p-10 rounded-3xl h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <UserCog className="h-8 w-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Portal</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">Manage the institution</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-10 flex-1">
                    <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <span className="text-slate-500 text-sm font-mono">Email</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium font-mono select-all">admin@mycampus.edu</span>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <span className="text-slate-500 text-sm font-mono">Password</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium font-mono select-all">admin123</span>
                    </div>
                  </div>

                  <Link href="/login?tab=admin&demo=true&email=admin@mycampus.edu" className="w-full">
                    <Button className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium text-base">
                      Log in as Admin
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Auth Entry Section */}
        <section id="auth" className="py-32 relative border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Ready to transform your campus?</h2>
            
            <div className="grid sm:grid-cols-2 gap-6 mt-12">
              <Link href="/login" className="group">
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex flex-col items-center gap-4 h-full">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Key className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Existing User</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your account to access your dashboard.</p>
                  </div>
                  <Button variant="ghost" className="mt-auto text-slate-900 dark:text-white group-hover:bg-slate-100 dark:group-hover:bg-slate-800">
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
              
              <Link href="/register" className="group">
                <div className="p-8 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors flex flex-col items-center gap-4 h-full">
                  <div className="h-16 w-16 rounded-full bg-indigo-100/50 dark:bg-indigo-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">New Student</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create a new account with your student details.</p>
                  </div>
                  <Button variant="ghost" className="mt-auto text-indigo-600 dark:text-indigo-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30">
                    Register Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-12 bg-slate-50 dark:bg-[#020817] text-center text-slate-500">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3 opacity-50">
            <div className="h-6 w-6 rounded flex items-center justify-center bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-bold">MC</div>
            <span className="font-semibold text-slate-900 dark:text-white tracking-wide">MyCampus</span>
          </div>
          <p className="text-sm font-light">
            © {new Date().getFullYear()} MyCampus OS. Designed for modern academia.
          </p>
        </div>
      </footer>
    </div>
  );
}
