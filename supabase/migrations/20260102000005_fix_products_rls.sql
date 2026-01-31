-- 1. Ensure is_active column exists
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view their own products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Sellers can view own products" ON public.products;

-- 4. Buyer/Public Policy: Allow everyone to view active products
-- This allows anyone (anon or authenticated) to see products that are active.
CREATE POLICY "Public can view active products"
ON public.products
FOR SELECT
TO public
USING (is_active = true);

-- 5. Seller Policy: Allow sellers to view ALL their own products (active or inactive)
CREATE POLICY "Sellers can view own products"
ON public.products
FOR SELECT
TO authenticated
USING (auth.uid() = seller_id);

-- 6. Seller Write Policies (Insert, Update, Delete)
CREATE POLICY "Sellers can insert own products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products"
ON public.products FOR UPDATE TO authenticated
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own products"
ON public.products FOR DELETE TO authenticated
USING (auth.uid() = seller_id);