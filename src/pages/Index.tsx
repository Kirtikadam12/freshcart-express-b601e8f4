import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { CategoryNav } from "@/components/CategoryNav";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  const [selectedCategory, setSelectedCategory] =
  useState<"all" | "fruit" | "vegetable">("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <HeroBanner />
        <CategoryNav
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <ProductGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </main>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 gradient-fresh rounded-xl flex items-center justify-center text-2xl">
              🥬
            </div>
            <span className="text-xl font-bold">FreshCart</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 FreshCart. Farm fresh vegetables and fruits delivered to your doorstep.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">About Us</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
