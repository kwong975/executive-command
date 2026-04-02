import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TodayPage from "./pages/TodayPage";
import AgentsPage from "./pages/AgentsPage";
import WorkbenchPage from "./pages/WorkbenchPage";
import ExecutionPage from "./pages/ExecutionPage";
import StrategyScanPage from "./pages/StrategyScanPage";
import GoalLinkingPage from "./pages/GoalLinkingPage";
import HygienePage from "./pages/HygienePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/workbench" element={<WorkbenchPage />} />
          <Route path="/execution" element={<ExecutionPage />} />
          <Route path="/scan" element={<StrategyScanPage />} />
          <Route path="/goal-linking" element={<GoalLinkingPage />} />
          <Route path="/hygiene" element={<HygienePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
