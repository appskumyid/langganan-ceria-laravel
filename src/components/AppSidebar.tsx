
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Home, User, ShoppingBag, Package, Receipt, Settings, Users, Briefcase } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useUserRole } from "@/hooks/useUserRole"

const AppSidebar = () => {
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      adminOnly: false,
    },
    {
      title: "Langganan Saya",
      icon: Package,
      href: "/my-subscriptions",
      adminOnly: false,
    },
    {
      title: "Riwayat Transaksi",
      icon: Receipt,
      href: "/transaction-history",
      adminOnly: false,
    },
    {
      title: "Admin Dashboard",
      icon: Settings,
      href: "/admin",
      adminOnly: true,
    },
    {
      title: "Kelola Produk",
      icon: ShoppingBag,
      href: "/admin/products",
      adminOnly: true,
    },
    {
      title: "Kelola Layanan",
      icon: Briefcase,
      href: "/admin/services",
      adminOnly: true,
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Menu</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.href} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar;
