import { CalendarDays, Users, FolderOpen, Compass } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Today", url: "/", icon: CalendarDays },
  { title: "Agents", url: "/agents", icon: Users },
  { title: "Matters", url: "/matters", icon: FolderOpen },
  { title: "Strategy", url: "/strategy", icon: Compass },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-4">
        <div className={`px-3 mb-5 ${collapsed ? "px-2 text-center" : ""}`}>
          <span className={`font-mono font-semibold tracking-widest text-sidebar-primary ${collapsed ? "text-[11px]" : "text-[12px]"}`}>
            {collapsed ? "◆" : "COMMAND"}
          </span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-8">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-2.5 px-3 rounded text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors text-[13px]"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
