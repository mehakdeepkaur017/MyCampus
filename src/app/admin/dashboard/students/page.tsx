"use client"

import React, { useState, useEffect } from "react"

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-red-500 bg-red-50 font-mono text-sm whitespace-pre-wrap">{this.state.error?.message}
{this.state.error?.stack}</div>;
    }
    return this.props.children;
  }
}
import { format } from "date-fns"
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  UserX, 
  UserCheck, 
  KeyRound,
  Loader2,
  AlertTriangle,
  Users,
  Edit
} from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

type Student = {
  id: string
  name: string
  email: string
  department: string
  semester: number
  isActive: boolean
  createdAt: string
}

const studentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  department: z.string().min(1, "Department is required"),
  semester: z.coerce.number().min(1),
})

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  const form = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      department: "",
      semester: 1,
    },
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students")
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (error) {
      toast.error("Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof studentSchema>) => {
    try {
      const url = editingStudent 
        ? `/api/admin/students/${editingStudent.id}`
        : "/api/admin/students"
      const method = editingStudent ? "PUT" : "POST"

      if (!editingStudent && (!values.password || values.password.length < 6)) {
        form.setError("password", { message: "Password is required for new students" })
        return
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      })

      if (res.ok) {
        toast.success(editingStudent ? "Student updated" : "Student created")
        handleCloseDialog()
        fetchStudents()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save student")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const toggleStatus = async (student: Student) => {
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !student.isActive })
      })

      if (res.ok) {
        toast.success(`Account ${!student.isActive ? 'enabled' : 'disabled'}`)
        fetchStudents()
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const confirmDelete = async () => {
    if (!studentToDelete) return
    
    try {
      const res = await fetch(`/api/admin/students/${studentToDelete.id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Student deleted permanently")
        setIsDeleteDialogOpen(false)
        fetchStudents()
      } else {
        toast.error("Failed to delete student")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const handleOpenDialog = (student?: Student) => {
    if (student) {
      setEditingStudent(student)
      form.reset({ 
        name: student.name, 
        email: student.email, 
        department: student.department || "", 
        semester: student.semester || 1,
        password: ""
      })
    } else {
      setEditingStudent(null)
      form.reset({ name: "", email: "", password: "", department: "", semester: 1 })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingStudent(null)
    form.reset()
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.department || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            Students Directory
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">Manage student accounts, passwords, and system access.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 font-bold transition-all hover:-translate-y-0.5">
          <Plus className="mr-2 h-5 w-5" /> Add Student
        </Button>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search by name, email, or department..." 
            className="pl-11 h-12 bg-slate-50 dark:bg-slate-900/50 border-transparent focus-visible:ring-blue-500 rounded-xl font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden sm:flex items-center gap-4 px-6 text-sm font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active ({students.filter(s => s.isActive).length})
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div> Disabled ({students.filter(s => !s.isActive).length})
          </div>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-b-slate-200 dark:border-b-slate-800">
              <TableHead className="py-5 px-6 font-bold text-slate-500 tracking-wide">Student Profile</TableHead>
              <TableHead className="py-5 font-bold text-slate-500 tracking-wide">Program details</TableHead>
              <TableHead className="py-5 font-bold text-slate-500 tracking-wide">Account Status</TableHead>
              <TableHead className="py-5 font-bold text-slate-500 tracking-wide">Joined Date</TableHead>
              <TableHead className="py-5 px-6 font-bold text-slate-500 tracking-wide text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <UserX className="h-10 w-10 text-slate-300 mb-3" />
                    <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No students found</p>
                    <p className="text-sm">Try adjusting your search criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b-slate-100 dark:border-b-slate-800 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-sm shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-base">{student.name}</div>
                        <div className="text-xs font-medium text-slate-500">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-md">
                        {student.department || "N/A"}
                      </span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-md">
                        Sem {student.semester || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {student.isActive ? (
                      <Badge className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 font-bold px-3 py-1">Active</Badge>
                    ) : (
                      <Badge className="bg-rose-100/80 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-0 font-bold px-3 py-1">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(student.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 outline-none focus:bg-slate-100 dark:focus:bg-slate-800">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-[100]">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="font-semibold text-slate-500 mb-1 px-2">Actions</DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuItem className="py-2.5 px-3 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => handleOpenDialog(student)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="py-2.5 px-3 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => handleOpenDialog(student)}>
                          <KeyRound className="mr-2 h-4 w-4" /> Reset password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1.5 opacity-50" />
                        <DropdownMenuItem className="py-2.5 px-3 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => toggleStatus(student)}>
                          {student.isActive ? (
                            <><UserX className="mr-2 h-4 w-4" /> Disable account</>
                          ) : (
                            <><UserCheck className="mr-2 h-4 w-4" /> Enable account</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="py-2.5 px-3 cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 focus:text-red-700 transition-colors mt-1"
                          onClick={() => {
                            setStudentToDelete(student);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[425px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl bg-white dark:bg-[#0f1423]">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Edit Student" : "Add Student"}</DialogTitle>
            <DialogDescription>
              {editingStudent 
                ? "Update student details or reset their password. Leave password blank to keep it unchanged."
                : "Create a new student account. They will use the email and password to log in."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input type="email" disabled={!!editingStudent} placeholder="john@university.edu" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editingStudent ? "New Password (Optional)" : "Password"}</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="Computer Science" {...field} /></FormControl>
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
                      <FormControl><Input type="number" min="1" max="8" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  {editingStudent ? "Save Changes" : "Create Student"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl bg-white dark:bg-[#0f1423]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete <strong>{studentToDelete?.name}</strong>? 
              This will also delete all their tasks, notes, and attendance records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Yes, delete student</Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
