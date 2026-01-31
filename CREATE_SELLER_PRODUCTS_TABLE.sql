-- ============================================
-- Create Seller Products Table
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- Create seller_products table
CREATE TABLE IF NOT EXISTS public.seller_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fruit', 'vegetable')),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Sellers can view only their own products
CREATE POLICY "Sellers can view their own products"
ON public.seller_products
FOR SELECT
TO authenticated
USING (auth.uid() = seller_id);

-- Sellers can insert their own products
CREATE POLICY "Sellers can insert their own products"
ON public.seller_products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own products
CREATE POLICY "Sellers can update their own products"
ON public.seller_products
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete their own products"
ON public.seller_products
FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seller_products_seller_id ON public.seller_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_category ON public.seller_products(category);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_seller_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to update updated_at
CREATE TRIGGER update_seller_products_updated_at
BEFORE UPDATE ON public.seller_products
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_products_updated_at();
