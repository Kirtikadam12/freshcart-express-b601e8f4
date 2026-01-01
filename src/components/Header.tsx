import { Search, ShoppingCart, MapPin, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { totalItems, totalPrice, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-soft">
      <div className="container mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Deliver to</span>
            <button className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors">
              Select Location <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Delivery in</span>
            <span className="font-bold text-primary">10-15 mins</span>
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center gap-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-fresh rounded-xl flex items-center justify-center text-2xl">
              🥬
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FreshCart</h1>
              <p className="text-xs text-muted-foreground">Farm Fresh Daily</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for vegetables, fruits..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 pr-4 h-12 bg-muted border-0 rounded-xl text-base placeholder:text-muted-foreground focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
            
            <Button
              variant="fresh"
              size="lg"
              onClick={() => setIsCartOpen(true)}
              className="relative gap-3 px-6"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <>
                  <span className="hidden sm:inline">{totalItems} items</span>
                  <span className="font-bold">₹{totalPrice}</span>
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-citrus-orange text-primary-foreground border-2 border-card">
                    {totalItems}
                  </Badge>
                </>
              )}
              {totalItems === 0 && <span className="hidden sm:inline">Cart</span>}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
