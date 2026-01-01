import { cn } from "@/lib/utils";
import { categories } from "@/data/products";

interface CategoryNavProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryNav({ selectedCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <section className="py-6 border-b border-border bg-card sticky top-[140px] z-40">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200",
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <span className="text-lg">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
