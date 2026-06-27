"use client"

import { useState, useEffect } from "react"
import { Users, FileText, CheckCircle, Bell, Loader2, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type AnalyticsData = {
  totalStudents: number
  attendancePercentage: number
  activeTasks: number
  totalNotices: number
  recentStudents: Array<{
    id: string
    name: string
    department: string
    createdAt: string
  }>
  departmentDistribution?: Array<{
    name: string
    students: number
  }>
}

const COLORS = ['#2563eb', '#ef4444', '#f59e0b']

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        toast.error("Failed to load analytics")
      }
    } catch (error) {
      toast.error("Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-5 w-[350px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-4 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  const pieData = [
    { name: 'Present', value: data.attendancePercentage },
    { name: 'Absent', value: 100 - data.attendancePercentage },
  ]

  const departmentData = data.departmentDistribution || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of campus metrics and student engagement.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f1423] rounded-3xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Students</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">Active enrollment</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f1423] rounded-3xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Attendance Rate</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.attendancePercentage}%</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-slate-400">Campus-wide average</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f1423] rounded-3xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Tasks</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.activeTasks}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-slate-400">Pending by students</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f1423] rounded-3xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Notices</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{data.totalNotices}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-slate-400">Published announcements</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f1423] rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Overall student presence versus absences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {data.attendancePercentage === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <Calendar className="h-10 w-10 mb-2 opacity-50" />
                  <p>No attendance data recorded yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="url(#colorPresent)" className="drop-shadow-sm" />
                      <Cell fill="#334155" opacity={0.3} />
                    </Pie>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={1}/>
                      </linearGradient>
                    </defs>
                    <RechartsTooltip 
                      formatter={(value) => `${value}%`}
                      contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f1423] rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Recently Registered Students</CardTitle>
            <CardDescription>The newest students added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentStudents.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <p>No students registered yet</p>
                </div>
              ) : (
                data.recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-slate-500">
                        {student.department || "No department"}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-slate-400">
                      {format(new Date(student.createdAt), "MMM d")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f1423] rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Number of active students enrolled per department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#c084fc" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip 
                    cursor={{fill: '#334155', opacity: 0.1}}
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#c084fc' }}
                  />
                  <Bar dataKey="students" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
