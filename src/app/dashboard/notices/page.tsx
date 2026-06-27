"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { Bell, Loader2, BookOpen, Calendar as CalendarIcon, FileEdit, Info, AlertTriangle, Search, Pin, MessageSquare } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

type NoticeType = "ACADEMIC" | "EVENT" | "EXAM" | "GENERAL" | "EMERGENCY"

type Notice = {
  id: string
  title: string
  content: string
  type: NoticeType
  pinned: boolean
  createdAt: string
  admin: {
    name: string
    avatar: string | null
  }
}

const TYPE_CONFIG: Record<NoticeType, { color: string, gradient: string, icon: any, label: string }> = {
  ACADEMIC: {
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    gradient: "from-blue-50/50 to-transparent dark:from-blue-900/10",
    icon: BookOpen,
    label: "Academic"
  },
  EVENT: {
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    gradient: "from-purple-50/50 to-transparent dark:from-purple-900/10",
    icon: CalendarIcon,
    label: "Event"
  },
  EXAM: {
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    gradient: "from-amber-50/50 to-transparent dark:from-amber-900/10",
    icon: FileEdit,
    label: "Exam"
  },
  GENERAL: {
    color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
    gradient: "from-slate-50/50 to-transparent dark:from-slate-900/10",
    icon: Info,
    label: "General"
  },
  EMERGENCY: {
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    gradient: "from-red-50/50 to-transparent dark:from-red-900/10",
    icon: AlertTriangle,
    label: "Emergency"
  }
}

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<"ALL" | NoticeType>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch("/api/student/notices")
        if (res.ok) {
          const data = await res.json()
          setNotices(data)
        }
      } catch (error) {
        toast.error("Failed to fetch notices")
      } finally {
        setLoading(false)
      }
    }
    fetchNotices()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  const filteredNotices = notices
    .filter(n => activeFilter === "ALL" || n.type === activeFilter)
    .filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
  const pinnedNotices = filteredNotices.filter(n => n.pinned)
  const otherNotices = filteredNotices.filter(n => !n.pinned)

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Title Section (Matching the Image perfectly) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Bell className="h-7 w-7 text-red-500" strokeWidth={2.5} />
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">Notice Board</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[15px]">Stay updated with campus announcements and events</p>
      </div>

      {/* Search & Filters Section (Matching the Image) */}
      <div className="flex flex-col lg:flex-row items-center gap-4 py-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search notices..." 
            className="pl-10 h-12 w-full rounded-xl border-slate-200 dark:border-slate-800 text-[15px] focus-visible:ring-1 focus-visible:ring-red-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <FilterTab label="All" active={activeFilter === "ALL"} onClick={() => setActiveFilter("ALL")} />
          <FilterTab label="Academic" active={activeFilter === "ACADEMIC"} onClick={() => setActiveFilter("ACADEMIC")} />
          <FilterTab label="Event" active={activeFilter === "EVENT"} onClick={() => setActiveFilter("EVENT")} />
          <FilterTab label="Exam" active={activeFilter === "EXAM"} onClick={() => setActiveFilter("EXAM")} />
          <FilterTab label="General" active={activeFilter === "GENERAL"} onClick={() => setActiveFilter("GENERAL")} />
          <FilterTab label="Emergency" active={activeFilter === "EMERGENCY"} onClick={() => setActiveFilter("EMERGENCY")} />
        </div>
      </div>

      <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
        {filteredNotices.length} notices
      </div>

      {/* Notices Grid */}
      {filteredNotices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No notices found</h3>
          <p className="text-slate-500 max-w-sm mt-1">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {pinnedNotices.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2 px-1">
                <Pin className="h-3.5 w-3.5" /> Pinned Announcements
              </h2>
              <div className="flex flex-col gap-4">
                {pinnedNotices.map(notice => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            </div>
          )}

          {otherNotices.length > 0 && (
            <div className="space-y-4">
              {pinnedNotices.length > 0 && (
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                  Recent Announcements
                </h2>
              )}
              <div className="flex flex-col gap-4">
                {otherNotices.map(notice => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FilterTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 border ${
        active 
          ? "bg-[#0b1021] dark:bg-slate-100 text-white dark:text-slate-900 border-[#0b1021] dark:border-slate-100" 
          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      {label}
    </button>
  )
}

function NoticeCard({ notice }: { notice: Notice }) {
  const config = TYPE_CONFIG[notice.type] || TYPE_CONFIG.GENERAL;
  const Icon = config.icon;
  
  return (
    <div className={`group relative p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors flex flex-row items-start gap-4`}>
      
      {/* Icon */}
      <div className={`shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center bg-white dark:bg-black/20 shadow-sm border border-slate-100 dark:border-slate-800 ${config.color.split(' ')[1]}`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1.5">
          <div>
            <h3 className={`text-base sm:text-[17px] font-bold ${notice.pinned ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'} truncate max-w-full`}>
              {notice.title}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              {format(new Date(notice.createdAt), "dd MMM yyyy")}
            </p>
          </div>
          
          <div className="flex shrink-0 items-center gap-2">
            {notice.pinned && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded flex items-center gap-1 shadow-sm">
                <Pin className="h-3 w-3" /> Pinned
              </Badge>
            )}
            <Badge variant="outline" className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded border ${config.color} shadow-sm bg-white dark:bg-[#0a0d14]`}>
              {config.label}
            </Badge>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300/90 text-[13px] sm:text-[14px] line-clamp-1 sm:line-clamp-2 mt-1">
          {notice.content}
        </p>
      </div>
    </div>
  )
}
