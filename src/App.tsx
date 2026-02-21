import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { OrganizationProvider, useOrganization } from "@/contexts/OrganizationContext";
import Index from "./pages/Index";
import CalendarCallback from "./pages/CalendarCallback";
import CompanySelector from "./pages/CompanySelector";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { currentOrg } = useOrganization();

  if (!currentOrg) {
    return <CompanySelector />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/calendar-callback" element={<CalendarCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OrganizationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </OrganizationProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
