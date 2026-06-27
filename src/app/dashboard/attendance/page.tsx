"use client"

import { useState, useEffect } from "react"
import { format, isSameDay, subDays, isToday, isYesterday } from "date-fns"
import { Loader2, CheckCircle2, XCircle, Calendar as CalendarIcon, Activity, TrendingUp, TrendingDown, BookOpen } from "lucide-react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type Attendance = {
  id: string
  date: string
  subject: string
  status: "PRESENT" | "ABSENT"
}

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([])
  const [threshold, setThreshold] = useState<number>(75)
  const [loading, setLoading] = useState(true)
  
  // Date Selector State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tempDate, setTempDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch("/api/student/attendance")
        if (res.ok) {
          const data = await res.json()
          setRecords(data.records || [])
          setThreshold(data.threshold || 75)
        }
      } catch (error) {
        toast.error("Failed to fetch attendance records")
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
  }

  // Calculate Overall Stats
  const total = records.length
  const present = records.filter(r => r.status === "PRESENT").length
  const absent = records.filter(r => r.status === "ABSENT").length
  const percentage = total === 0 ? 0 : Math.round((present / total) * 100)
  const isBelowThreshold = percentage < threshold

  // Calculate Subject-Wise Stats for Chart & Summary
  const subjects = Array.from(new Set(records.map(r => r.subject)))
  
  const subjectStats = subjects.map(subject => {
    const subjectRecords = records.filter(r => r.subject === subject)
    const subTotal = subjectRecords.length
    const subPresent = subjectRecords.filter(r => r.status === "PRESENT").length
    const subAbsent = subjectRecords.filter(r => r.status === "ABSENT").length
    const subPercentage = subTotal === 0 ? 0 : Math.round((subPresent / subTotal) * 100)
    
    let abbreviation = subject;
    if (subject.length > 4) {
      const words = subject.split(' ').filter(w => w.trim().length > 0);
      if (words.length > 1) {
        abbreviation = words.map(w => w[0].toUpperCase()).join('');
      } else {
        abbreviation = subject.substring(0, 3).toUpperCase();
      }
    }
    
    return {
      subject,
      abbreviation,
      present: subPresent,
      absent: subAbsent,
      total: subTotal,
      percentage: subPercentage
    }
  })

  // Filter records for the currently selected date in the "Recent Activity" view
  const displayRecords = records.filter(r => isSameDay(new Date(r.date), selectedDate))

  const handleDateSubmit = () => {
    if (!tempDate) return
    setSelectedDate(new Date(tempDate))
  }

  const handleQuickSelect = (daysAgo: number) => {
    const target = subDays(new Date(), daysAgo)
    setSelectedDate(target)
    setTempDate(format(target, "yyyy-MM-dd"))
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 dark:from-blue-900/60 dark:to-indigo-900/40 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800/50">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-[15px]">Monitor your class presence and subject-wise statistics.</p>
          </div>
        </div>
      </div>

      {/* TOP SECTION: At-a-Glance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Overall Percentage */}
        <Card className={`relative overflow-hidden rounded-[2rem] border transition-all duration-300 shadow-sm hover:shadow-md ${
          isBelowThreshold 
            ? "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50" 
            : "bg-white border-slate-200 dark:bg-[#0f1423] dark:border-slate-800/80"
        }`}>
          <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Overall Rate</p>
                <div className="flex items-end gap-2">
                  <span className={`text-5xl font-black tracking-tighter ${isBelowThreshold ? 'text-red-600 dark:text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isBelowThreshold ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'}`}>
                {isBelowThreshold ? <TrendingDown className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className={isBelowThreshold ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}>Target: {threshold}%</span>
                <span className={isBelowThreshold ? 'text-red-600' : 'text-slate-500'}>{percentage}/{threshold}</span>
              </div>
              <Progress 
                value={percentage} 
                max={100} 
                className={`h-2.5 ${isBelowThreshold ? 'bg-red-200 [&>div]:bg-red-500' : 'bg-slate-100 [&>div]:bg-blue-500'} dark:bg-slate-800`} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Present */}
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-[#0f1423]">
          <CardContent className="p-8 flex flex-col justify-center h-full">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-100 dark:border-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Classes Attended</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white">{present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Absent */}
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-[#0f1423]">
          <CardContent className="p-8 flex flex-col justify-center h-full">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-900/30">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Classes Missed</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white">{absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MIDDLE SECTION: Daily Activity */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" /> Daily Activity Tracker
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <button 
                onClick={() => handleQuickSelect(0)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${isToday(selectedDate) ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Today
              </button>
              <button 
                onClick={() => handleQuickSelect(1)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${isYesterday(selectedDate) ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Yesterday
              </button>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input 
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="h-9 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 sm:w-36"
              />
              <button 
                onClick={handleDateSubmit} 
                className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-sm font-semibold transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </div>

        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800/80 shadow-sm bg-white dark:bg-[#0f1423] overflow-hidden">
          <CardContent className="p-0">
            {displayRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                 <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <CalendarIcon className="h-8 w-8 text-slate-300 dark:text-slate-500" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No classes recorded</h3>
                 <p className="text-slate-500 mt-1">There are no attendance records for {format(selectedDate, "MMMM do, yyyy")}.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayRecords.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                      {r.status === "PRESENT" ? (
                        <div className="h-10 w-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 border border-green-100 dark:border-green-800">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 border border-red-100 dark:border-red-800">
                          <XCircle className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[15px] text-slate-900 dark:text-white">{r.subject}</p>
                        <p className="text-[13px] text-slate-500 mt-0.5">{format(selectedDate, "EEEE, MMMM do")}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`px-3 py-1 font-bold rounded-lg border ${
                      r.status === 'PRESENT' 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                    }`}>
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM SECTION: Subject Insights */}
      <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-500" /> Subject Insights
        </h2>
        
        {/* Subject Cards Grid */}
        <div className="flex flex-col gap-4">
          {subjectStats.map((stat, i) => {
            const isDanger = stat.percentage < threshold;
            const isExcellent = stat.percentage >= 90;
            const isGood = !isDanger && !isExcellent;

            let colorTheme = {
              cardBg: "bg-white dark:bg-[#0f1423]",
              border: "border-slate-200 dark:border-slate-800",
              accentText: "text-blue-600 dark:text-blue-400",
              accentBg: "bg-blue-50 dark:bg-blue-900/20",
              progressBg: "bg-slate-100 dark:bg-slate-800",
              progressFill: "[&>div]:bg-blue-500",
              gradient: "from-blue-500/5 to-transparent",
            };

            if (isDanger) {
              colorTheme = {
                cardBg: "bg-white dark:bg-[#0f1423]",
                border: "border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800",
                accentText: "text-red-600 dark:text-red-400",
                accentBg: "bg-red-50 dark:bg-red-900/20",
                progressBg: "bg-red-100 dark:bg-red-900/30",
                progressFill: "[&>div]:bg-red-500",
                gradient: "from-red-500/10 to-transparent",
              };
            } else if (isExcellent) {
              colorTheme = {
                cardBg: "bg-white dark:bg-[#0f1423]",
                border: "border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-800",
                accentText: "text-emerald-600 dark:text-emerald-400",
                accentBg: "bg-emerald-50 dark:bg-emerald-900/20",
                progressBg: "bg-emerald-100 dark:bg-emerald-900/30",
                progressFill: "[&>div]:bg-emerald-500",
                gradient: "from-emerald-500/10 to-transparent",
              };
            }

            return (
              <div key={i} className={`group relative p-4 sm:p-5 rounded-2xl border ${colorTheme.border} ${colorTheme.cardBg} shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden`}>
                
                {/* Subtle Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colorTheme.gradient} opacity-30 pointer-events-none`} />

                {/* Left: Icon and Subject Name */}
                <div className="flex items-center gap-4 w-full md:w-1/3 min-w-[200px] relative z-10">
                  <div className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center border border-white/50 dark:border-white/5 shadow-sm ${colorTheme.accentBg} ${colorTheme.accentText}`}>
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate pr-2" title={stat.subject}>
                      {stat.subject} <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">({stat.abbreviation})</span>
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {stat.total} Classes Total
                    </p>
                  </div>
                </div>
                
                {/* Middle: Progress Bar (Hidden on very small screens, visible md+) */}
                <div className="w-full md:flex-1 hidden sm:block relative z-10">
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance</span>
                     <span className={`text-sm font-black ${colorTheme.accentText}`}>{stat.percentage}%</span>
                   </div>
                   <Progress 
                     value={stat.percentage} 
                     max={100} 
                     className={`h-2.5 ${colorTheme.progressBg} ${colorTheme.progressFill} shadow-inner`} 
                   />
                </div>

                {/* Right: Stats Pills & Mobile Percentage */}
                <div className="flex items-center gap-4 w-full md:w-auto md:justify-end shrink-0 relative z-10">
                  
                  {/* Progress bar and % for Mobile Only */}
                  <div className="sm:hidden flex-1">
                     <div className="flex items-baseline gap-1 mb-1">
                       <span className={`text-xl font-black ${colorTheme.accentText}`}>{stat.percentage}%</span>
                     </div>
                     <Progress value={stat.percentage} max={100} className={`h-1.5 ${colorTheme.progressBg} ${colorTheme.progressFill}`} />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-emerald-50/80 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">{stat.present}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-red-50/80 dark:bg-red-900/20 px-3 py-1.5 rounded-xl border border-red-100/50 dark:border-red-900/30 shadow-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-bold text-sm text-red-600 dark:text-red-400">{stat.absent}</span>
                    </div>
                  </div>
                </div>
                
              </div>
            )
          })}
        </div>

        {/* Bar Chart */}
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800/80 shadow-sm bg-white dark:bg-[#0f1423] mt-6">
          <CardHeader className="pb-2 pt-8 px-8">
            <CardTitle className="text-lg">Class Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectStats}
                  margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis 
                    dataKey="abbreviation" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} 
                    dy={15} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#334155', opacity: 0.05}}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.subject;
                      }
                      return label;
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 500 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="present" name="Present" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="absent" name="Absent" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  )
}
