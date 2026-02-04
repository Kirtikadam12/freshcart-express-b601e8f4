import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ShoppingBag, Truck, Store, Leaf } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SelectedRole = "buyer" | "delivery" | "seller" | null;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [roleError, setRoleError] = useState<string | null>(null);
  
  const { signIn, signUp, user, loading } = useAuth();
  const { role, loading: roleLoading, assignRole } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !roleLoading && user) {
      if (role === "delivery") {
        navigate("/delivery/dashboard");
      } else if (role === "seller") {
        navigate("/seller/dashboard");
      } else if (role === "buyer") {
        navigate("/");
      }
      // If no role yet, stay on page to let them complete signup flow
    }
  }, [user, loading, role, roleLoading, navigate]);

  const validateForm = () => {
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!isLogin && !selectedRole) {
      setRoleError("Please select a role to continue.");
      return;
    }

    setRoleError(null); // Clear previous role error if any
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: error.message === "Invalid login credentials" 
              ? "Invalid email or password. Please try again."
              : error.message,
          });
          setIsLoading(false);
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          setIsLoading(false);
          // Redirection will be handled by useEffect based on assigned role
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setIsLoading(false);
          const message = error.message.includes("already registered")
            ? "This email is already registered. Please login instead."
            : error.message;
          toast({
            variant: "destructive",
            title: "Sign up failed",
            description: message,
          });
        } else {
          // Proceed directly to role assignment
          const { error: roleError } = await assignRole(selectedRole);
          
          if (roleError) {
            console.error("Error assigning role:", roleError);
            const errorMessage = roleError.message || "Unknown error occurred";
            toast({
              variant: "destructive",
              title: "Role assignment failed",
              description: errorMessage.includes("No user logged in")
                ? "Please wait a moment and try again, or refresh the page."
                : `There was an issue assigning your role: ${errorMessage}`,
            });
            setIsLoading(false);
            return;
          }

          // Stop loading state before redirect
          setIsLoading(false);

          let description = "";
          let redirectPath = "/";
          
          if (selectedRole === "delivery") {
            description = "Welcome to Green Root Organics Delivery!";
            redirectPath = "/delivery/dashboard";
          } else if (selectedRole === "seller") {
            description = "Welcome to Green Root Organics Seller! Start managing your products.";
            redirectPath = "/seller/dashboard";
          } else {
            description = "Welcome to Green Root Organics. Start shopping!";
            redirectPath = "/";
          }

          toast({
            title: "Account created!",
            description: description,
          });

          // Immediately redirect after role assignment
          navigate(redirectPath);
        }
      }
    } finally {
      // setIsLoading(false); // This will be handled by useEffect after redirection or if role assignment fails
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-fresh-green-light via-background to-citrus-yellow/10">
      {/* Header */}
      <header className="p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 gradient-fresh rounded-2xl flex items-center justify-center mb-4 text-white">
              <Leaf className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Sign in to continue" 
                : "Join Green Root Organics as a buyer, seller, or delivery partner"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection - Only show for signup */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label>I want to</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("buyer");
                        setRoleError(null);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        selectedRole === "buyer"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        selectedRole === "buyer" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <span className="font-medium text-sm">Shop & Buy</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Order fresh produce
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("seller");
                        setRoleError(null);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        selectedRole === "seller"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        selectedRole === "seller" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Store className="h-6 w-6" />
                      </div>
                      <span className="font-medium text-sm">Sell</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Manage your store
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole("delivery");
                        setRoleError(null);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        selectedRole === "delivery"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        selectedRole === "delivery" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Truck className="h-6 w-6" />
                      </div>
                      <span className="font-medium text-sm">Deliver</span>
                      <span className="text-xs text-muted-foreground text-center">
                        Earn by delivering
                      </span>
                    </button>
                  </div>
                  {roleError && (
                    <p className="text-sm text-destructive mt-2">{roleError}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="fresh"
                size="lg"
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setRoleError(null);
                  setSelectedRole(null);
                }}
                className="text-primary font-semibold"
              >
                {isLogin ? "Create one now" : "Sign in instead"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </footer>
    </div>
  );
}
