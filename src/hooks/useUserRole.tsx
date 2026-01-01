import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "buyer" | "delivery" | null;

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
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } else {
        setRole(data?.role as AppRole);
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const assignRole = async (selectedRole: "buyer" | "delivery") => {
    if (!user) return { error: new Error("No user logged in") };

    const { error } = await supabase.from("user_roles").insert({
      user_id: user.id,
      role: selectedRole,
    });

    if (!error) {
      setRole(selectedRole);
    }

    return { error };
  };

  return { role, loading, assignRole };
}
