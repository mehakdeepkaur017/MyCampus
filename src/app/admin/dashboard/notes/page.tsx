"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Loader2,
  Pencil,
  Paperclip,
  X,
  FileText,
  Download,
  Eye,
  Briefcase,
  GraduationCap,
  LayoutList,
  User as UserIcon,
} from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type AdminNote = {
  id: string
  title: string
  content: string
  category: string
  subject: string | null
  attachmentUrl: string | null
  department?: string
  semester?: number
  updatedAt: string
}

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  subject: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
  department: z.string().optional(),
  semester: z.string().optional(),
})

const CATEGORIES = [
  { id: "Study", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  { id: "Project", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800" },
  { id: "Assignment", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "Personal", icon: UserIcon, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" },
  { id: "General", icon: LayoutList, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" },
]

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<AdminNote[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null)
  const [viewingNote, setViewingNote] = useState<AdminNote | null>(null)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All")
  const [activeSubject, setActiveSubject] = useState<string>("All")
  const [subjects, setSubjects] = useState<string[]>([])
  const [departments, setDepartments] = useState<string[]>(["Computer Science", "Information Technology", "Data Science", "Business Administration"])
  
  const filteredNotes = notes
    .filter(n => activeCategoryFilter === "All" || n.category === activeCategoryFilter)
    .filter(n => activeSubject === "All" || n.subject === activeSubject)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema as any),
    defaultValues: {
      title: "",
      content: "",
      category: "General",
      subject: null,
      attachmentUrl: null,
      department: "All Departments",
      semester: "All Semesters",
    },
  })

  useEffect(() => {
    fetchNotes()
    fetchSubjects()
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

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/admin/timetable")
      if (res.ok) {
        const data = await res.json()
        const uniqueSubjects = Array.from(new Set(data.map((item: any) => item.subject))) as string[]
        setSubjects(uniqueSubjects)
      }
    } catch (e) {}
  }

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/admin/notes")
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    } catch (error) {
      toast.error("Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
    try {
      await fetch(`/api/admin/notes/${id}`, { method: "DELETE" })
      toast.success("Note deleted")
    } catch (error) {
      toast.error("Failed to delete note")
      fetchNotes()
    }
  }

  const onSubmit = async (values: z.infer<typeof noteSchema>) => {
    try {
      const url = editingNote 
        ? `/api/admin/notes/${editingNote.id}`
        : "/api/admin/notes"
      const method = editingNote ? "PUT" : "POST"

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
        toast.success(editingNote ? "Note updated" : "Note created")
        handleCloseDialog()
        fetchNotes()
      } else {
        toast.error("Failed to save note")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleOpenDialog = (note?: AdminNote) => {
    if (note) {
      setEditingNote(note)
      form.reset({
        title: note.title,
        content: note.content,
        category: note.category,
        subject: note.subject,
        attachmentUrl: note.attachmentUrl,
        department: note.department || "All Departments",
        semester: note.semester?.toString() || "All Semesters"
      })
    } else {
      setEditingNote(null)
      form.reset({
        title: "",
        content: "",
        category: "General",
        subject: null,
        attachmentUrl: null,
        department: "All Departments",
        semester: "All Semesters"
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingNote(null)
    form.reset()
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      form.setValue("attachmentUrl", reader.result as string)
      toast.success("File attached successfully!")
    }
    reader.onerror = () => {
      toast.error("Failed to read file")
    }
    reader.readAsDataURL(file)
  }

  const removeAttachment = () => {
    form.setValue("attachmentUrl", null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleViewAttachment = (dataUrl: string) => {
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
      const newWindow = window.open(blobUrl, '_blank');
      
      if (newWindow) {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      }
    } catch (err) {
      console.error("Failed to open attachment", err);
      toast.error("Failed to open attachment");
    }
  }

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
  }

  const currentAttachment = form.watch("attachmentUrl")

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-indigo-500 dark:text-indigo-400" />
            Notes Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Provide class materials and study notes for students.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 h-11 inline-flex items-center justify-center text-sm font-medium transition-all shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> New Note
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-0 overflow-hidden bg-white dark:bg-[#0f1423]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">Share study materials with all students.</DialogDescription>
            </div>
            
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Chapter 1 Summary" className="bg-slate-50 dark:bg-[#0a0d14] border-slate-200 dark:border-slate-800 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-300">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl h-11 bg-slate-50 dark:bg-[#0a0a0a]">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className="rounded-lg cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <cat.icon className={`h-4 w-4 ${cat.color}`} />
                                  <span>{cat.id}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 dark:text-slate-300">Subject (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl h-11 bg-slate-50 dark:bg-[#0a0a0a]">
                                <SelectValue placeholder="None" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                              <SelectItem value="" className="rounded-lg cursor-pointer">None</SelectItem>
                              {subjects.map((sub) => (
                                <SelectItem key={sub} value={sub} className="rounded-lg cursor-pointer">
                                  {sub}
                                </SelectItem>
                              ))}
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
                          <FormLabel className="text-slate-700 dark:text-slate-300">Target Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl h-11 bg-slate-50 dark:bg-[#0a0a0a]">
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
                              <SelectTrigger className="border-slate-200 dark:border-slate-700 focus:ring-emerald-500 rounded-xl h-11 bg-slate-50 dark:bg-[#0a0a0a]">
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
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your note content here..." 
                            className="min-h-[200px] resize-none bg-slate-50 dark:bg-[#0a0d14] border-slate-200 dark:border-slate-800 rounded-xl custom-scrollbar" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Attachment (Optional)</FormLabel>
                    
                    {!currentAttachment ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-[#131b2f] hover:border-indigo-300 transition-colors"
                      >
                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center mb-3">
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to attach a file</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or Image (Max 2MB)</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#131b2f] border border-slate-200 dark:border-slate-800 rounded-xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">Document Attached</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={removeAttachment} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 rounded-lg">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                    <Button type="button" variant="ghost" onClick={handleCloseDialog} className="rounded-xl">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6">
                      {editingNote ? "Save Changes" : "Create Note"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Tabs & Subject Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveCategoryFilter("All")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategoryFilter === "All" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-[#131b2f] dark:text-slate-400 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-slate-800"}`}
          >
            All Notes
          </button>
          {CATEGORIES.map(category => (
            <button 
              key={category.id}
              onClick={() => setActiveCategoryFilter(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategoryFilter === category.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-[#131b2f] dark:text-slate-400 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-slate-800"}`}
            >
              <category.icon className="h-4 w-4" />
              {category.id}
            </button>
          ))}
        </div>

          <select 
            value={activeSubject}
            onChange={(e) => setActiveSubject(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-slate-600 dark:bg-[#131b2f] dark:text-slate-400 border border-slate-200 dark:border-slate-800 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-3xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f1423]/50">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No notes found</h3>
            <p className="text-slate-500 max-w-sm mb-6">Try adjusting your filters or create a new note.</p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const categoryInfo = CATEGORIES.find(c => c.id === note.category) || CATEGORIES[4]
            
            return (
              <div key={note.id} className="group relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-[#0f1423] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-800">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${categoryInfo.bg} ${categoryInfo.color} ${categoryInfo.border} border`}>
                    <categoryInfo.icon className="mr-1 h-3 w-3" />
                    {categoryInfo.id}
                  </span>
                  {note.subject && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 truncate max-w-[150px]">
                      {note.subject}
                    </span>
                  )}
                  {note.department && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 truncate max-w-[150px]">
                      {note.department}
                    </span>
                  )}
                  {note.semester && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Sem {note.semester}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-end gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button onClick={() => handleOpenDialog(note)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => deleteNote(note.id)} variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                <div 
                  className="cursor-pointer"
                  onClick={() => setViewingNote(note)}
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <p className="text-xs font-medium text-slate-500">
                    {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </p>
                  
                  {note.attachmentUrl && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                      <Paperclip className="h-3 w-3" />
                      Attachment
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={!!viewingNote} onOpenChange={(open) => !open && setViewingNote(null)}>
        <DialogContent className="sm:max-w-[700px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-0 overflow-hidden bg-white dark:bg-[#0f1423]">
          {viewingNote && (
            <>
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`${CATEGORIES.find(c => c.id === viewingNote.category)?.color} border-slate-200 dark:border-slate-700`}>
                      {viewingNote.category}
                    </Badge>
                    <span className="text-xs text-slate-500">{format(new Date(viewingNote.updatedAt), "MMMM d, yyyy")}</span>
                  </div>
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{viewingNote.title}</DialogTitle>
                </div>
              </div>
              
              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                    {viewingNote.content}
                  </p>
                </div>
                
                {viewingNote.attachmentUrl && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Attachment</h4>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#131b2f] border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Document</p>
                          <p className="text-xs text-slate-500">Click view to open</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleViewAttachment(viewingNote.attachmentUrl!)} variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-700">
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0d14] flex justify-end">
                <Button onClick={() => setViewingNote(null)} className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white">
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
