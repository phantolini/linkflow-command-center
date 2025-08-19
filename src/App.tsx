
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";

// Create QueryClient instance outside component to prevent re-creation on renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProps {
  // Props for integration with parent platform
  initialUser?: any;
  onAuthStateChange?: (user: any) => void;
  apiBaseUrl?: string;
}

const App: React.FC<AppProps> = ({ 
  initialUser, 
  onAuthStateChange, 
  apiBaseUrl 
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialUser={initialUser} onAuthStateChange={onAuthStateChange}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/:username" element={<PublicProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
