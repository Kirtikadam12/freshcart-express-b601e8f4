import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Package, Truck, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: { name: string } | null;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  buyer_id: string;
  delivery_boy_id: string | null;
  order_items: OrderItem[];
}

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapOrder, setSelectedMapOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchAssignedOrders();
    }
  }, [user]);

  const fetchAssignedOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (*, products(name))
      ` as any)
      .eq("delivery_boy_id", user.id)
      .neq("status", "delivered") // Filter out completed orders to keep the dashboard clean
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assigned orders.",
      });
    } else {
      setOrders((data as unknown as Order[]) || []);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string, buyerId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus.replace(/_/g, " ")}.`,
      });
      
      // Notify buyer
      await supabase.from('notifications').insert({
        user_id: buyerId,
        title: `Order Update: ${newStatus.replace(/_/g, " ")}`,
        message: `Your order #${orderId.slice(0, 8)} is now ${newStatus.replace(/_/g, " ")}.`,
      });

      fetchAssignedOrders();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return <Badge variant="secondary">Assigned</Badge>;
      case "out_for_delivery":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Out for Delivery</Badge>;
      case "delivered":
        return <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Delivery Dashboard</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No active deliveries</h3>
          <p className="text-muted-foreground">You have no orders assigned at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription>{format(new Date(order.created_at), "PPP p")}</CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Delivery Address</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => setSelectedMapOrder(order)}
                    >
                      View on Map
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="font-medium text-sm mb-2">Items ({order.order_items.length})</p>
                  <ul className="space-y-1">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="text-sm flex justify-between">
                        <span className="text-muted-foreground">{item.quantity}x {item.products?.name}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between mt-2 font-bold">
                    <span>Total</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 pt-4">
                {order.status === "assigned" && (
                  <Button 
                    className="w-full" 
                    onClick={() => updateStatus(order.id, "out_for_delivery", order.buyer_id)}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Start Delivery
                  </Button>
                )}
                {order.status === "out_for_delivery" && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={() => updateStatus(order.id, "delivered", order.buyer_id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Delivered
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMapOrder} onOpenChange={(open) => !open && setSelectedMapOrder(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Delivery Location</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedMapOrder?.delivery_address || "")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}