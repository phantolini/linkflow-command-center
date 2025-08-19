
import React, { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { SimpleLandingPage } from "@/components/SimpleLandingPage";
import { SimpleSetupWizard } from "@/components/SimpleSetupWizard";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [showAuth, setShowAuth] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Show loading while auth is being determined
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // No user and auth page requested - show auth page
  if (!user && showAuth) {
    return <AuthPage />;
  }

  // No user - show landing page
  if (!user) {
    return (
      <SimpleLandingPage 
        onGetStarted={() => setShowAuth(true)} 
      />
    );
  }

  // User but no profile or setup requested - show setup wizard
  if (!profile || showSetup) {
    return (
      <SimpleSetupWizard 
        onComplete={() => {
          setShowSetup(false);
          // Profile will be loaded by useProfile hook
        }} 
      />
    );
  }

  // User with profile - show dashboard
  return <Dashboard user={user} />;
};

export default Index;
