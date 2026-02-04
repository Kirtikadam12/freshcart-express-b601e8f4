import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, MapPin, Clock, CheckCircle2, Truck, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Order {
  id: string;
  buyer_id: string;
  status: string;
  order_items: { quantity: number; price: number; products: { name: string } | null }[];
  total_amount: number;
  delivery_address: string;
  delivery_boy_id: string | null;
  created_at: string;
}

export default function DeliveryDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    earnings: 0,
  });
  const [selectedMapOrder, setSelectedMapOrder] = useState<Order | null>(null);
  const [orderToDeliver, setOrderToDeliver] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!roleLoading && role !== "delivery") {
      navigate("/");
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (user && role === "delivery") {
      fetchOrders();
    }
  }, [user, role]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(quantity, price, products(name))" as any)
      // Show orders that are 'pending' (ready for pickup) OR assigned to this user
      .or(`status.eq.packed,delivery_boy_id.eq.${user?.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      const typedOrders = (data || []) as unknown as Order[];
      setOrders(typedOrders);
      
      const pending = typedOrders.filter(o => o.status === "packed" && !o.delivery_boy_id).length;
      const inProgress = typedOrders.filter(o => ["assigned", "out_for_delivery"].includes(o.status)).length;
      const completed = typedOrders.filter(o => o.status === "delivered" && o.delivery_boy_id === user?.id).length;
      const earnings = typedOrders
        .filter(o => o.status === "delivered" && o.delivery_boy_id === user?.id)
        .reduce((sum, o) => sum + Number(o.total_amount) * 0.1, 0);
      
      setStats({ pending, inProgress, completed, earnings });
    }
    setLoadingOrders(false);
  };

  const acceptOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ delivery_boy_id: user?.id, status: "assigned" })
      .eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept order",
      });
    } else {
      toast({
        title: "Order accepted!",
        description: "You have accepted this order for delivery.",
      });
      fetchOrders();
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status",
      });
    } else {
      toast({
        title: "Status updated!",
        description: `Order marked as ${newStatus}`,
      });
      fetchOrders();
    }
  };

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("delivery-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          fetchOrders();

          const newOrder = payload.new as any;
          const oldOrder = payload.old as any;

          // Notify if a new order is ready for pickup
          if (
            newOrder.status === "packed" &&
            !newOrder.delivery_boy_id &&
            (payload.eventType === "INSERT" || (payload.eventType === "UPDATE" && oldOrder?.status !== "packed"))
          ) {
            toast({
              title: "New Order Available",
              description: `Order #${newOrder.id.slice(0, 8)} is ready for pickup`,
              action: (
                <Button variant="default" size="sm" onClick={() => acceptOrder(newOrder.id)}>
                  Accept
                </Button>
              ),
              duration: 10000,
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-800", label: "Pending" },
      assigned: { className: "bg-blue-100 text-blue-800", label: "Assigned" },
      accepted: { className: "bg-gray-100 text-gray-800", label: "Accepted" },
      packed: { className: "bg-purple-100 text-purple-800", label: "Ready for Pickup" },
      out_for_delivery: { className: "bg-blue-100 text-blue-800", label: "Out for Delivery" },
      delivered: { className: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { className: "bg-red-100 text-red-800", label: "Cancelled" },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-soft">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Green Root Organics</h1>
              <p className="text-xs text-muted-foreground">Delivery Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              {user?.email}
            </div>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <span className="text-xl font-bold text-primary">₹</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{stats.earnings.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Orders</CardTitle>
            <CardDescription>Accept and manage delivery orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No orders available at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="flex items-start gap-2 mb-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p>{order.delivery_address}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 h-6 text-xs"
                          onClick={() => setSelectedMapOrder(order)}
                        >
                          View on Map
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground mb-1">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.order_items?.map((item, idx) => (
                          <Badge key={idx} variant="secondary">
                            {item.products?.name} x{item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-lg">₹{order.total_amount}</p>
                      <div className="flex gap-2">
                        {order.status === "packed" && (
                          <Button variant="fresh" size="sm" onClick={() => acceptOrder(order.id)}>
                            Pickup Order
                          </Button>
                        )}
                        {order.status === "assigned" && (
                          <Button variant="fresh" size="sm" onClick={() => updateOrderStatus(order.id, "out_for_delivery")}>
                            Start Delivery
                          </Button>
                        )}
                        {order.status === "out_for_delivery" && (
                          <Button variant="fresh" size="sm" onClick={() => setOrderToDeliver(order.id)}>
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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

        <AlertDialog open={!!orderToDeliver} onOpenChange={(open) => !open && setOrderToDeliver(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delivery</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this order as delivered? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (orderToDeliver) {
                  updateOrderStatus(orderToDeliver, "delivered");
                  setOrderToDeliver(null);
                }
              }}>
                Confirm Delivered
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
