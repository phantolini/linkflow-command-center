
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  isSignUp: boolean;
  onToggleMode: () => void;
}

export const AuthForm = ({ isSignUp, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would integrate with your platform's auth system
      toast({
        title: isSignUp ? "Account created!" : "Welcome back!",
        description: "Please use your platform's authentication system.",
      });
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/80">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-fuchsia-400/50 focus:ring-fuchsia-400/20"
          placeholder="your@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/80">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-fuchsia-400/50 focus:ring-fuchsia-400/20"
          placeholder="••••••••"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white border-0 shadow-lg shadow-fuchsia-500/25"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSignUp ? "Create Account" : "Sign In"}
      </Button>

      <p className="text-center text-sm text-white/60">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-fuchsia-400 hover:text-fuchsia-300 font-medium"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </p>
    </form>
  );
};
