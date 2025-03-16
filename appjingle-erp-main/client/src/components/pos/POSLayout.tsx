import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGrid from "./ProductGrid";
import Cart from "./Cart";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

interface POSLayoutProps {
  onCheckout?: (items: CartItem[], subtotal: number, tax: number, total: number, paymentMethod: string, storeId: number, customerId?: number | null) => void;
}

export default function POSLayout({ onCheckout }: POSLayoutProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedStore, setSelectedStore] = useState<string | undefined>(undefined);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ['/api/stores'],
  });

  // Filter products by search term and category
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = 
      !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoryId === parseInt(selectedCategory);
    
    return matchesSearch && matchesCategory && product.isActive;
  });

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const newItems = [...prevItems];
        const item = newItems[existingItemIndex];
        const newQuantity = item.quantity + 1;
        const price = parseFloat(product.price);
        
        newItems[existingItemIndex] = {
          ...item,
          quantity: newQuantity,
          total: newQuantity * price,
        };
        
        return newItems;
      } else {
        // Add new item
        const price = parseFloat(product.price);
        return [
          ...prevItems,
          {
            product,
            quantity: 1,
            total: price,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total: quantity * parseFloat(item.product.price),
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.0825; // Example tax rate of 8.25%
  };

  const calculateTotal = (subtotal: number, tax: number) => {
    return subtotal + tax;
  };

  const handleCheckout = (
    paymentMethod: string = "cash", 
    customerId?: number | null
  ) => {
    if (!onCheckout || cartItems.length === 0 || !selectedStore) return;
    
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = calculateTotal(subtotal, tax);
    const storeId = parseInt(selectedStore);
    
    onCheckout(cartItems, subtotal, tax, total, paymentMethod, storeId, customerId);
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* Left Side - Products */}
      <div className="md:w-2/3 flex flex-col">
        <div className="mb-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Categories</SelectItem>
                {!categoriesLoading &&
                  categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedStore}
              onValueChange={setSelectedStore}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Store" />
              </SelectTrigger>
              <SelectContent>
                {!storesLoading &&
                  stores?.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow border border-gray-200 flex-1 overflow-hidden">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
                <TabsTrigger value="discounts">Discounts</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="flex-1 overflow-y-auto p-4">
              <ProductGrid
                products={filteredProducts || []}
                loading={productsLoading}
                onProductClick={addToCart}
              />
            </TabsContent>
            
            <TabsContent value="recent" className="flex-1 overflow-y-auto p-4">
              <div className="text-center text-gray-500 p-8">
                Recent products will appear here
              </div>
            </TabsContent>
            
            <TabsContent value="favorites" className="flex-1 overflow-y-auto p-4">
              <div className="text-center text-gray-500 p-8">
                Your favorite products will appear here
              </div>
            </TabsContent>
            
            <TabsContent value="discounts" className="flex-1 overflow-y-auto p-4">
              <div className="text-center text-gray-500 p-8">
                Discounted products will appear here
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="md:w-1/3 flex flex-col h-full">
        <Cart
          items={cartItems}
          onQuantityChange={updateQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={handleCheckout}
          selectedStore={selectedStore}
        />
      </div>
    </div>
  );
}
