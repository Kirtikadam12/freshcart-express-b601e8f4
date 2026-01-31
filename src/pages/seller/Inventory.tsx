import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Save, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerOrderAlert } from "@/hooks/useSellerOrderAlert";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  is_active: boolean;
}

export default function Inventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editedProducts, setEditedProducts] = useState<Record<string, { price: number | string; stock: number | string }>>({});
  const { toast } = useToast();
  useSellerOrderAlert();

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    
    // Seller Query: Fetch ONLY this seller's products (active or inactive)
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user.id);
      
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load inventory." });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePriceChange = (productId: string, price: string) => {
    setEditedProducts({
      ...editedProducts,
      [productId]: {
        ...editedProducts[productId],
        price,
        stock: editedProducts[productId]?.stock ?? products.find((p) => p.id === productId)?.stock ?? 0,
      },
    });
  };

  const handleStockChange = (productId: string, stock: string) => {
    setEditedProducts({
      ...editedProducts,
      [productId]: {
        ...editedProducts[productId],
        stock,
        price: editedProducts[productId]?.price ?? products.find((p) => p.id === productId)?.price ?? 0,
      },
    });
  };

  const handleSave = async (productId: string) => {
    const edited = editedProducts[productId];
    if (!edited || !user) return;

    const { error } = await supabase
      .from("products")
      .update({ 
        price: typeof edited.price === 'string' ? parseFloat(edited.price) || 0 : edited.price, 
        stock: typeof edited.stock === 'string' ? parseInt(edited.stock) || 0 : edited.stock 
      })
      .eq("id", productId)
      .eq("seller_id", user.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update product." });
    } else {
      toast({ title: "Inventory updated", description: "Product saved successfully." });
      fetchProducts(); // Refresh data
      const newEditedProducts = { ...editedProducts };
      delete newEditedProducts[productId];
      setEditedProducts(newEditedProducts);
    }
  };

  const handleBulkSave = async () => {
    if (!user) return;
    if (Object.keys(editedProducts).length === 0) {
      toast({
        variant: "destructive",
        title: "No changes",
        description: "No changes to save.",
      });
      return;
    }

    const userId = user.id;
    const updates = Object.entries(editedProducts).map(([id, { price, stock }]) =>
      supabase.from("products").update({ 
        price: typeof price === 'string' ? parseFloat(price) || 0 : price, 
        stock: typeof stock === 'string' ? parseInt(stock) || 0 : stock 
      }).eq("id", id).eq("seller_id", userId)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((res) => res.error);

    if (hasError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Some products could not be updated. Please try again.",
      });
    } else {
      toast({
        title: "Inventory updated",
        description: "All changes have been saved successfully.",
      });
    }

    setEditedProducts({});
    fetchProducts();
  };

  const getDisplayPrice = (productId: string) => {
    return editedProducts[productId]?.price ?? products.find((p) => p.id === productId)?.price ?? 0;
  };

  const getDisplayStock = (productId: string) => {
    return editedProducts[productId]?.stock ?? products.find((p) => p.id === productId)?.stock ?? 0;
  };

  const hasChanges = Object.keys(editedProducts).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Update stock levels and prices for your products</p>
        </div>
        {hasChanges && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save Changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to update {Object.keys(editedProducts).length} products. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkSave}>Save Changes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Manage stock levels and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Stock Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {products.length === 0
                      ? "No products in your inventory."
                      : "No products match your search."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => {
                  const displayPrice = getDisplayPrice(product.id);
                  const displayStock = getDisplayStock(product.id);
                  const stockValue = typeof displayStock === 'string' ? parseFloat(displayStock) || 0 : displayStock;
                  const hasChanges = editedProducts[product.id] !== undefined;
                  const isOutOfStock = stockValue === 0;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div>
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={displayPrice}
                          onChange={(e) => handlePriceChange(product.id, e.target.value)}
                          className="w-28"
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={displayStock}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          className="w-28"
                          min="0"
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            isOutOfStock
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : stockValue < 20
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : stockValue < 20
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {hasChanges && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave(product.id)}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        {filteredProducts.length > itemsPerPage && (
          <div className="flex items-center justify-end space-x-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
