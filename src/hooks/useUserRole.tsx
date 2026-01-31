import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "buyer" | "delivery" | "seller" | null;

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

      const fetchRole = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching user role:", error);
            setRole(null);
          } else {
            setRole((data?.role as AppRole) || null);
          }
        } catch (err) {
          console.error("Unexpected error fetching role:", err);
          setRole(null);
        } finally {
          setLoading(false);
        }
      };

    fetchRole();
  }, [user]);

  const assignRole = async (selectedRole: "buyer" | "delivery" | "seller") => {
    // Get user from context first, if not available, get from Supabase session
    let currentUser = user;
    
    if (!currentUser) {
      // Try to get user from current session
      const { data: { session } } = await supabase.auth.getSession();
      currentUser = session?.user ?? null;
    }

    if (!currentUser) {
      return { error: new Error("No user logged in") };
    }

    try {
      // Upsert profile row keyed by id = auth.uid()
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: currentUser.id, role: selectedRole }, { onConflict: "id" });

      if (error) {
        console.error("Error upserting profile role:", error);
        return { error: error as Error };
      }

      setRole(selectedRole);
      return { error: null };
    } catch (err) {
      console.error("Unexpected error assigning role:", err);
      return { error: err instanceof Error ? err : new Error("Failed to assign role") };
    }
  };

  return { role, loading, assignRole };
}
