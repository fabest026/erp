import { Product } from "@shared/schema";
import { Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onProductClick: (product: Product) => void;
}

export default function ProductGrid({ products, loading = false, onProductClick }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array(12).fill(0).map((_, index) => (
          <div key={index} className="border rounded-lg shadow-sm overflow-hidden">
            <div className="h-28 bg-gray-200 animate-pulse"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="border rounded-lg shadow-sm overflow-hidden cursor-pointer hover:border-primary hover:shadow transition-all"
          onClick={() => onProductClick(product)}
        >
          <div className="h-28 bg-gray-100 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {product.sku} • {product.unit}
            </p>
            <div className="mt-2">
              <span className="text-base font-semibold text-primary">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
