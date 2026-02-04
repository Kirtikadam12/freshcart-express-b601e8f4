import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import ProductsList from "./pages/seller/ProductsList";
import ProductForm from "./pages/seller/ProductForm";
import Inventory from "./pages/seller/Inventory";
import Orders from "./pages/seller/Orders";
import Settings from "./pages/seller/Settings";
import { SellerDashboardLayout } from "./components/seller/SellerDashboardLayout";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";
import ProtectedRoute from "./components/ProtectedRoute";
import MyOrders from "@/components/MyOrders";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "./Footer";
import ContactUs from "./ContactUs";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <CartDrawer />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/delivery" element={<DeliveryDashboard />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/contact" element={<ContactUs />} />
                  {/* Protected Seller Routes */}
                  <Route element={<ProtectedRoute allowedRole="seller" />}>
                    <Route path="/seller" element={<SellerDashboardLayout />}>
                      <Route index element={<SellerDashboard />} />
                      <Route path="dashboard" element={<SellerDashboard />} />
                      <Route path="products" element={<ProductsList />} />
                      <Route path="products/new" element={<ProductForm />} />
                      <Route path="products/edit/:id" element={<ProductForm />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Route>
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
