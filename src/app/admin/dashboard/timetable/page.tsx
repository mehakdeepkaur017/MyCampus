"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, MapPin, User, Plus, Trash2, Pencil, Loader2, AlertTriangle, CalendarDays, List, Grid, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TimetableItem = {
  id: string
  subject: string
  faculty: string
  room: string
  day: string
  startTime: string
  endTime: string
  department?: string
  semester?: number
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Helper colors for subjects to make calendar colorful
const SUBJECT_COLORS: Record<string, string> = {
  "Machine Learning": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Cloud Computing": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Cybersecurity": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Data Science": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Web Development": "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  "Artificial Intelligence": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
}

const DEFAULT_COLOR = "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300"

const classSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  faculty: z.string().min(1, "Faculty is required"),
  room: z.string().min(1, "Room is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:MM"),
  department: z.string().min(1, "Department is required"),
  semester: z.coerce.number().min(1, "Semester is required").max(8),
}).refine(data => data.startTime < data.endTime, {
  message: "End time must be after start time",
  path: ["endTime"],
})

export default function AdminTimetablePage() {
  const [schedule, setSchedule] = useState<TimetableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"daily" | "weekly">("daily")
  const [departments, setDepartments] = useState<string[]>([])
  
  const [selectedDay, setSelectedDay] = useState<string>("Monday")
  const [selectedDept, setSelectedDept] = useState<string>("All Departments")
  const [selectedSem, setSelectedSem] = useState<string>("All Semesters")
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [editingClass, setEditingClass] = useState<TimetableItem | null>(null)
  const [classToDelete, setClassToDelete] = useState<TimetableItem | null>(null)

  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      subject: "",
      faculty: "",
      room: "",
      day: "Monday",
      startTime: "09:00",
      endTime: "10:30",
      department: "",
      semester: 1,
    },
  })

  useEffect(() => {
    fetchTimetable()
  }, [selectedDept, selectedSem])

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const defaultDepts = ["Computer Science", "Information Technology", "Data Science", "Business Administration"]
      const res = await fetch("/api/admin/students")
      if (res.ok) {
        const data = await res.json()
        const dynamicDepts = data.map((s: any) => s.department).filter(Boolean)
        const combined = Array.from(new Set([...defaultDepts, ...dynamicDepts])) as string[]
        setDepartments(combined)
      } else {
        setDepartments(defaultDepts)
      }
    } catch (error) {
      console.error(error)
      setDepartments(["Computer Science", "Information Technology", "Data Science", "Business Administration"])
    }
  }

  const fetchTimetable = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedDept && selectedDept !== "All Departments") params.append("department", selectedDept)
      if (selectedSem && selectedSem !== "All Semesters") params.append("semester", selectedSem)
      
      const res = await fetch(`/api/admin/timetable?${params.toString()}`)
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

  const onSubmit = async (values: z.infer<typeof classSchema>) => {
    try {
      const url = editingClass 
        ? `/api/admin/timetable/${editingClass.id}`
        : "/api/admin/timetable"
      const method = editingClass ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })

      if (res.ok) {
        toast.success(editingClass ? "Class updated" : "Class scheduled")
        handleCloseDialog()
        fetchTimetable()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save class")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const confirmDelete = async () => {
    if (!classToDelete) return
    
    try {
      const res = await fetch(`/api/admin/timetable/${classToDelete.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Class deleted")
        setIsDeleteDialogOpen(false)
        fetchTimetable()
      } else {
        toast.error("Failed to delete class")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleOpenDialog = (cls?: TimetableItem) => {
    if (cls) {
      setEditingClass(cls)
      form.reset({ 
        subject: cls.subject,
        faculty: cls.faculty,
        room: cls.room,
        day: cls.day,
        startTime: cls.startTime,
        endTime: cls.endTime,
        department: cls.department || "",
        semester: cls.semester || 1,
      })
    } else {
      setEditingClass(null)
      form.reset({ 
        subject: "", 
        faculty: "", 
        room: "", 
        day: selectedDay, 
        startTime: "09:00", 
        endTime: "10:30",
        department: selectedDept === "All Departments" ? "" : selectedDept,
        semester: selectedSem === "All Semesters" ? 1 : parseInt(selectedSem)
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingClass(null)
    form.reset()
  }
  
  const renderWeekly = () => {
    const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]
    return (
      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 mb-4">
            <div></div>
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-[#131b2f] py-3 rounded-xl">{day}</div>
            ))}
          </div>
          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-t border-slate-100 dark:border-slate-800/60 py-4 h-24">
                <div className="text-sm font-medium text-slate-500 text-right pr-4">{hour}</div>
                {WEEKDAYS.map(day => {
                  const hrPrefix = hour.substring(0, 2)
                  const cls = schedule.find(s => s.day === day && s.startTime.startsWith(hrPrefix))
                  return (
                    <div key={`${day}-${hour}`} className="relative h-full">
                      {cls && (
                        <div className={`absolute top-0 left-0 w-full rounded-xl p-3 border-0 shadow-sm ${SUBJECT_COLORS[cls.subject] || DEFAULT_COLOR} h-[90%] z-10 flex flex-col justify-center overflow-hidden transition-transform hover:scale-105 cursor-pointer`} onClick={() => handleOpenDialog(cls)}>
                          <p className="font-bold text-xs leading-tight mb-1">{cls.subject}</p>
                          <p className="text-[10px] opacity-80">{cls.startTime}-{cls.endTime}</p>
                          {(cls.department || cls.semester) && (
                            <p className="text-[9px] font-medium opacity-70 mt-1 truncate">
                              {cls.department && `${cls.department}`} {cls.semester && `Sem ${cls.semester}`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const daySchedule = schedule.filter(item => item.day === selectedDay).sort((a,b) => a.startTime.localeCompare(b.startTime))

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            Timetable Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage weekly class schedules, assign rooms, and prevent overlaps.</p>
        </div>
        
        <Button onClick={() => handleOpenDialog()} className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-bold transition-all hover:-translate-y-0.5 whitespace-nowrap">
          <Plus className="mr-2 h-5 w-5" /> Schedule Class
        </Button>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-full sm:w-[200px] h-11 bg-slate-50 dark:bg-slate-900/50 border-transparent rounded-xl font-medium focus:ring-indigo-500">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Departments">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSem} onValueChange={setSelectedSem}>
            <SelectTrigger className="w-full sm:w-[160px] h-11 bg-slate-50 dark:bg-slate-900/50 border-transparent rounded-xl font-medium focus:ring-indigo-500">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Semesters">All Semesters</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full sm:w-auto">
          <button onClick={() => setView("daily")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${view === 'daily' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>
            <List className="h-4 w-4" /> Daily
          </button>
          <button onClick={() => setView("weekly")} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${view === 'weekly' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>
            <Grid className="h-4 w-4" /> Weekly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
      ) : (
        <>
          {view === "daily" && (
            <div className="space-y-6">
              <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                <div className="flex space-x-2 bg-slate-50 dark:bg-slate-900/30 p-1.5 rounded-2xl w-max border border-slate-100 dark:border-slate-800">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        selectedDay === day 
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {daySchedule.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-[2rem] border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <Calendar className="h-14 w-14 text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No classes scheduled</h3>
                    <p className="text-slate-500 max-w-sm mt-2 font-medium">There are no classes scheduled for {selectedDay} matching the selected filters.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {daySchedule.map((item) => (
                      <div 
                        key={item.id} 
                        className="relative overflow-hidden p-6 rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-5">
                          <Badge variant="outline" className={`font-bold border-0 px-3 py-1 text-sm ${SUBJECT_COLORS[item.subject] || DEFAULT_COLOR}`}>
                            {item.startTime} - {item.endTime}
                          </Badge>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button onClick={() => handleOpenDialog(item)} size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => {
                                setClassToDelete(item)
                                setIsDeleteDialogOpen(true)
                              }} 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2">
                          {item.subject}
                        </h3>
                        
                        <div className="space-y-3 mt-auto pt-4 text-sm font-medium text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><User className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" /></div>
                              <span className="truncate">{item.faculty}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg"><MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" /></div>
                              <span className="truncate">{item.room}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {item.department && (
                              <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md text-xs font-bold">
                                {item.department}
                              </span>
                            )}
                            {item.semester && (
                              <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md text-xs font-bold">
                                Sem {item.semester}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "weekly" && renderWeekly()}
        </>
      )}


      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[425px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl bg-white dark:bg-[#0f1423]">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Edit Class" : "Schedule Class"}</DialogTitle>
            <DialogDescription>
              Set the timings, room, and faculty. The system will prevent double-booking automatically.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl><Input placeholder="Advanced Web Dev" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="faculty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faculty / Instructor</FormLabel>
                    <FormControl><Input placeholder="Prof. Smith" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select dept" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select sem" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <FormControl><Input placeholder="Lab 101" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 shadow-md shadow-indigo-600/20">
                  {editingClass ? "Update Class" : "Schedule"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl bg-white dark:bg-[#0f1423]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to remove <strong>{classToDelete?.subject}</strong> from the timetable?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl">Delete class</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
