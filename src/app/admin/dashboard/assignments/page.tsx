"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { 
  FileText, 
  Plus, 
  Trash2, 
  Loader2,
  Calendar,
  Eye,
  Download,
  CheckCircle2,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

type Submission = {
  id: string
  status: string
  submittedAt: string
  submissionUrl: string | null
  student: {
    name: string
    email: string
  }
}

type Assignment = {
  id: string
  title: string
  subject: string
  department?: string
  semester?: number
  dueDate: string
  documentUrl: string | null
  createdAt: string
  _count: {
    submissions: number
  }
  submissions: Submission[]
}

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  dueDate: z.string().min(1, "Due date is required"),
  department: z.string().optional(),
  semester: z.string().optional(),
})

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [viewingSubmissionsFor, setViewingSubmissionsFor] = useState<Assignment | null>(null)
  const [fileBase64, setFileBase64] = useState<string | null>(null)
  const [departments, setDepartments] = useState<string[]>(["Computer Science", "Information Technology", "Data Science", "Business Administration"])

  const form = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      subject: "",
      dueDate: "",
      department: "All Departments",
      semester: "All Semesters",
    },
  })

  useEffect(() => {
    fetchAssignments()
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

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/admin/assignments", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setAssignments(data)
      }
    } catch (error) {
      toast.error("Failed to fetch assignments")
    } finally {
      setLoading(false)
    }
  }

  const deleteAssignment = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all submissions.`)) return
    try {
      const res = await fetch(`/api/admin/assignments/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Assignment deleted successfully")
        fetchAssignments()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete assignment")
      }
    } catch (error) {
      toast.error("Failed to delete assignment")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileBase64(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  const onSubmit = async (values: z.infer<typeof assignmentSchema>) => {
    try {
      const payload = {
        ...values,
        department: values.department === "All Departments" ? null : values.department,
        semester: values.semester === "All Semesters" ? null : parseInt(values.semester as string),
        documentUrl: fileBase64
      }

      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Assignment created successfully")
        setIsCreateOpen(false)
        setFileBase64(null)
        form.reset()
        fetchAssignments()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to create assignment")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleViewAttachment = (dataUrl: string | null) => {
    if (!dataUrl) {
      toast.error("No attachment provided");
      return;
    }
    try {
      const parts = dataUrl.split(',');
      if (parts.length !== 2) return;
      const header = parts[0];
      const base64 = parts[1];
      const mimeMatch = header.match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : '';
      const byteString = atob(base64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      toast.error("Failed to open attachment");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Create assignments and track student submissions.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) setFileBase64(null)
        }}>
          <DialogTrigger className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-11 inline-flex items-center justify-center text-sm font-medium">
              <Plus className="mr-2 h-4 w-4" />
              New Assignment
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-0 overflow-hidden bg-white dark:bg-[#0f1423]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">
                Create New Assignment
              </DialogTitle>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Assignment Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Database Systems Midterm Project" className="h-11 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border-slate-200 dark:border-slate-800" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Computer Science" className="h-11 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border-slate-200 dark:border-slate-800" {...field} />
                      </FormControl>
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
                        <FormLabel className="text-slate-700 dark:text-slate-300">Target Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl h-11 bg-slate-50 dark:bg-[#0b0f19]">
                              <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
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
                        <FormLabel className="text-slate-700 dark:text-slate-300">Target Semester</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl h-11 bg-slate-50 dark:bg-[#0b0f19]">
                              <SelectValue placeholder="All Semesters" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
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
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-11 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border-slate-200 dark:border-slate-800" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-slate-700 dark:text-slate-300">Attachment (Optional)</FormLabel>
                  <Input 
                    type="file" 
                    onChange={handleFileChange}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-[#0b0f19] border-slate-200 dark:border-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-slate-500">Max file size: 5MB</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-11 px-5 border-slate-200 dark:border-slate-700">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting} className="rounded-xl h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white">
                    {form.formState.isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                    ) : (
                      'Create Assignment'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0f1423] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No assignments found</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Get started by creating a new assignment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-[#0f1423]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Due {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
                    </div>
                    <button
                      onClick={() => deleteAssignment(assignment.id, assignment.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{assignment.title}</h3>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">{assignment.subject}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {assignment.department && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {assignment.department}
                    </span>
                  )}
                  {assignment.semester && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Sem {assignment.semester}
                    </span>
                  )}
                  {!assignment.department && !assignment.semester && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      All Students
                    </span>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Submissions</span>
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                      {assignment._count.submissions}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setViewingSubmissionsFor(assignment)}
                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg"
                  >
                    View <Eye className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewingSubmissionsFor} onOpenChange={(open) => !open && setViewingSubmissionsFor(null)}>
        <DialogContent className="sm:max-w-[700px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-0 overflow-hidden bg-white dark:bg-[#0f1423]">
          {viewingSubmissionsFor && (
            <>
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  Submissions
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {viewingSubmissionsFor.submissions?.length || 0} Total
                  </span>
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{viewingSubmissionsFor.title}</p>
              </div>
              
              <div className="px-6 py-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {(!viewingSubmissionsFor.submissions || viewingSubmissionsFor.submissions.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-slate-200 dark:text-slate-800 mb-3" />
                    <h4 className="text-base font-medium text-slate-900 dark:text-white">No Submissions Yet</h4>
                    <p className="text-sm text-slate-500 mt-1">Students haven't submitted their work for this assignment.</p>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    {viewingSubmissionsFor.submissions.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b0f19]">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shadow-inner">
                            {sub.student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{sub.student.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-medium text-slate-500">{sub.student.rollNo}</span>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(sub.submittedAt), "MMM d, h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewAttachment(sub.submissionUrl)}
                          disabled={!sub.submissionUrl}
                          className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                        >
                          <Eye className="mr-2 h-4 w-4 text-slate-400" /> View Work
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0d14] flex justify-end">
                <Button onClick={() => setViewingSubmissionsFor(null)} className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white">
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
