import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string;
  } | null;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
}

export default function MyOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      //@ts-expect-error
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          total_amount,
          status,
          order_items (
            id,
            quantity,
            price,
            products ( name, image_url )
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto py-8 max-w-4xl px-4">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">View and track your order history</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No orders yet</h3>
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Button variant="default" asChild>
              <Link to="/">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <Collapsible>
                <CardHeader className="p-4 sm:p-6 bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.created_at), "PPP")}
                        </span>
                        <span className="font-medium text-foreground">
                          Total: ₹{order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        View Details <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="p-4 sm:p-6 border-t">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Items</h4>
                        <div className="border rounded-md divide-y">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.products?.image_url || ""}
                                  alt={item.products?.name || "Product image"}
                                  className="h-10 w-10 rounded-md object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=N/A";
                                  }}
                                />
                                <div>
                                  <p className="font-medium line-clamp-1">{item.products?.name || "Product not found"}</p>
                                  <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-medium whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}