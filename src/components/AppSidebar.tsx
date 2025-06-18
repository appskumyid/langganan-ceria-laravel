
import { Home, Users, Package, LogOut, ListChecks, Settings, Briefcase, Globe } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar({ onSettingsClick }: { onSettingsClick: () => void }) {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const { signOut } = useAuth()
  const { isAdmin } = useUserRole()

  const memberItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Langganan Saya", url: "/my-subscriptions", icon: ListChecks },
    { title: "Website", url: "/home", icon: Globe },
  ]

  const adminItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Langganan Saya", url: "/my-subscriptions", icon: ListChecks },
    { title: "Website", url: "/home", icon: Globe },
    { title: "Admin Dashboard", url: "/admin", icon: Users },
    { title: "Kelola Produk", url: "/admin/products", icon: Package },
    { title: "Kelola Layanan", url: "/admin/services", icon: Briefcase },
  ]

  const items = isAdmin ? adminItems : memberItems

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="offcanvas"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    {state !== "collapsed" && <span>Pengaturan</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  {state !== "collapsed" && <span>Keluar</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
