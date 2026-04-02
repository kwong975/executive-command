import {
  CalendarDays, Users, Wrench, ListChecks, Radar,
  Link2, Sparkles
} from "lucide-react";
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
  { title: "Agents", url: "/agents", icon: Users },
  { title: "Today", url: "/", icon: CalendarDays },
  { title: "Workbench", url: "/workbench", icon: Wrench },
  { title: "Execution", url: "/execution", icon: ListChecks },
  { title: "Strategy Scan", url: "/scan", icon: Radar },
  { title: "Goal Linking", url: "/goal-linking", icon: Link2 },
  { title: "Hygiene", url: "/hygiene", icon: Sparkles },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-5">
        <div className={`px-3 mb-6 ${collapsed ? "px-2 text-center" : ""}`}>
          <span className="font-mono font-semibold tracking-[0.15em] text-sidebar-primary text-xs">
            {collapsed ? "AC" : "AGENT COMMAND"}
          </span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-9">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 rounded-md text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-all duration-100 text-sm"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-[15px] w-[15px] shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
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
