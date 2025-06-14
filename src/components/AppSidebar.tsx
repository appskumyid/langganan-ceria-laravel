
import { Home, Shield, Users, Calendar, Settings } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
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

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home, roles: ["admin", "member"] },
  { title: "Admin Dashboard", url: "/admin", icon: Shield, roles: ["admin"] },
  { title: "Manajemen User", url: "/users", icon: Users, roles: ["admin"] },
  { title: "Absensi", url: "/attendance", icon: Calendar, roles: ["admin", "member"] },
  { title: "Pengaturan", url: "/settings", icon: Settings, roles: ["admin", "member"] },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { role, isAdmin } = useUserRole()
  const currentPath = location.pathname

  const collapsed = state === "collapsed"

  const filteredItems = menuItems.filter(item => {
    if (!role) return false
    return item.roles.includes(role)
  })

  const isActive = (path: string) => currentPath === path

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="offcanvas">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && "Sistem Absensi"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">
              {!collapsed && "Admin"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/admin" 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <Shield className="h-4 w-4" />
                      {!collapsed && <span>Dashboard Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
