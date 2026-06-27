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
  Tag,
  Briefcase,
  GraduationCap,
  LayoutList,
  User as UserIcon,
  FolderOpen
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Note = {
  id: string
  title: string
  content: string
  category: string
  subject: string | null
  attachmentUrl: string | null
  updatedAt: string
}

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  subject: z.string().optional().nullable(),
  attachmentUrl: z.string().optional().nullable(),
})

const CATEGORIES = [
  { id: "Study", icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  { id: "Project", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-800" },
  { id: "Assignment", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "Personal", icon: UserIcon, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-800" },
  { id: "General", icon: LayoutList, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" },
]

export default function NotesPage() {
  const [personalNotes, setPersonalNotes] = useState<Note[]>([])
  const [adminNotes, setAdminNotes] = useState<Note[]>([])
  const [activeTab, setActiveTab] = useState<"personal" | "admin">("personal")
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [activeSubject, setActiveSubject] = useState<string>("All")
  const [subjects, setSubjects] = useState<string[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "General",
      subject: null,
      attachmentUrl: null,
    },
  })

  useEffect(() => {
    fetchNotes()
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/student/timetable")
      if (res.ok) {
        const data = await res.json()
        const uniqueSubjects = Array.from(new Set(data.map((item: any) => item.subject))) as string[]
        setSubjects(uniqueSubjects)
      }
    } catch (e) {}
  }

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/student/notes")
      if (res.ok) {
        const data = await res.json()
        setPersonalNotes(data.personalNotes || [])
        setAdminNotes(data.adminNotes || [])
      }
    } catch (error) {
      toast.error("Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (id: string) => {
    setPersonalNotes(personalNotes.filter(n => n.id !== id))
    try {
      await fetch(`/api/student/notes/${id}`, { method: "DELETE" })
      toast.success("Note deleted")
    } catch (error) {
      toast.error("Failed to delete note")
      fetchNotes()
    }
  }

  const onSubmit = async (values: z.infer<typeof noteSchema>) => {
    try {
      const url = editingNote 
        ? `/api/student/notes/${editingNote.id}`
        : "/api/student/notes"
      const method = editingNote ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
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

  const handleOpenDialog = (note?: Note) => {
    if (note) {
      setEditingNote(note)
      form.reset({
        title: note.title,
        content: note.content,
        category: note.category,
        subject: note.subject,
        attachmentUrl: note.attachmentUrl,
      })
    } else {
      setEditingNote(null)
      form.reset({
        title: "",
        content: "",
        category: "General",
        subject: null,
        attachmentUrl: null,
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

  const filteredNotes = (activeTab === "personal" ? personalNotes : adminNotes)
    .filter(n => activeCategory === "All" || n.category === activeCategory)
    .filter(n => activeSubject === "All" || n.subject === activeSubject)

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
  }

  const currentAttachment = form.watch("attachmentUrl")

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Digital Notes</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Capture your thoughts and organize study materials.</p>
        </div>
        
        {activeTab === "personal" && (
          <Button onClick={() => handleOpenDialog()} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 h-11 shadow-md transition-all hover:-translate-y-0.5 whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" /> New Note
          </Button>
        )}
      </div>

      <div className="flex bg-slate-200 dark:bg-[#131b2f] p-1 rounded-xl w-max">
        <button 
          onClick={() => setActiveTab("personal")} 
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'personal' ? 'bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          My Notes
        </button>
        <button 
          onClick={() => setActiveTab("admin")} 
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'admin' ? 'bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
        >
          Provided Notes
        </button>
      </div>

      {/* Category Tabs & Subject Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === "All" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-[#131b2f] dark:text-slate-400 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-slate-800"}`}
          >
            All Notes
          </button>
          {CATEGORIES.map(category => (
            <button 
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === category.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-[#131b2f] dark:text-slate-400 dark:hover:bg-[#1e293b] border border-slate-200 dark:border-slate-800"}`}
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

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-3xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0a0a0a]/50">
          <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No notes found</h3>
          <p className="text-slate-500 max-w-sm mt-2">There are no notes in this category yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => {
            const categoryInfo = CATEGORIES.find(c => c.id === note.category) || CATEGORIES[4];
            
            return (
              <div 
                key={note.id} 
                onClick={() => setViewingNote(note)}
                className="group relative flex flex-col p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0f1423] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden"
              >
                <div className="flex-1 relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${categoryInfo.bg} ${categoryInfo.color} ${categoryInfo.border} border`}>
                    <categoryInfo.icon className="mr-1 h-3 w-3 shrink-0" />
                    {categoryInfo.id}
                  </span>
                    {note.subject && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 truncate max-w-[150px]">
                        {note.subject}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-[18px] text-slate-900 dark:text-white line-clamp-2 mb-3 leading-snug">
                    {note.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[14px] line-clamp-3 leading-relaxed font-medium">
                    {note.content}
                  </p>
                  
                  {note.attachmentUrl && (
                    <div className="mt-5">
                      {note.attachmentUrl.startsWith("data:image/") || note.attachmentUrl.includes("unsplash.com") ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-32 mb-2">
                          <img src={note.attachmentUrl} alt="Attachment" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                          <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">1 Attachment</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {activeTab === "personal" && (
                      <>
                        <Button onClick={(e) => { e.stopPropagation(); handleOpenDialog(note); }} size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[600px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-0 overflow-hidden bg-white dark:bg-[#0f1423]">
          <div className="h-2 bg-emerald-500 w-full"></div>
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingNote ? "Edit Note" : "Create Note"}</DialogTitle>
              <DialogDescription>Write down important information or attach a file.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input placeholder="e.g. Lecture 1: OOP Basics" className="h-11 rounded-xl" {...field} /></FormControl>
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
                </div>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Key takeaways..." 
                          className="min-h-[160px] resize-none rounded-xl" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Attachment Section */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <FormLabel className="mb-3 block">Attachments (Bonus Feature)</FormLabel>
                  {currentAttachment ? (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {currentAttachment.startsWith("data:image/") ? (
                          <img src={currentAttachment} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-emerald-200 dark:border-emerald-800" />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400 truncate">
                          File attached successfully
                        </span>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={removeAttachment} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-dashed border-2 h-12 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        Attach File or Image (Max 2MB)
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 h-11 px-8 rounded-xl text-white font-medium shadow-lg shadow-emerald-500/20">
                    {editingNote ? "Save Changes" : "Save Note"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Note Modal */}
      <Dialog open={!!viewingNote} onOpenChange={(open) => !open && setViewingNote(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-0 overflow-hidden bg-white dark:bg-[#0f1423]">
           {viewingNote && (
             <>
               <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    {(() => {
                      const cat = CATEGORIES.find(c => c.id === viewingNote.category) || CATEGORIES[4];
                      const Icon = cat.icon;
                      return (
                        <div className={`h-12 w-12 flex flex-shrink-0 items-center justify-center rounded-2xl ${cat.bg} border ${cat.border}`}>
                           <Icon className={`h-6 w-6 ${cat.color}`} />
                        </div>
                      )
                    })()}
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
                       {format(new Date(viewingNote.updatedAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                    {viewingNote.title}
                  </DialogTitle>
               </div>
               
               <div className="p-8 overflow-y-auto">
                 <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {viewingNote.content}
                    </p>
                 </div>
                 
                 {viewingNote.attachmentUrl && (
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                         <Paperclip className="h-4 w-4 text-slate-400" /> Attached File
                      </h4>
                      {viewingNote.attachmentUrl.startsWith("data:image/") || viewingNote.attachmentUrl.includes("unsplash.com") ? (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-w-sm shadow-sm group relative">
                          <img src={viewingNote.attachmentUrl} alt="Attachment" className="w-full h-auto object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                             <a href={viewingNote.attachmentUrl} download={`attachment_${viewingNote.title}`} className="h-10 px-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center gap-2 text-white font-medium text-sm transition-colors" target="_blank" rel="noopener noreferrer">
                               <Download className="h-4 w-4" /> Open
                             </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button onClick={() => handleViewAttachment(viewingNote.attachmentUrl!)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 font-bold text-sm transition-colors">
                            <Eye className="h-4 w-4" /> View File
                          </button>
                          <a href={viewingNote.attachmentUrl} download={`attachment_${viewingNote.title}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-bold text-sm transition-colors">
                            <Download className="h-4 w-4" /> Download
                          </a>
                        </div>
                      )}
                    </div>
                  )}
               </div>
               
               <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] flex justify-end shrink-0">
                 <Button onClick={() => setViewingNote(null)} variant="outline" className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
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
