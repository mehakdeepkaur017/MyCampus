"use client"

import { useState, useEffect } from "react"
import { Calendar, Bell, Clock, FileText, User, BookOpen, AlertCircle, Pin, Activity, TrendingUp, CalendarClock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

type Task = { id: string, title: string, status: string, createdAt: string, priority: string, dueDate: string }
type Notice = { id: string, title: string, pinned: boolean, createdAt: string, content: string, type: "INFO" | "IMPORTANT" | "URGENT" | "EVENT" | "ACADEMIC" | "EXAM" | "GENERAL" | "EMERGENCY" }
type TimetableItem = { id: string, subject: string, room: string, startTime: string, endTime: string, faculty: string }
type Note = { id: string, title: string, category: string, updatedAt: string, content: string }
type Assignment = { id: string, title: string, subject: string, dueDate: string, points: number, submissions: any[] }

const NOTICE_CONFIG = {
  INFO: { color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800", icon: Bell, label: "Info" },
  IMPORTANT: { color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800", icon: AlertCircle, label: "Important" },
  URGENT: { color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800", icon: AlertCircle, label: "Urgent" },
  ACADEMIC: { color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800", icon: BookOpen, label: "Academic" },
  EVENT: { color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800", icon: Calendar, label: "Event" },
  EXAM: { color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800", icon: FileText, label: "Exam" },
  GENERAL: { color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700", icon: Pin, label: "General" },
  EMERGENCY: { color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800", icon: AlertCircle, label: "Emergency" },
};

export default function StudentDashboardOverview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [timetable, setTimetable] = useState<TimetableItem[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("Student")

  useEffect(() => {
    fetch("/api/student/profile")
      .then(res => res.json())
      .then(data => { 
        if (data.name) setUserName(data.name.split(' ')[0])
      })
      .catch(() => {})

    Promise.all([
      fetch("/api/student/tasks").then(r => r.json()).catch(() => []),
      fetch("/api/student/notices").then(r => r.json()).catch(() => []),
      fetch("/api/student/timetable").then(r => r.json()).catch(() => []),
      fetch("/api/student/attendance").then(r => r.json()).catch(() => ({ records: [] })),
      fetch("/api/student/notes").then(r => r.json()).catch(() => ({ personalNotes: [] })),
      fetch("/api/student/assignments").then(r => r.json()).catch(() => [])
    ]).then(([tasksData, noticesData, timetableData, attendanceData, notesData, assignmentsData]) => {
      setTasks(Array.isArray(tasksData) ? tasksData : [])
      setNotices(Array.isArray(noticesData) ? noticesData : [])
      setAttendance(attendanceData.records || [])
      setNotes(notesData.personalNotes || [])
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : [])
      
      const currentDay = format(new Date(), 'EEEE')
      if (Array.isArray(timetableData)) {
        setTimetable(timetableData.filter(t => t.day === currentDay).sort((a,b) => a.startTime.localeCompare(b.startTime)))
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    )
  }

  // Derived Data
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED')
  const urgentTasks = pendingTasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').slice(0, 4)
  
  const recentNotices = notices.slice(0, 5)
  const recentNotes = notes.slice(0, 4)
  const upcomingAssignments = assignments.filter(a => new Date(a.dueDate) >= new Date() && a.submissions.length === 0).slice(0, 4)
  
  const nowTime = format(new Date(), 'HH:mm')
  const nextClass = timetable.find(c => c.startTime > nowTime) || timetable[0]

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length
  const totalCount = attendance.length
  const overallAttendancePercent = totalCount === 0 ? 0 : Math.round((presentCount / totalCount) * 100)

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 font-sans pb-24">
      {/* Sleek Header */}
      <div className="mb-8 mt-2">
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">{format(new Date(), "EEEE, MMMM do")}</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {userName}
        </h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Attendance */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Attendance</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{overallAttendancePercent}%</p>
          </div>
        </div>

        {/* Next Class */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Next Class</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-none mt-1">{nextClass?.subject || 'Free Day'}</p>
            {nextClass && <p className="text-[10px] text-slate-400 mt-1">{nextClass.room}</p>}
          </div>
        </div>

        {/* Tasks Due */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Tasks Due</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{pendingTasks.length}</p>
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Notices</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{notices.length}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Today's Schedule */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Today's Schedule</h2>
              <Link href="/dashboard/timetable" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {timetable.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">No classes scheduled for today.</div>
              ) : (
                timetable.map((cls, idx) => {
                  const isCurrent = cls.startTime <= nowTime && cls.endTime >= nowTime;
                  const isPast = cls.endTime < nowTime;
                  
                  return (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                      {/* Marker */}
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white dark:border-[#0a0a0a] shadow-sm md:mx-auto absolute left-0 md:left-1/2 -translate-x-1.5 md:-translate-x-1/2 ${isCurrent ? 'bg-indigo-500 border-indigo-100 dark:border-indigo-900/50' : isPast ? 'bg-slate-300 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-800'}`}>
                        {isCurrent && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      
                      {/* Content Card */}
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] ml-10 md:ml-0 p-4 rounded-2xl bg-slate-50 dark:bg-[#111111] border border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-sm font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{cls.subject}</h3>
                          <span className="text-xs font-semibold text-slate-500">{cls.startTime} - {cls.endTime}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {cls.faculty}</span>
                          <span className="flex items-center gap-1"><Pin className="h-3 w-3" /> {cls.room}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          
          {/* Urgent Deadlines */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Urgent Tasks
              </h2>
              <Link href="/dashboard/tasks" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {urgentTasks.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">No urgent tasks due right now.</div>
              ) : (
                urgentTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#111111] hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Calendar className="h-3 w-3" /> {task.dueDate ? format(new Date(task.dueDate), "MMM do, yyyy") : "No set date"}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                      {task.priority}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Active Assignments
              </h2>
              <Link href="/dashboard/tasks" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {upcomingAssignments.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">No active assignments due right now.</div>
              ) : (
                upcomingAssignments.map((assignment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#111111] hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{assignment.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {assignment.subject}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {format(new Date(assignment.dueDate), "MMM do")}</span>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                      {assignment.points} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Announcements */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Announcements</h2>
              <Link href="/dashboard/notices" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentNotices.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">No recent notices.</div>
              ) : (
                recentNotices.map((notice, idx) => {
                  const conf = NOTICE_CONFIG[notice.type] || NOTICE_CONFIG.GENERAL;
                  const Icon = conf.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                      <div className={`mt-0.5 shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${conf.color.split(' ')[1]} ${conf.color.split(' ')[2]}`}>
                        <Icon className={`h-4 w-4 ${conf.color.split(' ')[0]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                           <span>{format(new Date(notice.createdAt), "MMM d")}</span>
                           <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                           <span className={conf.color.split(' ')[0]}>{conf.label}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Notes</h2>
              <Link href="/dashboard/notes" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentNotes.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-500">No personal notes found.</div>
              ) : (
                recentNotes.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{note.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                       <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-400">{note.category}</span>
                       <span>{format(new Date(note.updatedAt), "MMM d")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
