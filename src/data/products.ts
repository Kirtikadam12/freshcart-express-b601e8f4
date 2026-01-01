export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  category: "vegetables" | "fruits" | "seasonal" | "offers";
  badge?: string;
  inStock: boolean;
}

export const products: Product[] = [
  // Vegetables
  {
    id: "v1",
    name: "Fresh Tomatoes",
    price: 40,
    originalPrice: 50,
    unit: "500g",
    image: "https://images.unsplash.com/photo-1546470427-227c7369a9b9?w=400&h=400&fit=crop",
    category: "vegetables",
    badge: "20% OFF",
    inStock: true,
  },
  {
    id: "v2",
    name: "Green Capsicum",
    price: 35,
    unit: "250g",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop",
    category: "vegetables",
    inStock: true,
  },
  {
    id: "v3",
    name: "Fresh Spinach",
    price: 25,
    unit: "250g",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
    category: "vegetables",
    badge: "Organic",
    inStock: true,
  },
  {
    id: "v4",
    name: "Carrots",
    price: 45,
    unit: "500g",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",
    category: "vegetables",
    inStock: true,
  },
  {
    id: "v5",
    name: "Onions",
    price: 30,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop",
    category: "vegetables",
    inStock: true,
  },
  {
    id: "v6",
    name: "Potatoes",
    price: 35,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82ber06?w=400&h=400&fit=crop",
    category: "vegetables",
    inStock: true,
  },
  // Fruits
  {
    id: "f1",
    name: "Red Apples",
    price: 120,
    originalPrice: 150,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
    category: "fruits",
    badge: "Best Seller",
    inStock: true,
  },
  {
    id: "f2",
    name: "Fresh Bananas",
    price: 50,
    unit: "1 dozen",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    category: "fruits",
    inStock: true,
  },
  {
    id: "f3",
    name: "Oranges",
    price: 80,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop",
    category: "fruits",
    badge: "Fresh",
    inStock: true,
  },
  {
    id: "f4",
    name: "Grapes",
    price: 90,
    unit: "500g",
    image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop",
    category: "fruits",
    inStock: true,
  },
  {
    id: "f5",
    name: "Pomegranate",
    price: 150,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop",
    category: "fruits",
    inStock: true,
  },
  {
    id: "f6",
    name: "Watermelon",
    price: 60,
    unit: "1 piece",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",
    category: "fruits",
    badge: "Seasonal",
    inStock: true,
  },
  // Seasonal
  {
    id: "s1",
    name: "Mangoes (Alphonso)",
    price: 350,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop",
    category: "seasonal",
    badge: "Premium",
    inStock: true,
  },
  {
    id: "s2",
    name: "Sweet Corn",
    price: 40,
    unit: "2 pieces",
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop",
    category: "seasonal",
    inStock: true,
  },
  // Offers
  {
    id: "o1",
    name: "Mixed Vegetables Pack",
    price: 99,
    originalPrice: 150,
    unit: "1kg",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop",
    category: "offers",
    badge: "34% OFF",
    inStock: true,
  },
  {
    id: "o2",
    name: "Fruit Basket",
    price: 299,
    originalPrice: 400,
    unit: "2kg",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop",
    category: "offers",
    badge: "25% OFF",
    inStock: true,
  },
];

export const categories = [
  { id: "all", name: "All", icon: "🛒" },
  { id: "vegetables", name: "Vegetables", icon: "🥬" },
  { id: "fruits", name: "Fruits", icon: "🍎" },
  { id: "seasonal", name: "Seasonal", icon: "🌸" },
  { id: "offers", name: "Offers", icon: "🏷️" },
];
