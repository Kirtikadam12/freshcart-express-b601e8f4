import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const deliveryFee = totalPrice >= 200 ? 0 : 25;
  const grandTotal = totalPrice + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);
      navigate("/auth");
      return;
    }

    setIsCheckingOut(true);

    try {
      // 1. Fetch seller_id for all items in cart to group orders if necessary
      // For this implementation, we'll assume we create one order. 
      // If multiple sellers exist, we pick the first one or null (platform order).
      // Ideally, you'd group items by seller_id and create multiple orders.
      
      const productIds = items.map(item => item.id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, seller_id' as any)
        .in('id', productIds);

      if (productsError) throw productsError;

      // Simple strategy: Use the seller_id of the first product found
      const sellerId = (products?.[0] as any)?.seller_id || null;

      // Fetch user profile for delivery address
      const { data: profiles } = await supabase
        .from('profiles')
        .select('address')
        .eq('user_id', user.id)
        .limit(1);

      const deliveryAddress = profiles?.[0]?.address || 'Address not provided';

      // 2. Create the Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          total_amount: grandTotal,
          status: 'pending',
          delivery_address: deliveryAddress
        } as any)
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error("Failed to create order");

      // 3. Create Order Items
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData as any);

      if (itemsError) throw itemsError;

      // Success
      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.id.slice(0, 8)} has been created.`,
      });
      
      clearCart();
      setIsCartOpen(false);
      navigate("/my-orders");

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-l border-border p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Your Cart
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some fresh vegetables and fruits to get started!
            </p>
            <Button variant="fresh" onClick={() => setIsCartOpen(false)}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-muted rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{item.unit}</p>
                    <p className="font-bold text-primary mt-1">₹{item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-card rounded-full border border-border p-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-bold min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart footer */}
            <div className="border-t border-border p-6 space-y-4 bg-card">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={deliveryFee === 0 ? "text-primary font-medium" : "font-medium"}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{200 - totalPrice} more for free delivery
                  </p>
                )}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-foreground">₹{grandTotal}</span>
                </div>
              </div>

              <Button 
                variant="fresh" 
                size="lg" 
                className="w-full text-base"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
