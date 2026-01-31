import { Link, NavLink } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuIcon, LayoutDashboard, Package, Warehouse, ShoppingCart, Settings } from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    to: "/seller/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    to: "/seller/products",
    icon: Package,
  },
  {
    title: "Inventory",
    to: "/seller/inventory",
    icon: Warehouse,
  },
  {
    title: "Orders",
    to: "/seller/orders",
    icon: ShoppingCart,
  },
  {
    title: "Settings",
    to: "/seller/settings",
    icon: Settings,
  },
];

const SellerSidebar = () => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-background h-full sticky top-0">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/seller/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">Seller Dashboard</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          <nav className="grid items-start gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.title}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="md:hidden fixed top-4 left-4 z-50">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <Link to="/seller/dashboard" className="flex items-center gap-2 font-semibold border-b pb-4">
            <span className="text-lg">Seller Dashboard</span>
          </Link>
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="grid items-start gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.title}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                        isActive ? "bg-muted text-primary" : "text-muted-foreground"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </NavLink>
                );
              })}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SellerSidebar;
