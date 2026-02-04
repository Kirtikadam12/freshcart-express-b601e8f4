import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  removeSavedItem: (id: string) => void;
  clearSavedItems: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from local storage", error);
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Load saved items from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("savedForLater");
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse saved items", error);
      }
    }
  }, []);

  // Save saved items to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem("savedForLater", JSON.stringify(savedItems));
  }, [savedItems]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const increaseQuantity = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setItems((prev) => {
      const targetItem = prev.find((item) => item.id === id);
      if (targetItem && targetItem.quantity <= 1) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = () => setItems([]);

  const saveForLater = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setSavedItems((prev) => {
        // Prevent duplicates in saved items
        const exists = prev.some((saved) => saved.id === id);
        if (exists) return prev;
        return [...prev, item];
      });
      removeItem(id);
    }
  };

  const moveToCart = (id: string) => {
    const item = savedItems.find((i) => i.id === id);
    if (item) {
      addItem(item);
      setSavedItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const removeSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearSavedItems = () => {
    setSavedItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        addItem,
        removeItem,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        removeSavedItem,
        clearSavedItems,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
