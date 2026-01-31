import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  order_items: OrderItem[];
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            name,
            quantity,
            price
          )
        ` as any)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders((data as any) || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "out_for_delivery": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-muted-foreground mb-8">Track and manage your recent purchases</p>
      
      {orders.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/10">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            You haven't placed any orders yet. Start shopping to get fresh produce delivered to your doorstep.
          </p>
          <Button asChild variant="fresh" size="lg">
            <Link to="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <Badge className={getStatusColor(order.status)} variant="outline">
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(order.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      <span className="text-muted-foreground/50">•</span>
                      {new Date(order.created_at).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-bold text-lg">₹{order.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/20 p-3 rounded-md">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{order.delivery_address || "No delivery address provided"}</span>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 text-sm uppercase tracking-wider text-muted-foreground">Items</h4>
                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b last:border-0 border-dashed">
                          <div className="flex items-center gap-3">
                            <span className="font-medium bg-muted w-8 h-8 flex items-center justify-center rounded-full text-xs">
                              {item.quantity}x
                            </span>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}