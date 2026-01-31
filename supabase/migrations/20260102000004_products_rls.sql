-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
-- This allows both anonymous (unauthenticated) and authenticated users to view products
CREATE POLICY "Public read access for products"
ON public.products
FOR SELECT
TO public
USING (true);

-- Allow sellers to insert their own products
CREATE POLICY "Sellers can insert their own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to update their own products
CREATE POLICY "Sellers can update their own products"
ON public.products
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to delete their own products
CREATE POLICY "Sellers can delete their own products"
ON public.products
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);