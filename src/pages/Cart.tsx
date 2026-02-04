import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Cart() {
  const { items, removeItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const deliveryFee = totalPrice >= 200 ? 0 : 25;
  const grandTotal = totalPrice + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
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

      // Success
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
      });
      
      clearCart();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg mb-4">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                    <div>
                      <h2 className="font-bold">{item.name}</h2>
                      <p className="text-gray-500">₹{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="md:col-span-1">
              <div className="p-4 border rounded-lg">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCheckout} 
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Checkout"
                  )}
                </Button>
                <Button variant="outline" className="w-full mt-2" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
