import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { items, removeItem, clearCart, totalPrice } = useCart();

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
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
                <Button className="w-full">Checkout</Button>
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
