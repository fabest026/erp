import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
import { Product } from "@shared/schema";

interface TopProductDisplay {
  product: Product;
  sold: number;
}

const placeholderProducts: TopProductDisplay[] = [
  {
    product: {
      id: 1,
      name: "Organic Apples",
      description: "Fresh organic apples",
      sku: "P001",
      price: "3.99",
      categoryId: 1,
      imageUrl: "",
      barcode: "123456789",
      unit: "lb",
      isActive: true
    },
    sold: 142
  },
  {
    product: {
      id: 2,
      name: "Whole Milk",
      description: "Fresh whole milk",
      sku: "P002",
      price: "2.49",
      categoryId: 2,
      imageUrl: "",
      barcode: "234567890",
      unit: "gallon",
      isActive: true
    },
    sold: 128
  },
  {
    product: {
      id: 3,
      name: "Artisan Bread",
      description: "Freshly baked artisan bread",
      sku: "P003",
      price: "4.25",
      categoryId: 4,
      imageUrl: "",
      barcode: "345678901",
      unit: "loaf",
      isActive: true
    },
    sold: 95
  },
  {
    product: {
      id: 4,
      name: "Chicken Breast",
      description: "Fresh chicken breast",
      sku: "P004",
      price: "5.99",
      categoryId: 3,
      imageUrl: "",
      barcode: "456789012",
      unit: "lb",
      isActive: true
    },
    sold: 87
  }
];

const TopSellingProducts = () => {
  // In a real app, we would fetch top selling products from the API
  // For now, using placeholder data
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    select: (data) => data.slice(0, 4)
  });

  const topProducts = products ? products.map((product, index) => ({
    product,
    sold: placeholderProducts[index]?.sold || Math.floor(Math.random() * 100) + 50
  })) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-semibold text-lg font-poppins text-gray-800">Top Selling</h2>
        <Link href="/products">
          <span className="text-sm text-primary hover:text-primary-dark font-medium cursor-pointer">View All</span>
        </Link>
      </div>
      
      <ul className="divide-y divide-gray-100">
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <li key={index} className="flex items-center py-3 px-4">
              <Skeleton className="w-12 h-12 rounded-md" />
              <div className="ml-4 flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </li>
          ))
        ) : (
          topProducts.map((item, index) => (
            <li key={index} className="flex items-center py-3 px-4">
              <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                {item.product.imageUrl ? (
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="w-12 h-12 rounded-md object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                <p className="text-xs text-gray-500">Category {item.product.categoryId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{item.sold} sold</p>
                <p className="text-xs text-green-500">+{Math.floor(Math.random() * 15) + 5}%</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TopSellingProducts;
