import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

export function useSellerOrderAlert() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    if (user && role === "seller") {
      const channel = supabase
        .channel("global-seller-orders")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "orders",
            filter: `seller_id=eq.${user.id}`,
          },
          (payload) => {
            toast({
              title: "New Order Received! 🎉",
              description: `Order #${payload.new.id.slice(0, 8)} for ₹${payload.new.total_amount} has been placed.`,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, role, toast]);
}