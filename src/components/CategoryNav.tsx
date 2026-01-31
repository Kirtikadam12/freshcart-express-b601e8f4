import { cn } from "@/lib/utils";

export type Category = "all" | "fruit" | "vegetable";

interface CategoryNavProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

const staticCategories: { id: Category; name: string; icon: string }[] = [
  { id: "all", name: "All", icon: "🛒" },
  { id: "vegetable", name: "Vegetables", icon: "🥬" },
  { id: "fruit", name: "Fruits", icon: "🍎" },
];
  
export function CategoryNav({
  selectedCategory,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <section className="py-6 border-b border-border bg-card sticky top-[140px] z-40">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {staticCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm transition-all",
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
