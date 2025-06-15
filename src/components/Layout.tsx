
import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Navbar from "@/components/Navbar"
import { useUserRole } from "@/hooks/useUserRole"
import AdminSettings from "./AdminSettings"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [view, setView] = useState<'main' | 'settings'>('main')
  const { isAdmin } = useUserRole()
  const location = useLocation()

  useEffect(() => {
    // Reset view to main when navigating away
    setView('main');
  }, [location.pathname]);


  const handleSettingsClick = () => {
    setView(current => current === 'main' ? 'settings' : 'main')
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar onSettingsClick={handleSettingsClick} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b bg-white">
            <SidebarTrigger className="ml-4" />
            <div className="flex-1">
              <Navbar />
            </div>
          </header>

          <main className="flex-1 bg-gray-50 p-6">
            {isAdmin && view === 'settings' ? <AdminSettings /> : children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
