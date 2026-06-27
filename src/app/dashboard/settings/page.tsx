"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Settings as SettingsIcon, Save } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<string>("system")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (theme) {
      setSelectedTheme(theme)
    }
  }, [theme])

  const handleSave = () => {
    setTheme(selectedTheme)
    toast.success("Theme preferences saved!")
  }

  if (!mounted) return null // Prevent hydration mismatch on initial render



  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your app preferences and appearance.</p>
      </div>

      <div className="grid gap-8">
        {/* Appearance Settings */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-6 pt-8">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sun className="h-5 w-5 text-emerald-500" /> Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your MyCampus interface.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Theme Preference</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <button
                  onClick={() => setSelectedTheme("light")}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    selectedTheme === "light" 
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <Sun className="h-8 w-8" strokeWidth={1.5} />
                  <span className="font-medium text-sm">Light Mode</span>
                </button>

                <button
                  onClick={() => setSelectedTheme("dark")}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    selectedTheme === "dark" 
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <Moon className="h-8 w-8" strokeWidth={1.5} />
                  <span className="font-medium text-sm">Dark Mode</span>
                </button>

                <button
                  onClick={() => setSelectedTheme("system")}
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    selectedTheme === "system" 
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                      : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <Monitor className="h-8 w-8" strokeWidth={1.5} />
                  <span className="font-medium text-sm">System Default</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md h-11 px-8">
                <Save className="mr-2 h-4 w-4" /> Save Preferences
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Placeholder for future settings */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] shadow-sm rounded-3xl opacity-50 pointer-events-none">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-6 pt-8">
            <CardTitle className="text-xl flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-slate-400" /> Application Preferences
            </CardTitle>
            <CardDescription>
              Notification and sync settings (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-center h-32">
            <p className="text-sm text-slate-400">These settings will be available in v2.0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
