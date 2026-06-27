"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, User, Loader2, CalendarDays, List, Grid, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { format, startOfWeek, addDays, getMonth, getYear, startOfMonth, endOfMonth, isSameDay, getDaysInMonth, getDay } from "date-fns"

import { Badge } from "@/components/ui/badge"

type TimetableItem = {
  id: string
  subject: string
  faculty: string
  room: string
  day: string
  startTime: string
  endTime: string
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Helper colors for subjects to make calendar colorful
const SUBJECT_COLORS: Record<string, string> = {
  "Machine Learning": "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
  "Cloud Computing": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  "Cybersecurity": "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
  "Data Science": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
  "Web Development": "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-800",
  "Artificial Intelligence": "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
}

const DEFAULT_COLOR = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700"

export default function TimetablePage() {
  const [schedule, setSchedule] = useState<TimetableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"daily" | "weekly">("daily")
  
  // Daily View State
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  


  useEffect(() => {
    // Determine current day to set as default if it's a weekday
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    if (WEEKDAYS.includes(today)) {
      setSelectedDay(today)
    }

    fetchTimetable()
  }, [])

  const fetchTimetable = async () => {
    try {
      const res = await fetch("/api/student/timetable")
      if (res.ok) {
        const data = await res.json()
        setSchedule(data)
      }
    } catch (error) {
      toast.error("Failed to fetch timetable")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
  }



  // -- Render Daily View --
  const renderDaily = () => {
    const daySchedule = schedule.filter(item => item.day === selectedDay).sort((a,b) => a.startTime.localeCompare(b.startTime))
    
    return (
      <div className="space-y-6">
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
          <div className="flex space-x-2 bg-slate-50 dark:bg-[#0f1423] border border-slate-100 dark:border-slate-800 p-1.5 rounded-2xl w-max shadow-sm">
            {WEEKDAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedDay === day 
                    ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {daySchedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-3xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No classes scheduled</h3>
            <p className="text-slate-500 max-w-sm mt-2">You have a free day! Enjoy your free time.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {daySchedule.map((item) => (
              <div 
                key={item.id} 
                className="relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-[#0f1423] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group hover:border-indigo-100 dark:hover:border-indigo-900"
              >
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className={SUBJECT_COLORS[item.subject] || DEFAULT_COLOR}>
                    {item.startTime} - {item.endTime}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2">
                  {item.subject}
                </h3>
                
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-400" />
                    <span>{item.faculty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    <span>{item.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // -- Render Weekly Grid View --
  const renderWeekly = () => {
    // Grid settings
    const START_HOUR = 9;
    const END_HOUR = 17;
    const HOURS = END_HOUR - START_HOUR;
    const PIXELS_PER_HOUR = 100;
    const GRID_HEIGHT = HOURS * PIXELS_PER_HOUR;

    const hours = Array.from({ length: HOURS + 1 }, (_, i) => {
      const h = START_HOUR + i;
      return `${h.toString().padStart(2, '0')}:00`;
    });
    
    // Helper to calculate top and height for a class block
    const getPositionStyle = (startTime: string, endTime: string) => {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const startInHours = startH + (startM / 60);
      const endInHours = endH + (endM / 60);
      
      const top = (startInHours - START_HOUR) * PIXELS_PER_HOUR;
      const height = (endInHours - startInHours) * PIXELS_PER_HOUR;
      
      return { top: `${top}px`, height: `${height}px` };
    };

    return (
      <div className="bg-white dark:bg-[#0f1423] border border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl p-6 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 mb-4">
            <div></div>
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#131b2f] py-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                {day}
              </div>
            ))}
          </div>
          
          {/* Time Grid */}
          <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 relative" style={{ height: `${GRID_HEIGHT}px` }}>
            
            {/* Time Labels */}
            <div className="relative border-r border-slate-100 dark:border-slate-800/60">
              {hours.map((hour, i) => (
                <div key={hour} className="absolute text-xs font-medium text-slate-400 right-4 w-12 text-right translate-y-[-50%]" style={{ top: `${i * PIXELS_PER_HOUR}px` }}>
                  {hour}
                </div>
              ))}
            </div>

            {/* Grid Background Lines (Optional, drawn behind day columns) */}
            <div className="absolute left-[76px] right-0 top-0 bottom-0 pointer-events-none z-0">
              {hours.map((_, i) => (
                <div key={i} className="absolute w-full border-t border-slate-100 dark:border-slate-800/60 border-dashed" style={{ top: `${i * PIXELS_PER_HOUR}px` }} />
              ))}
            </div>

            {/* Day Columns */}
            {WEEKDAYS.map(day => (
              <div key={day} className="relative h-full z-10 border-x border-slate-50/50 dark:border-slate-900/20 rounded-xl overflow-hidden bg-slate-50/30 dark:bg-[#131b2f]/30">
                {schedule.filter(s => s.day === day).map(cls => {
                  const style = getPositionStyle(cls.startTime, cls.endTime);
                  return (
                    <div 
                      key={cls.id} 
                      className={`absolute left-1 right-1 rounded-xl p-3 border shadow-sm ${SUBJECT_COLORS[cls.subject] || DEFAULT_COLOR} flex flex-col justify-center hover:scale-[1.02] transition-transform cursor-pointer`}
                      style={style}
                    >
                      <p className="font-bold text-[11px] leading-tight mb-1">{cls.subject}</p>
                      <p className="text-[10px] opacity-80 font-medium">{cls.startTime} - {cls.endTime}</p>
                      <p className="text-[10px] opacity-80 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="h-3 w-3 inline" /> {cls.room}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-200 p-2 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Class Timetable</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your academic schedule across different views.</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-200 dark:bg-[#131b2f] p-1 rounded-xl">
          <button 
            onClick={() => setView("daily")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'daily' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <List className="h-4 w-4" /> Daily
          </button>
          <button 
            onClick={() => setView("weekly")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'weekly' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Grid className="h-4 w-4" /> Weekly
          </button>

        </div>
      </div>

      {view === "daily" && renderDaily()}
      {view === "weekly" && renderWeekly()}


    </div>
  )
}
