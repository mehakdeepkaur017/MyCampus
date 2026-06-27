"use client"

import { useState, useEffect } from "react"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  const [threshold, setThreshold] = useState<number>(75)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        setThreshold(data.attendanceThreshold)
      }
    } catch (error) {
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendanceThreshold: threshold })
      })

      if (res.ok) {
        toast.success("Settings saved successfully")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      toast.error("An error occurred while saving")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage global configuration for your institution.</p>
      </div>

      <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-[#0f1423]">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <CardTitle>Attendance Threshold</CardTitle>
          <CardDescription>Set the minimum required attendance percentage for all students.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">Minimum Required Percentage (%)</Label>
            <Input 
              id="threshold" 
              type="number" 
              min="0" 
              max="100" 
              value={threshold} 
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="max-w-[200px] rounded-xl"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
