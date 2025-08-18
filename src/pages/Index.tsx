
import React, { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { SimpleLandingPage } from "@/components/SimpleLandingPage";
import { SimpleSetupWizard } from "@/components/SimpleSetupWizard";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [showSetup, setShowSetup] = useState(false);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // No user - show landing page
  if (!user) {
    return <SimpleLandingPage onGetStarted={() => setShowSetup(true)} />;
  }

  // User but no profile - show setup wizard
  if (!profile) {
    return <SimpleSetupWizard onComplete={() => setShowSetup(false)} />;
  }

  // User with profile - show dashboard
  return <Dashboard user={user} />;
};

export default Index;
