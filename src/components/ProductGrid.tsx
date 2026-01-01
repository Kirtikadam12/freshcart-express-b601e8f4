import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/products";

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
}

export function ProductGrid({ selectedCategory, searchQuery }: ProductGridProps) {
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case "vegetables":
        return "🥬 Fresh Vegetables";
      case "fruits":
        return "🍎 Fresh Fruits";
      case "seasonal":
        return "🌸 Seasonal Specials";
      case "offers":
        return "🏷️ Best Offers";
      default:
        return "🛒 All Products";
    }
  };

  return (
    <section className="py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{getCategoryTitle()}</h2>
          <p className="text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
