import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TodayPage from "./pages/TodayPage";
import AgentsPage from "./pages/AgentsPage";
import MattersPage from "./pages/MattersPage";
import StrategyScanPage from "./pages/StrategyScanPage";
import StrategyPage from "./pages/StrategyPage";
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
          <Route path="/matters" element={<MattersPage />} />
          <Route path="/scan" element={<StrategyScanPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
