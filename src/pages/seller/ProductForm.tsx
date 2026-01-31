import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  category: "fruit" | "vegetable";
  price: number | string;
  stock: number | string;
  image_url: string;
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "fruit",
    price: "",
    stock: "",
    image_url: "",
  });

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && user) {
      fetchProduct();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    if (!user || !id) return;

    try {
      setFetching(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("seller_id", user.id) // Ensure seller can only edit their own products
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product. Please try again.",
        });
        navigate("/seller/products");
      } else if (data) {
        setFormData({
          name: data.name,
          category: data.category as "fruit" | "vegetable",
          price: data.price,
          stock: data.stock,
          image_url: data.image_url,
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
      navigate("/seller/products");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save a product.",
      });
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Product name is required.",
      });
      return;
    }

    const price = typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price;
    const stock = typeof formData.stock === 'string' ? parseInt(formData.stock) : formData.stock;

    if (!price || price <= 0) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Price must be greater than 0.",
      });
      return;
    }

    if (stock === undefined || stock < 0) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Stock cannot be negative.",
      });
      return;
    }

    if (!formData.image_url.trim()) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Image URL is required.",
      });
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: formData.name.trim(),
            category: formData.category,
            price: price,
            stock: stock,
            image_url: formData.image_url.trim(),
            is_active: true,
          })
          .eq("id", id)
          .eq("seller_id", user.id); // Ensure seller can only update their own products

        if (error) {
          // Log full error details
          console.error("Supabase error updating product:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          
          // Show actual error message from Supabase
          toast({
            variant: "destructive",
            title: "Failed to update product",
            description: error.message || "An error occurred while updating the product.",
          });
        } else {
          toast({
            title: "Product updated",
            description: "The product has been updated successfully.",
          });
          navigate("/seller/products");
        }
      } else {
        // Create new product - ensure seller_id is always set to logged-in user id
        const seller_id = user.id;
        
        if (!seller_id) {
          console.error("No user ID available");
          toast({
            variant: "destructive",
            title: "Error",
            description: "User authentication error. Please log in again.",
          });
          return;
        }

        // Verify user session is still valid
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || session.user.id !== seller_id) {
          console.error("Session mismatch or invalid session");
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
          });
          return;
        }

        console.log("Creating product with seller_id:", seller_id, "Form data:", formData);
        const { data, error } = await supabase
          .from("products")
          .insert({
            seller_id: seller_id,
            name: formData.name.trim(),
            category: formData.category,
            price: price,
            stock: stock,
            image_url: formData.image_url.trim(),
            is_active: true,
          })
          .select();

        if (error) {
          // Log full error details
          console.error("Supabase error creating product:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          
          // Show actual error message from Supabase
          toast({
            variant: "destructive",
            title: "Failed to create product",
            description: error.message || "An error occurred while creating the product.",
          });
        } else {
          console.log("Product created successfully:", data);
          toast({
            title: "Product created",
            description: "The product has been added to your store.",
          });
          navigate("/seller/products");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/seller/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update product information" : "Add a new product to your store"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Fill in the product information below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Fresh Tomatoes"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as "fruit" | "vegetable" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fruit">Fruit</SelectItem>
                  <SelectItem value="vegetable">Vegetable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price === 0 ? "" : formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="40.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock === 0 ? "" : formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL *</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            {formData.image_url && (
              <div className="grid gap-2">
                <Label>Image Preview</Label>
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="h-32 w-32 rounded-md object-cover border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/seller/products")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Product" : "Create Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
