
import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Navbar from "@/components/Navbar"
import { useUserRole } from "@/hooks/useUserRole"
import { AdminSettingsDialog } from "./AdminSettingsDialog"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { isAdmin } = useUserRole()

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar onSettingsClick={() => setIsSettingsOpen(true)} />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b bg-white">
            <SidebarTrigger className="ml-4" />
            <div className="flex-1">
              <Navbar />
            </div>
          </header>

          <main className="flex-1 bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
      {isAdmin && <AdminSettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />}
    </SidebarProvider>
  )
}
