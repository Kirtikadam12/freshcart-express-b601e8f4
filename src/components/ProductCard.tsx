import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus } from "lucide-react";

// Shared Product interface
interface Product {
  id: string;
  name: string;
  category: "fruit" | "vegetable";
  price: number;
  stock: number;
  image_url: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, setIsCartOpen } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: quantity,
      unit: "kg",
    });
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: quantity,
      unit: "kg",
    });
    setIsCartOpen(true);
  };

  return (
    <Card className="group relative flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-t-lg bg-gray-200 lg:aspect-none group-hover:opacity-75 h-64">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=No+Image";
              (e.target as HTMLImageElement).classList.add('object-scale-down');
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="mt-4 flex justify-between flex-grow">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            {/* The anchor tag can be replaced with a Link component from react-router-dom */}
            <a href={`/product/${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </a>
          </h3>
          <p className="mt-1 text-sm text-gray-500 capitalize">{product.category}</p>
        </div>
        <p className="text-base font-bold text-gray-900">₹{product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 flex flex-col gap-3">
        {product.stock > 0 && (
          <div className="flex items-center gap-2 relative z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleIncrement}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        {product.stock > 0 ? (
          <div className="flex gap-2 w-full relative z-10">
            <Button className="flex-1" variant="outline" onClick={handleAddToCart}>
              Add to Cart
            </Button>
            <Button className="flex-1" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        ) : (
          <Button className="w-full relative z-10" disabled>
            Out of Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}