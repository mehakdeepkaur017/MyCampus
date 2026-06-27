"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  Users, 
  Calendar as CalendarIcon, 
  Save, 
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

type Student = {
  id: string
  name: string
  email: string
  department: string
  semester: number
  isActive: boolean
}

type AttendanceStatus = "PRESENT" | "ABSENT"

export default function AdminAttendancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedSubject, setSelectedSubject] = useState<string>("Machine Learning")
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL")
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL")
  
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({})

  const [timetableSubjects, setTimetableSubjects] = useState<string[]>([])
  const [timetableData, setTimetableData] = useState<any[]>([])

  // Derive subjects for the selected date's weekday
  useEffect(() => {
    if (timetableData.length === 0) return
    const date = new Date(selectedDate + "T00:00:00")
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayOfWeek = dayNames[date.getDay()]
    
    const daySubjects = Array.from(
      new Set(timetableData.filter((item: any) => item.day === dayOfWeek).map((item: any) => item.subject))
    ) as string[]
    
    setTimetableSubjects(daySubjects)
    if (daySubjects.length > 0) {
      if (!daySubjects.includes(selectedSubject)) {
        setSelectedSubject(daySubjects[0])
      }
    } else {
      setSelectedSubject("")
    }
  }, [selectedDate, timetableData])

  useEffect(() => {
    fetchStudents()
    fetchTimetableData()
  }, [])

  const fetchTimetableData = async () => {
    try {
      const res = await fetch("/api/admin/timetable")
      if (res.ok) {
        const data = await res.json()
        setTimetableData(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students")
      if (res.ok) {
        const data: Student[] = await res.json()
        // Only active students
        const activeStudents = data.filter(s => s.isActive)
        setStudents(activeStudents)
        
        // Initialize state to PRESENT for all
        const initialState: Record<string, AttendanceStatus> = {}
        activeStudents.forEach(s => {
          initialState[s.id] = "PRESENT"
        })
        setAttendanceState(initialState)
      }
    } catch (error) {
      toast.error("Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }))
  }

  const handleMarkAll = (status: AttendanceStatus) => {
    const newState = { ...attendanceState }
    filteredStudents.forEach(s => {
      newState[s.id] = status
    })
    setAttendanceState(newState)
  }

  const handleSave = async () => {
    if (!selectedDate) {
      toast.error("Please select a date")
      return
    }
    if (!selectedSubject) {
      toast.error("Please select a subject")
      return
    }

    // Only submit records for the filtered students currently in view
    const recordsToSubmit = filteredStudents.map(s => ({
      studentId: s.id,
      status: attendanceState[s.id] || "PRESENT"
    }))

    if (recordsToSubmit.length === 0) {
      toast.error("No students to mark attendance for")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          subject: selectedSubject,
          records: recordsToSubmit
        })
      })

      if (res.ok) {
        toast.success(`Attendance saved for ${recordsToSubmit.length} students`)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save attendance")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  // Get unique departments for filter
  const departments = Array.from(new Set(students.map(s => s.department).filter(Boolean)))
  
  const filteredStudents = students.filter(s => {
    if (departmentFilter !== "ALL" && s.department !== departmentFilter) return false;
    if (semesterFilter !== "ALL" && s.semester.toString() !== semesterFilter) return false;
    return true;
  })

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-500" />
            Attendance Management
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">Bulk mark student attendance by class and date.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="px-4 border-r border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Present</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
              {filteredStudents.filter(s => attendanceState[s.id] === "PRESENT").length}
            </p>
          </div>
          <div className="px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Absent</p>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 leading-none">
              {filteredStudents.filter(s => attendanceState[s.id] === "ABSENT").length}
            </p>
          </div>
        </div>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-[#0a0a0a] dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/30 shadow-md rounded-[2rem]">
        <div className="absolute -right-10 -top-10 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-8 relative z-10">
          <div className="grid gap-6 md:grid-cols-5 items-end">
            <div className="space-y-2.5 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-indigo-500" />
                <Input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/80 dark:bg-slate-900/80 border-indigo-100 dark:border-indigo-800 focus-visible:ring-indigo-500 font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2.5 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Subject</label>
              {timetableSubjects.length > 0 ? (
                <Select value={selectedSubject} onValueChange={(val) => setSelectedSubject(val || "")}>
                  <SelectTrigger className="h-12 rounded-xl bg-white/80 dark:bg-slate-900/80 border-indigo-100 dark:border-indigo-800 focus-visible:ring-indigo-500 font-medium">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-indigo-100 dark:border-indigo-800">
                    {timetableSubjects.map(sub => (
                      <SelectItem key={sub} value={sub} className="cursor-pointer font-medium">{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center px-4 gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                    No classes on {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" })}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-2.5 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Department</label>
              <Select value={departmentFilter} onValueChange={(val) => setDepartmentFilter(val || "ALL")}>
                <SelectTrigger className="h-12 rounded-xl bg-white/80 dark:bg-slate-900/80 border-indigo-100 dark:border-indigo-800 focus-visible:ring-indigo-500 font-medium">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-indigo-100 dark:border-indigo-800">
                  <SelectItem value="ALL" className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept} className="cursor-pointer font-medium">{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5 md:col-span-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Semester</label>
              <Select value={semesterFilter} onValueChange={(val) => setSemesterFilter(val || "ALL")}>
                <SelectTrigger className="h-12 rounded-xl bg-white/80 dark:bg-slate-900/80 border-indigo-100 dark:border-indigo-800 focus-visible:ring-indigo-500 font-medium">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-indigo-100 dark:border-indigo-800">
                  <SelectItem value="ALL" className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400">All Semesters</SelectItem>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()} className="cursor-pointer font-medium">Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-1">
              <Button onClick={handleSave} disabled={saving} className="h-12 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5">
                {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                Save Register
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3 ml-2">
          <Users className="h-5 w-5 text-indigo-500" /> 
          Students List 
          <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 py-1 px-2.5 rounded-lg text-sm font-black">{filteredStudents.length}</span>
        </h2>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleMarkAll("PRESENT")} className="h-11 rounded-xl font-bold text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 shadow-none">
            <CheckCircle2 className="mr-2 h-5 w-5" /> Mark All Present
          </Button>
          <Button variant="outline" onClick={() => handleMarkAll("ABSENT")} className="h-11 rounded-xl font-bold text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-900/10 dark:border-rose-900/30 shadow-none">
            <XCircle className="mr-2 h-5 w-5" /> Mark All Absent
          </Button>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-b-slate-200 dark:border-b-slate-800">
              <TableHead className="py-5 px-6 font-bold text-slate-500 tracking-wide">Student Identity</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-500 tracking-wide w-[300px] text-right">Attendance Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No students found</p>
                    <p className="text-sm">Try adjusting your department or semester filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b-slate-100 dark:border-b-slate-800 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-base">{student.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {student.department || "No Department"}
                          </span>
                          <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
                            Sem {student.semester}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-xl w-fit ml-auto border border-slate-200/50 dark:border-slate-800/50">
                      <Button
                        variant={attendanceState[student.id] === "PRESENT" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleStatusChange(student.id, "PRESENT")}
                        className={`h-9 px-4 rounded-lg font-bold transition-all ${
                          attendanceState[student.id] === "PRESENT" 
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" 
                            : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                      >
                        <CheckCircle2 className={`mr-2 h-4 w-4 ${attendanceState[student.id] === "PRESENT" ? "text-emerald-100" : ""}`} /> Present
                      </Button>
                      <Button
                        variant={attendanceState[student.id] === "ABSENT" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleStatusChange(student.id, "ABSENT")}
                        className={`h-9 px-4 rounded-lg font-bold transition-all ${
                          attendanceState[student.id] === "ABSENT" 
                            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-sm" 
                            : "text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        }`}
                      >
                        <XCircle className={`mr-2 h-4 w-4 ${attendanceState[student.id] === "ABSENT" ? "text-rose-100" : ""}`} /> Absent
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
