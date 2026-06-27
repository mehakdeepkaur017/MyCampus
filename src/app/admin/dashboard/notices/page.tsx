"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Pin,
  PinOff,
  Loader2,
  AlertTriangle,
  MessageSquare
} from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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

type Notice = {
  id: string
  title: string
  content: string
  type: "ACADEMIC" | "EVENT" | "EXAM" | "GENERAL" | "EMERGENCY"
  pinned: boolean
  createdAt: string
  admin: { name: string }
  department?: string
  semester?: number
}

const noticeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["ACADEMIC", "EVENT", "EXAM", "GENERAL", "EMERGENCY"]).default("GENERAL"),
  department: z.string().optional(),
  semester: z.string().optional(),
})

const typeColors = {
  ACADEMIC: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  EVENT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  EXAM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  GENERAL: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  EMERGENCY: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null)
  const [departments, setDepartments] = useState<string[]>(["Computer Science", "Information Technology", "Data Science", "Business Administration"])

  const form = useForm<z.infer<typeof noticeSchema>>({
    resolver: zodResolver(noticeSchema) as any,
    defaultValues: {
      title: "",
      content: "",
      type: "GENERAL",
      department: "All Departments",
      semester: "All Semesters",
    },
  })

  useEffect(() => {
    fetchNotices()
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const defaultDepts = ["Computer Science", "Information Technology", "Data Science", "Business Administration"]
      const res = await fetch("/api/admin/students")
      if (res.ok) {
        const data = await res.json()
        const dynamicDepts = data.map((s: any) => s.department).filter(Boolean)
        setDepartments(Array.from(new Set([...defaultDepts, ...dynamicDepts])) as string[])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/admin/notices")
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

  const onSubmit = async (values: z.infer<typeof noticeSchema>) => {
    try {
      const url = editingNotice 
        ? `/api/admin/notices/${editingNotice.id}`
        : "/api/admin/notices"
      const method = editingNotice ? "PUT" : "POST"

      const payload = {
        ...values,
        department: values.department === "All Departments" ? null : values.department,
        semester: values.semester === "All Semesters" ? null : parseInt(values.semester as string),
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(editingNotice ? "Notice updated" : "Notice published")
        handleCloseDialog()
        fetchNotices()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save notice")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const togglePin = async (notice: Notice) => {
    try {
      const res = await fetch(`/api/admin/notices/${notice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !notice.pinned })
      })

      if (res.ok) {
        toast.success(notice.pinned ? "Notice unpinned" : "Notice pinned to top")
        fetchNotices()
      } else {
        toast.error("Failed to pin/unpin notice")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const confirmDelete = async () => {
    if (!noticeToDelete) return
    
    try {
      const res = await fetch(`/api/admin/notices/${noticeToDelete.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Notice deleted permanently")
        setIsDeleteDialogOpen(false)
        fetchNotices()
      } else {
        toast.error("Failed to delete notice")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleOpenDialog = (notice?: Notice) => {
    if (notice) {
      setEditingNotice(notice)
      form.reset({ 
        title: notice.title,
        content: notice.content,
        type: notice.type,
        department: notice.department || "All Departments",
        semester: notice.semester?.toString() || "All Semesters"
      })
    } else {
      setEditingNotice(null)
      form.reset({ title: "", content: "", type: "GENERAL", department: "All Departments", semester: "All Semesters" })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingNotice(null)
    form.reset()
  }

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            Notice Board Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create, edit, and pin public campus announcements.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-bold transition-all hover:-translate-y-0.5 whitespace-nowrap">
          <Plus className="mr-2 h-5 w-5" /> Create Notice
        </Button>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-3xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No notices published</h3>
            <p className="text-slate-500 max-w-sm mt-2">Publish an announcement to notify all active students.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {notices.map((notice) => (
              <div 
                key={notice.id} 
                className={`relative flex flex-col p-6 rounded-[2rem] border transition-all shadow-sm hover:shadow-md group ${
                  notice.pinned 
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50" 
                    : "bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      {notice.pinned && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/50 dark:text-amber-400 border-none font-bold px-2.5 py-0.5">
                          <Pin className="mr-1 h-3.5 w-3.5" /> Pinned
                        </Badge>
                      )}
                      <Badge variant="outline" className={`font-bold px-2.5 py-0.5 border-0 ${typeColors[notice.type]}`}>
                        {notice.type}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white line-clamp-2 mt-3">
                      {notice.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      onClick={() => togglePin(notice)} 
                      size="icon" 
                      variant="ghost" 
                      className={`h-9 w-9 rounded-xl ${notice.pinned ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-100/50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                      title={notice.pinned ? "Unpin notice" : "Pin notice"}
                    >
                      {notice.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button onClick={() => handleOpenDialog(notice)} size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => {
                        setNoticeToDelete(notice)
                        setIsDeleteDialogOpen(true)
                      }} 
                      size="icon" 
                      variant="ghost" 
                      className="h-9 w-9 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap flex-1 mb-8 font-medium leading-relaxed">
                  {notice.content}
                </p>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-auto mb-5">
                  {notice.department || notice.semester ? (
                    <>
                      {notice.department && (
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-md text-xs font-bold">
                          {notice.department}
                        </span>
                      )}
                      {notice.semester && (
                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-md text-xs font-bold">
                          Sem {notice.semester}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md text-xs font-bold">
                      All Students
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-500 pt-1 mt-auto">
                  <span className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-600">{notice.admin.name.charAt(0).toUpperCase()}</div> {notice.admin.name}</span>
                  <span>{format(new Date(notice.createdAt), "MMM d, yyyy • h:mm a")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[600px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl bg-white dark:bg-[#0a0a0a]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{editingNotice ? "Edit Notice" : "Create Notice"}</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              {editingNotice 
                ? "Update the content of this announcement."
                : "Publish a new announcement for all students to see."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Campus Closure on Friday" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-transparent focus:ring-indigo-500 font-medium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-transparent focus:ring-indigo-500 font-medium">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                        <SelectItem value="EVENT">Event</SelectItem>
                        <SelectItem value="EXAM">Exam</SelectItem>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Target Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-transparent focus:ring-indigo-500 font-medium">
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="All Departments">All Departments</SelectItem>
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
                      <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Target Semester</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900/50 border-transparent focus:ring-indigo-500 font-medium">
                            <SelectValue placeholder="All Semesters" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="All Semesters">All Semesters</SelectItem>
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
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Message Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your announcement here..." 
                        className="min-h-[160px] resize-y rounded-xl bg-slate-50 dark:bg-slate-900/50 border-transparent focus:ring-indigo-500 font-medium p-4" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end pt-4">
                <Button type="submit" className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-bold transition-all hover:-translate-y-0.5">
                  {editingNotice ? "Save Changes" : "Publish Notice"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl bg-white dark:bg-[#0a0a0a]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 text-xl font-bold">
              <AlertTriangle className="h-6 w-6" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2 font-medium text-slate-600">
              Are you sure you want to permanently delete <strong>{noticeToDelete?.title}</strong>? 
              It will immediately be removed from all student dashboards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold">Yes, delete notice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
