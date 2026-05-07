import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { MobileWarning } from "./MobileWarning";
import { BackgroundProvider } from "./contexts/BackgroundContext";

const queryClient = new QueryClient();

const App = () => {
  if (window.innerWidth < 768) {
    return <MobileWarning />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BackgroundProvider>
    </QueryClientProvider>
  );
};

export default App;