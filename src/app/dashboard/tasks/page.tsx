"use client"

import { useState, useEffect, useMemo } from "react"
import { format, isBefore, isToday, startOfDay, parseISO } from "date-fns"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  Loader2,
  AlertCircle,
  Search,
  Filter,
  ListOrdered,
  Calendar,
  CheckSquare,
  ListTodo,
  AlertTriangle,
  PlayCircle,
  FileText,
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED"

type Task = {
  id: string
  title: string
  description: string | null
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate: string | null
  status: TaskStatus
  progress: number
  attachmentUrl: string | null
  createdAt: string
}

type AssignmentSubmission = {
  status: string
  submissionUrl: string | null
  submittedAt: string
}

type Assignment = {
  id: string
  title: string
  subject: string
  dueDate: string
  documentUrl: string | null
  createdAt: string
  submissions: AssignmentSubmission[]
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  attachmentUrl: z.string().optional().nullable(),
})

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  ALL: "All Priorities"
}

const SORT_LABELS: Record<string, string> = {
  dueDate: "Due Date",
  createdDesc: "Newest First",
  createdAsc: "Oldest First"
}

const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed"
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTaskFile, setSelectedTaskFile] = useState<File | null>(null)
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [activeTab, setActiveTab] = useState<"personal" | "assignments">("personal")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  
  const [selectedAssignmentFile, setSelectedAssignmentFile] = useState<{ id: string; file: File } | null>(null)
  const [assignmentRemarks, setAssignmentRemarks] = useState("")

  const [assignmentSearch, setAssignmentSearch] = useState("")
  const [assignmentSubjectFilter, setAssignmentSubjectFilter] = useState("all")

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState("dueDate")

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  })

  useEffect(() => {
    fetchTasks()
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/student/assignments")
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments || [])
        setAvailableSubjects(data.subjects || [])
      }
    } catch (error) {
      toast.error("Failed to fetch assignments")
    }
  }

  const submitAssignment = async (id: string, file: File) => {
    try {
      const simulatedUrl = URL.createObjectURL(file);
      const res = await fetch(`/api/student/assignments/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionUrl: simulatedUrl, remarks: assignmentRemarks })
      });
      if (res.ok) {
        toast.success("Assignment submitted successfully!");
        setSelectedAssignmentFile(null);
        setAssignmentRemarks("");
        fetchAssignments();
      } else {
        toast.error("Failed to submit assignment");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  }

  const handleFileUpload = (id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 25 * 1024 * 1024) {
          toast.error("File size must be under 25MB");
          return;
        }
        setSelectedAssignmentFile({ id, file });
        setAssignmentRemarks("");
      }
    };
    input.click();
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/student/tasks")
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      toast.error("Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (task: Task, newStatus: TaskStatus) => {
    let updatedProgress = task.progress;
    if (newStatus === "COMPLETED") updatedProgress = 100;
    else if (newStatus === "TODO") updatedProgress = 0;
    else if (newStatus === "IN_PROGRESS" && task.progress === 0) updatedProgress = 10;
    else if (newStatus === "IN_PROGRESS" && task.progress === 100) updatedProgress = 90;

    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus, progress: updatedProgress } : t))
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...selectedTask, status: newStatus, progress: updatedProgress })
    }
    
    try {
      await fetch(`/api/student/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, progress: updatedProgress })
      })
    } catch (error) {
      toast.error("Failed to update status")
      fetchTasks()
    }
  }

  const updateTaskProgress = async (task: Task, newProgress: number) => {
    let newStatus = task.status;
    if (newProgress === 100) newStatus = "COMPLETED";
    else if (newProgress > 0) newStatus = "IN_PROGRESS";
    else if (newProgress === 0 && !task.status) newStatus = "TODO";

    setTasks(tasks.map(t => t.id === task.id ? { ...t, progress: newProgress, status: newStatus } : t))
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...selectedTask, progress: newProgress, status: newStatus })
    }
    
    try {
      await fetch(`/api/student/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: newProgress, status: newStatus })
      })
    } catch (error) {
      toast.error("Failed to update progress")
      fetchTasks()
    }
  }

  const cycleStatus = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    const cycle: Record<TaskStatus, TaskStatus> = {
      TODO: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "TODO"
    }
    updateTaskStatus(task, cycle[task.status])
  }

  const deleteTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setTasks(tasks.filter(t => t.id !== id))
    try {
      await fetch(`/api/student/tasks/${id}`, { method: "DELETE" })
      toast.success("Task deleted")
    } catch (error) {
      toast.error("Failed to delete task")
      fetchTasks()
    }
  }

  const onSubmit = async (values: z.infer<typeof taskSchema>) => {
    try {
      const payload = { ...values }
      if (selectedTaskFile) {
        payload.attachmentUrl = URL.createObjectURL(selectedTaskFile)
      }

      const res = await fetch("/api/student/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast.success("Task created")
        setIsCreateOpen(false)
        form.reset()
        setSelectedTaskFile(null)
        fetchTasks()
      } else {
        const errorData = await res.json().catch(() => null)
        toast.error(`Error: ${errorData?.details || errorData?.error || "Failed to create task"}`)
        console.error("API Error Response:", errorData)
      }
    } catch (error: any) {
      toast.error(`Network Error: ${error.message || "Something went wrong"}`)
    }
  }

  const handleTaskFileUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/pdf,image/*,.doc,.docx"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (file.size > 25 * 1024 * 1024) {
          toast.error("File size must be under 25MB")
          return
        }
        setSelectedTaskFile(file)
      }
    }
    input.click()
  }

  const openDetails = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  // Derived Analytics
  const totalTasks = tasks.length
  const completedTasksCount = tasks.filter(t => t.status === "COMPLETED").length
  const pendingTasksCount = totalTasks - completedTasksCount
  const highPriorityPendingCount = tasks.filter(t => t.status !== "COMPLETED" && t.priority === "HIGH").length
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasksCount / totalTasks) * 100)

  // Filtered & Sorted Tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks]

    // 1. Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase()
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
      )
    }

    // 2. Priority filter
    if (priorityFilter !== "ALL") {
      result = result.filter(t => t.priority === priorityFilter)
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      } else if (sortBy === "createdAsc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else {
        // createdDesc
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [tasks, searchQuery, priorityFilter, sortBy])

  const pendingTasks = processedTasks.filter(t => t.status !== "COMPLETED")
  const completedTasks = processedTasks.filter(t => t.status === "COMPLETED")

  // Smart Grouping for Pending Tasks
  const today = startOfDay(new Date())
  const overdueTasks = pendingTasks.filter(t => t.dueDate && isBefore(parseISO(t.dueDate), today))
  const todayTasks = pendingTasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)))
  const upcomingTasks = pendingTasks.filter(t => t.dueDate && !isBefore(parseISO(t.dueDate), today) && !isToday(parseISO(t.dueDate)))
  const noDateTasks = pendingTasks.filter(t => !t.dueDate)

  const priorityColors = {
    LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    HIGH: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"
  }
  
  const statusColors = {
    TODO: "border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500 hover:text-indigo-500 bg-transparent",
    IN_PROGRESS: "border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
    COMPLETED: "bg-emerald-500 border-emerald-500 text-white" 
  }

  const getStatusIcon = (status: TaskStatus) => {
    if (status === "TODO") return <Circle className="h-4 w-4" />
    if (status === "IN_PROGRESS") return <PlayCircle className="h-4 w-4 fill-current" />
    return <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
  }

  const renderTaskCard = (task: Task, isOverdue = false) => {
    const isCompleted = task.status === "COMPLETED"
    const isInProgress = task.status === "IN_PROGRESS"
    
    return (
      <div 
        key={task.id} 
        onClick={() => openDetails(task)}
        className={`group relative flex flex-col gap-3 p-5 rounded-[1.5rem] bg-white dark:bg-slate-900/40 cursor-pointer transition-all duration-300 ${
          isCompleted 
            ? "border border-slate-100 dark:border-slate-800/80 shadow-sm opacity-60 grayscale-[0.3]" 
            : isInProgress
              ? "border border-indigo-200 dark:border-indigo-800 shadow-md shadow-indigo-100/20 dark:shadow-indigo-900/10 hover:shadow-lg"
              : isOverdue 
                ? "border border-rose-200 dark:border-rose-900/50 shadow-md shadow-rose-100/20 dark:shadow-rose-900/10 hover:shadow-lg" 
                : "border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-3 w-full">
          <h3 className={`font-bold text-[16px] leading-tight transition-colors ${isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`}>
            {task.title}
          </h3>
          <Badge variant="secondary" className={`text-[9px] uppercase font-black tracking-widest shrink-0 rounded-md px-2 py-0.5 ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1.5 -mt-1">
            <Calendar className={`h-3 w-3 ${isOverdue && !isCompleted ? "text-rose-500" : "text-slate-400"}`} />
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isCompleted ? "text-slate-400" : 
              isOverdue ? "text-rose-500" : 
              isToday(parseISO(task.dueDate)) ? "text-amber-500" : 
              "text-slate-500"
            }`}>
              {isOverdue && !isCompleted ? "Overdue" : isToday(parseISO(task.dueDate)) && !isCompleted ? "Due Today" : format(parseISO(task.dueDate), "MMM d, yyyy")}
            </span>
          </div>
        )}
        
        {task.description && (
          <p className={`text-xs line-clamp-2 leading-relaxed ${isCompleted ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
            {task.description}
          </p>
        )}
        
        {isInProgress && (
          <div className="mt-1 flex items-center gap-3 w-full">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${task.progress}%` }} />
            </div>
            <span className="text-[10px] font-black text-slate-400 shrink-0">{task.progress}%</span>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between w-full">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => updateTaskStatus(task, "TODO")}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${task.status === "TODO" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
            >
              To Do
            </button>
            <button 
              onClick={() => updateTaskStatus(task, "IN_PROGRESS")}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${task.status === "IN_PROGRESS" ? "bg-indigo-500 shadow-sm text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
            >
              In Progress
            </button>
            <button 
              onClick={() => updateTaskStatus(task, "COMPLETED")}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${task.status === "COMPLETED" ? "bg-emerald-500 shadow-sm text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
            >
              Completed
            </button>
          </div>
          
          <button 
            onClick={(e) => deleteTask(e, task.id)} 
            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Task Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organize your assignments and boost productivity.</p>
        </div>
        {activeTab === "personal" && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold h-11 px-6" />
          }>
            <Plus className="mr-2 h-5 w-5" />
            New Task
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 border-none shadow-2xl bg-white dark:bg-[#0f1423]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-white">Create New Task</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Add a new task to your personal board.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Complete math worksheet" className="rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500 bg-slate-50/50 dark:bg-slate-900/50 h-12 px-4 shadow-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Description (Optional)</FormLabel>
                      <FormControl>
                        <textarea 
                          placeholder="Add more details about this task..." 
                          className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 min-h-[100px] resize-none" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="rounded-xl h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Attachment (Optional)</FormLabel>
                  {selectedTaskFile ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{selectedTaskFile.name}</span>
                      </div>
                      <button type="button" onClick={() => setSelectedTaskFile(null)} className="text-slate-400 hover:text-red-500 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" onClick={handleTaskFileUpload} className="w-full h-12 rounded-xl border-dashed border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Attachment (PDF, Image, Doc)
                    </Button>
                  )}
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white px-6">
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Task
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Premium Segmented Control */}
      <div className="flex justify-center mb-10 mt-2">
        <div className="bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl inline-flex w-full max-w-[400px] relative shadow-inner border border-slate-200/50 dark:border-slate-700/50">
          <div 
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#0f1423] rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-transform duration-300 ease-out z-0"
            style={{ transform: activeTab === "assignments" ? "translateX(100%)" : "translateX(0)" }}
          />
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-all duration-300 ${activeTab === "personal" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Personal Tasks
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex-1 relative z-10 py-2.5 text-sm font-bold transition-all duration-300 ${activeTab === "assignments" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
          >
            Assignments
          </button>
        </div>
      </div>

      <div className="relative">
        {activeTab === "personal" ? (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* Premium Analytics Banner */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm">
              <div className="absolute top-0 right-0 w-96 h-96 bg-slate-200/50 dark:bg-slate-800/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-200/30 dark:bg-slate-800/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">
                    {pendingTasksCount === 0 ? "You're all caught up!" : `You have ${pendingTasksCount} tasks pending.`}
                  </h2>
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    {highPriorityPendingCount > 0 ? (
                      <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                        <AlertTriangle className="h-4 w-4" /> {highPriorityPendingCount} high priority tasks need attention.
                      </span>
                    ) : (
                      "Keep up the great work. No high priority tasks right now."
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6 bg-white/60 dark:bg-[#0a0a0a]/40 backdrop-blur-md p-4 px-6 rounded-2xl border border-white dark:border-slate-800/50 shadow-sm shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{completedTasksCount}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 mt-0.5">Completed</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalTasks}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 mt-0.5">Total Tasks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 rounded-2xl bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val || "ALL")}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm min-w-[140px]">
                    <SelectValue>
                      {PRIORITY_LABELS[priorityFilter] || "Priority"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="ALL">All Priorities</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(val) => setSortBy(val || "dueDate")}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 shadow-sm min-w-[140px]">
                    <SelectValue>
                      {SORT_LABELS[sortBy] || "Sort By"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="createdDesc">Newest</SelectItem>
                    <SelectItem value="createdAsc">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Task Lists Symmetrical Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Active Tasks Column */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                    <ListTodo className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Tasks</h3>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Needs Attention</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-black text-sm px-3 py-1 rounded-xl">
                    {pendingTasks.length}
                  </Badge>
                </div>

                <div className="space-y-4 flex-1">
                  {pendingTasks.length === 0 ? (
                    <div className="p-8 h-full min-h-[200px] flex flex-col items-center justify-center text-center rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800">
                      <CheckCircle2 className="h-8 w-8 text-slate-400 mb-3" />
                      <p className="text-slate-500 font-bold">You're all caught up!</p>
                      <p className="text-slate-400 text-sm mt-1">No active tasks right now.</p>
                    </div>
                  ) : (
                    pendingTasks.map(task => {
                      const isOverdue = task.dueDate ? isBefore(parseISO(task.dueDate), startOfDay(new Date())) : false;
                      return renderTaskCard(task, isOverdue);
                    })
                  )}
                </div>
              </div>

              {/* Completed Tasks Column */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 p-6 shadow-sm flex flex-col h-full">
                <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Completed</h3>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Finished Work</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-black text-sm px-3 py-1 rounded-xl">
                    {completedTasks.length}
                  </Badge>
                </div>
                
                <div className="space-y-4 flex-1">
                  {completedTasks.length === 0 ? (
                    <div className="p-8 h-full min-h-[200px] flex flex-col items-center justify-center text-center rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-500 font-bold">No completed tasks yet.</p>
                      <p className="text-slate-400 text-sm mt-1">Check off tasks to see them here.</p>
                    </div>
                  ) : (
                    completedTasks.map(task => renderTaskCard(task))
                  )}
                </div>
              </div>
            </div>
      {/* Task Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl">
          <DialogHeader className="pr-6">
            <DialogTitle className={`text-xl leading-tight ${selectedTask?.status === "COMPLETED" ? "line-through text-slate-500" : ""}`}>
              {selectedTask?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              {selectedTask && (
                <Badge variant="secondary" className={`uppercase font-bold tracking-wider ${priorityColors[selectedTask.priority]}`}>
                  {selectedTask.priority} Priority
                </Badge>
              )}
              
              {selectedTask && (
                <div className="flex items-center">
                  <span className="text-sm text-slate-500 mr-2 font-medium">Status:</span>
                  <Select 
                    value={selectedTask.status} 
                    onValueChange={(val) => {
                      if (!val) return;
                      // If manually changing to completed, auto-set progress to 100
                      if (val === "COMPLETED") updateTaskProgress(selectedTask, 100);
                      // If manually changing to Todo, auto-set progress to 0
                      else if (val === "TODO") updateTaskProgress(selectedTask, 0);
                      else updateTaskStatus(selectedTask, val);
                    }}
                  >
                    <SelectTrigger className="h-8 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 w-[140px]">
                      <SelectValue>{STATUS_LABELS[selectedTask.status]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {selectedTask && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">Progress</h4>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedTask.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedTask.progress ?? 0}
                  onChange={(e) => updateTaskProgress(selectedTask, parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {selectedTask?.dueDate && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Due Date
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {format(parseISO(selectedTask.dueDate), "EEEE, MMMM d, yyyy")}
                  </div>
                </div>
              )}
              
              {selectedTask?.createdAt && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Created
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {format(new Date(selectedTask.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white">Description</h4>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-300 min-h-[100px] whitespace-pre-wrap">
                {selectedTask?.description || "No description provided for this task."}
              </div>
            </div>

            {selectedTask?.attachmentUrl && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">Attachment</h4>
                <a href={selectedTask.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 transition-colors shadow-sm w-fit pr-6 group">
                  <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">View Attached File</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click to open in new tab</p>
                  </div>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
        </div>
        ) : (
        <div className="animate-in fade-in duration-500 space-y-8">
          {/* Top Analytics Row */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="relative overflow-hidden group p-6 rounded-[2rem] bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/20 dark:to-[#0a0a0a] border border-indigo-100/50 dark:border-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors shadow-sm">
              <div className="absolute -right-6 -top-6 h-24 w-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">Total Assigned</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{assignments.length}</p>
                </div>
                <div className="h-14 w-14 bg-white dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-50 dark:border-indigo-800/50">
                  <ListTodo className="h-7 w-7" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden group p-6 rounded-[2rem] bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-[#0a0a0a] border border-emerald-100/50 dark:border-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors shadow-sm">
              <div className="absolute -right-6 -top-6 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Successfully Done</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                    {assignments.filter(a => a.submissions.length > 0).length}
                  </p>
                </div>
                <div className="h-14 w-14 bg-white dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-50 dark:border-emerald-800/50">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden group p-6 rounded-[2rem] bg-gradient-to-br from-rose-50/80 to-white dark:from-rose-950/20 dark:to-[#0a0a0a] border border-rose-100/50 dark:border-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800 transition-colors shadow-sm">
              <div className="absolute -right-6 -top-6 h-24 w-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">Needs Submission</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                    {assignments.filter(a => a.submissions.length === 0).length}
                  </p>
                </div>
                <div className="h-14 w-14 bg-white dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-rose-50 dark:border-rose-800/50">
                  <AlertTriangle className="h-7 w-7" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="space-y-6">
              {/* Search Bar */}
              <div className="bg-white dark:bg-[#0a0a0a] p-3 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    placeholder="Search assignments by title..." 
                    className="pl-12 border-none bg-transparent shadow-none focus-visible:ring-0 h-12 text-base placeholder:text-slate-400"
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                  />
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
                <Select value={assignmentSubjectFilter} onValueChange={(val) => setAssignmentSubjectFilter(val || "all")}>
                  <SelectTrigger className="w-full sm:w-[180px] border-none shadow-none bg-slate-50 dark:bg-slate-900/50 focus:ring-0 focus:ring-offset-0 font-bold h-12 rounded-xl sm:mr-1">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Subjects</SelectItem>
                    {availableSubjects.map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Assignments */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Active Assignments
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1">Pending your submission</p>
                  </div>
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 font-black text-sm px-4 py-1.5 rounded-xl">
                    {assignments.filter(a => a.submissions.length === 0).length} Pending
                  </Badge>
                </div>
                
                <div className="space-y-6">
                  {assignments
                    .filter(a => a.submissions.length === 0)
                    .filter(a => assignmentSubjectFilter === "all" || a.subject === assignmentSubjectFilter)
                    .filter(a => a.title.toLowerCase().includes(assignmentSearch.toLowerCase()))
                    .map(assignment => {
                      const isDueSoon = isBefore(parseISO(assignment.dueDate), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
                      return (
                      <div key={assignment.id} className="flex flex-col lg:flex-row gap-6 p-6 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 group hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all">
                        {/* Due Date Calendar Block */}
                        <div className="flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 rounded-2xl h-24 w-24 shrink-0 shadow-sm">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isDueSoon ? "text-rose-500" : "text-indigo-500"}`}>{format(new Date(assignment.dueDate), "MMM")}</span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white">{format(new Date(assignment.dueDate), "dd")}</span>
                          <span className="text-[10px] font-bold text-slate-400">{format(new Date(assignment.dueDate), "yyyy")}</span>
                        </div>

                        <div className="flex-1 space-y-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2 bg-white dark:bg-slate-900 text-[10px] uppercase font-black tracking-widest border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                {assignment.subject}
                              </Badge>
                              <h4 className="font-bold text-xl text-slate-900 dark:text-white leading-tight">{assignment.title}</h4>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Assignment Brief.pdf</p>
                                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Provided by Instructor</p>
                              </div>
                            </div>
                            {assignment.documentUrl ? (
                              <a href={assignment.documentUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg transition-colors">
                                View
                              </a>
                            ) : (
                              <span className="text-sm text-slate-400 italic font-medium px-4">Unavailable</span>
                            )}
                          </div>

                          <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Submission</p>
                                <div className="flex items-center gap-2">
                                  <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                                  </span>
                                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">Action Required</span>
                                </div>
                              </div>
                              
                              <div className="w-full md:w-auto">
                                {selectedAssignmentFile?.id === assignment.id ? (
                                  <div className="flex flex-col gap-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 w-full md:w-[350px]">
                                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                      <div className="flex items-center gap-2 overflow-hidden px-2">
                                        <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{selectedAssignmentFile.file.name}</span>
                                      </div>
                                      <button onClick={() => setSelectedAssignmentFile(null)} className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <Input 
                                      placeholder="Add remarks for your teacher (optional)..." 
                                      className="h-10 rounded-xl text-sm bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-800/50 focus-visible:ring-indigo-500"
                                      value={assignmentRemarks}
                                      onChange={(e) => setAssignmentRemarks(e.target.value)}
                                    />
                                    <Button onClick={() => submitAssignment(assignment.id, selectedAssignmentFile.file)} className="h-10 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
                                      Confirm Submission
                                    </Button>
                                  </div>
                                ) : (
                                  <Button onClick={() => handleFileUpload(assignment.id)} className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-bold h-12 px-6 w-full md:w-auto shadow-sm hover:shadow-md transition-all">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Upload Work
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )})}
                  {assignments.filter(a => a.submissions.length === 0).length === 0 && (
                     <div className="flex flex-col items-center justify-center py-16 text-center">
                       <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                         <CheckCircle2 className="h-10 w-10" />
                       </div>
                       <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Active Assignments</h4>
                       <p className="text-slate-500">You're completely caught up with your coursework!</p>
                     </div>
                  )}
                </div>
              </div>

              {/* Completed History */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/80">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Submission History
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 mt-1">Assignments you have completed</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-black text-sm px-4 py-1.5 rounded-xl">
                    {assignments.filter(a => a.submissions.length > 0).length} Completed
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {assignments
                    .filter(a => a.submissions.length > 0)
                    .filter(a => assignmentSubjectFilter === "all" || a.subject === assignmentSubjectFilter)
                    .filter(a => a.title.toLowerCase().includes(assignmentSearch.toLowerCase()))
                    .map(assignment => (
                    <div key={assignment.id} className="flex flex-col md:flex-row gap-5 p-6 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10 hover:border-emerald-200 transition-colors">
                      <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white strike-through line-through opacity-70">{assignment.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-emerald-200 text-emerald-700 dark:text-emerald-400 rounded-md">
                              {assignment.subject}
                            </Badge>
                            <span className="text-xs font-bold text-slate-500">
                              Submitted {format(new Date(assignment.submissions[0].submittedAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        <a href={assignment.submissions[0].submissionUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-center h-12 px-6 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm transition-all w-full md:w-auto">
                          View Submission
                        </a>
                      </div>
                    </div>
                  ))}
                  {assignments.filter(a => a.submissions.length > 0).length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-sm font-bold">
                      No completed assignments yet.
                    </div>
                  )}
                </div>
              </div>
              
            </div>
        </div>
        )}
      </div>
    </div>
  )
}
