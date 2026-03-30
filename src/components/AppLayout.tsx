import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";

export function AppLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader title={title} />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
