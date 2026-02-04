import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2, Loader2, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function CartDrawer() {
  const { items, savedItems, isCartOpen, setIsCartOpen, increaseQuantity, decreaseQuantity, removeItem, saveForLater, moveToCart, removeSavedItem, clearSavedItems, totalPrice, clearCart } = useCart();
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

    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: grandTotal,
          status: 'pending',
        })
        .select('id')
        .single();

      if (orderError) {
        console.error("Order creation failed:", orderError);
        throw orderError;
      }

      // 2. Insert Items
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error("Order items insertion failed:", itemsError);
        // Rollback: Delete the order if items failed to insert
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }

      // 3. Success!
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
      });
      
      clearCart();
      setIsCartOpen(false);
      navigate("/my-orders");

    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        variant: "destructive",
        title: "Checkout Failed",
        description: errorMessage,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleClearSavedItems = () => {
    clearSavedItems();
    toast({
      description: "All saved items have been cleared.",
    });
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

        {items.length === 0 && savedItems.length === 0 ? (
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
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {items.length > 0 && <div className="space-y-3">{items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-muted rounded-xl"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/64?text=No+Image";
                    }}
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
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => decreaseQuantity(item.id)}
                        className="h-6 w-6 rounded-full"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-bold min-w-[24px] text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => increaseQuantity(item.id)}
                        className="h-6 w-6 rounded-full"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => saveForLater(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      aria-label="Save for later"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}</div>}

              {/* Saved Items */}
              {savedItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" /> Saved for Later ({savedItems.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSavedItems}
                      className="text-xs h-6 px-2 text-muted-foreground hover:text-destructive"
                    >
                      Clear All
                    </Button>
                  </div>
                  {savedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl opacity-80">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-lg object-cover grayscale"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/48?text=No+Image";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.name}</h4>
                        <p className="font-bold text-primary mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           onClick={() => moveToCart(item.id)}
                           className="h-8 w-8 text-muted-foreground hover:text-primary"
                           aria-label="Move to cart"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                        <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           onClick={() => removeSavedItem(item.id)}
                           className="h-8 w-8 text-muted-foreground hover:text-destructive"
                           aria-label="Remove saved item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer */}
            {items.length > 0 && <div className="border-t border-border p-6 space-y-4 bg-card">
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
            </div>}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
