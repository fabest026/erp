import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Inventory, Product } from "@shared/schema";

interface LowStockItemProps {
  product: Product;
  quantity: number;
}

interface InventoryWithProduct extends Inventory {
  product?: Product;
}

const InventoryAlert = () => {
  const { data: lowStockItems, isLoading } = useQuery<InventoryWithProduct[]>({
    queryKey: ['/api/inventory/low-stock'],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Combine inventory with product data
  const lowStockWithProducts = lowStockItems?.map(item => {
    const product = products?.find(p => p.id === item.productId);
    return { ...item, product };
  }).slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-lg font-poppins text-gray-800">Inventory Alert</h2>
      </div>
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {isLoading 
                  ? "Loading inventory alerts..." 
                  : `${lowStockItems?.length || 0} products are running low on stock.`
                }
              </p>
            </div>
          </div>
        </div>
        
        <ul className="mt-4 space-y-3">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <li key={index} className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </li>
            ))
          ) : (
            lowStockWithProducts?.map((item) => (
              <li key={item.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-800">{item.product?.name || `Product ${item.productId}`}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  item.quantity <= 5 
                    ? "bg-red-100 text-red-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {item.quantity} left
                </span>
              </li>
            ))
          )}
        </ul>
        
        <Link href="/inventory">
          <Button className="mt-4 w-full bg-primary hover:bg-primary-dark text-white border-primary">
            Restock Inventory
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default InventoryAlert;
