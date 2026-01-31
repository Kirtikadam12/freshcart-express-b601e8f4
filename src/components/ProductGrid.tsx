import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

// Based on your project structure, a shared product type would be ideal.
// For now, we define it here.
interface Product {
  id: string;
  name: string;
  category: "fruit" | "vegetable";
  price: number;
  stock: number;
  image_url: string;
  seller_id: string;
  is_active?: boolean;
}

interface ProductGridProps {
  selectedCategory: "all" | "fruit" | "vegetable";
  searchQuery?: string;
}

// Requirement 2: Create a simple category title mapping.
const categoryTitles: Record<ProductGridProps["selectedCategory"], string> = {
  all: "All Products",
  fruit: "Fresh Fruits",
  vegetable: "Fresh Vegetables",
};

export default function ProductGrid({ selectedCategory, searchQuery }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Requirement 4: Fetch products from Supabase.
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      // Buyer Query: Fetch ALL active products with stock > 0
      let query = supabase
        .from("products")
        .select("*")
        .gt("stock", 0);

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query.order("name", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again.");
      } else {
        data || [];
      }
      setLoading(false);
    };

    fetchProducts();

    const channel = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory]);

  // Requirement 3: Use the mapping to render the <h2> heading.
  const heading = categoryTitles[selectedCategory];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive py-8">{error}</div>;
  }

  const filteredProducts = products.filter((product) =>
    searchQuery ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No products found in this category.</p>
        </div>
      ) : (
        // Requirement 6: Keep the existing UI layout intact (using a standard grid layout).
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}