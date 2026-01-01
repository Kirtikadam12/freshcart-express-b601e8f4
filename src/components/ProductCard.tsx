import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
    });
  };

  return (
    <div className="group bg-card rounded-2xl border border-border overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 animate-fade-in">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badge */}
        {product.badge && (
          <Badge
            className={`absolute top-3 left-3 ${
              product.badge.includes("OFF")
                ? "bg-citrus-orange"
                : product.badge === "Organic"
                ? "bg-primary"
                : product.badge === "Premium"
                ? "gradient-citrus"
                : "bg-secondary text-secondary-foreground"
            } text-primary-foreground font-semibold px-3 py-1`}
          >
            {product.badge}
          </Badge>
        )}

        {/* Quick add overlay */}
        {quantity === 0 && (
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">{product.unit}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Add to cart */}
          {quantity === 0 ? (
            <Button
              variant="cart"
              size="icon-sm"
              onClick={handleAdd}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-primary rounded-full p-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="h-7 w-7 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-bold text-primary-foreground min-w-[20px] text-center">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="h-7 w-7 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
