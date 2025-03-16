import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Package, AlertTriangle, Plus, Edit, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Inventory, Product, Store } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface InventoryFormValues {
  productId: number;
  storeId: number;
  quantity: number;
  minStockLevel?: number;
  maxStockLevel?: number;
}

interface InventoryWithDetails extends Inventory {
  product?: Product;
  store?: Store;
}

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);

  const { data: inventory, isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ['/api/inventory', selectedStoreId],
    queryFn: async () => {
      const endpoint = selectedStoreId 
        ? `/api/inventory?storeId=${selectedStoreId}` 
        : '/api/inventory';
      return apiRequest(endpoint);
    }
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: stores, isLoading: storesLoading } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InventoryFormValues) => {
      if (editingInventory) {
        return apiRequest(`/api/inventory/${editingInventory.id}`, {
          method: 'PUT',
          data
        });
      } else {
        return apiRequest('/api/inventory', {
          method: 'POST',
          data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: editingInventory ? "Inventory updated" : "Inventory added",
        description: editingInventory 
          ? "The inventory has been updated successfully."
          : "New inventory has been added successfully.",
      });
      setIsDialogOpen(false);
      setEditingInventory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingInventory ? 'update' : 'add'} inventory. ${error}`,
        variant: "destructive",
      });
    }
  });

  const handleEditInventory = (item: InventoryWithDetails) => {
    setEditingInventory(item);
    setIsDialogOpen(true);
  };

  const inventoryWithDetails: InventoryWithDetails[] = inventory?.map((item) => ({
    ...item,
    product: products?.find((p) => p.id === item.productId),
    store: stores?.find((s) => s.id === item.storeId),
  })) || [];

  const getStockStatus = (item: Inventory) => {
    if (item.quantity <= 0) {
      return "out-of-stock";
    } else if (item.minStockLevel && item.quantity <= item.minStockLevel) {
      return "low-stock";
    } else if (item.maxStockLevel && item.quantity >= item.maxStockLevel) {
      return "overstocked";
    } else {
      return "in-stock";
    }
  };

  const columns = [
    {
      header: "Product",
      accessorKey: "productId",
      cell: (row: InventoryWithDetails) => (
        <div className="font-medium">
          {row.product?.name || `Product #${row.productId}`}
          {row.product?.unit && <span className="text-gray-500 ml-1">({row.product.unit})</span>}
        </div>
      ),
    },
    {
      header: "Store",
      accessorKey: "storeId",
      cell: (row: InventoryWithDetails) => (
        <div>{row.store?.name || `Store #${row.storeId}`}</div>
      ),
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (row: Inventory) => row.quantity,
    },
    {
      header: "Min Stock",
      accessorKey: "minStockLevel",
      cell: (row: Inventory) => row.minStockLevel || "-",
    },
    {
      header: "Max Stock",
      accessorKey: "maxStockLevel",
      cell: (row: Inventory) => row.maxStockLevel || "-",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Inventory) => {
        const status = getStockStatus(row);
        let statusClass = "bg-green-100 text-green-800"; // in-stock

        if (status === "out-of-stock") {
          statusClass = "bg-red-100 text-red-800";
        } else if (status === "low-stock") {
          statusClass = "bg-yellow-100 text-yellow-800";
        } else if (status === "overstocked") {
          statusClass = "bg-blue-100 text-blue-800";
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
            {status.replace("-", " ")}
          </span>
        );
      },
    },
    {
      header: "Last Restock",
      accessorKey: "lastRestockDate",
      cell: (row: Inventory) => row.lastRestockDate ? formatDate(row.lastRestockDate) : "-",
    },
    {
      header: "",
      accessorKey: "actions",
      cell: (row: InventoryWithDetails) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleEditInventory(row)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Inventory</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                setEditingInventory(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Select
            value={selectedStoreId || ""}
            onValueChange={(value) => setSelectedStoreId(value === "" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All stores</SelectItem>
              {stores?.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex-1 flex justify-end">
            <Input
              placeholder="Search inventory..."
              className="w-full sm:w-[300px]"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={inventoryWithDetails}
          loading={inventoryLoading || productsLoading || storesLoading}
          searchable={true}
          pagination={true}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInventory ? "Update Inventory" : "Add Inventory"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="product" className="text-sm font-medium">
                Product
              </label>
              <Select
                defaultValue={editingInventory?.productId?.toString()}
                onValueChange={(value) => {
                  if (editingInventory) {
                    setEditingInventory({
                      ...editingInventory,
                      productId: parseInt(value),
                    });
                  }
                }}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="store" className="text-sm font-medium">
                Store
              </label>
              <Select
                defaultValue={editingInventory?.storeId?.toString()}
                onValueChange={(value) => {
                  if (editingInventory) {
                    setEditingInventory({
                      ...editingInventory,
                      storeId: parseInt(value),
                    });
                  }
                }}
              >
                <SelectTrigger id="store">
                  <SelectValue placeholder="Select Store" />
                </SelectTrigger>
                <SelectContent>
                  {stores?.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                defaultValue={editingInventory?.quantity}
                onChange={(e) => {
                  if (editingInventory) {
                    setEditingInventory({
                      ...editingInventory,
                      quantity: parseInt(e.target.value),
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="minStockLevel" className="text-sm font-medium">
                Min Stock Level
              </label>
              <Input
                id="minStockLevel"
                type="number"
                defaultValue={editingInventory?.minStockLevel}
                onChange={(e) => {
                  if (editingInventory) {
                    setEditingInventory({
                      ...editingInventory,
                      minStockLevel: parseInt(e.target.value),
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="maxStockLevel" className="text-sm font-medium">
                Max Stock Level
              </label>
              <Input
                id="maxStockLevel"
                type="number"
                defaultValue={editingInventory?.maxStockLevel}
                onChange={(e) => {
                  if (editingInventory) {
                    setEditingInventory({
                      ...editingInventory,
                      maxStockLevel: parseInt(e.target.value),
                    });
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingInventory) {
                  updateMutation.mutate({
                    productId: editingInventory.productId,
                    storeId: editingInventory.storeId,
                    quantity: editingInventory.quantity,
                    minStockLevel: editingInventory.minStockLevel,
                    maxStockLevel: editingInventory.maxStockLevel,
                  });
                }
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
