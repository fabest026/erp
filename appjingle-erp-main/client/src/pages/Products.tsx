import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Grid2X2,
  List,
  Plus,
  Search,
  PackageCheck,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import ProductCard from "@/components/products/ProductCard";
import ProductForm, { ProductFormValues } from "@/components/products/ProductForm";
import { Product, ProductCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { getUnitLabel } from "@/lib/data";
import { StatusBadge } from "@/components/ui/status-badge";

export default function Products() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<ProductCategory[]>({
    queryKey: ['/api/categories'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDialogOpen(false);
      toast({
        title: "Product created",
        description: "Product has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormValues }) => {
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Product updated",
        description: "Product has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product deleted",
        description: "Product has been removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateProduct = (data: ProductFormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdateProduct = (data: ProductFormValues) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const openNewProductDialog = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const getCategoryById = (id?: number) => {
    if (!id || !categories) return undefined;
    return categories.find((cat) => cat.id === id);
  };

  // Filtered products based on search and category
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = 
      !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || product.categoryId === parseInt(categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  // Table columns
  const columns = [
    {
      header: "Name",
      accessorKey: "name" as keyof Product,
      enableSorting: true,
      cell: (row: Product) => (
        <div className="font-medium">{row.name}</div>
      ),
    },
    {
      header: "SKU",
      accessorKey: "sku" as keyof Product,
      enableSorting: true,
    },
    {
      header: "Category",
      accessorKey: "categoryId" as keyof Product,
      cell: (row: Product) => {
        const category = getCategoryById(row.categoryId);
        return category ? category.name : "-";
      },
    },
    {
      header: "Price",
      accessorKey: "price" as keyof Product,
      enableSorting: true,
      cell: (row: Product) => formatCurrency(row.price),
    },
    {
      header: "Unit",
      accessorKey: "unit" as keyof Product,
      cell: (row: Product) => getUnitLabel(row.unit),
    },
    {
      header: "Status",
      accessorKey: "isActive" as keyof Product,
      cell: (row: Product) => (
        <StatusBadge
          status={row.isActive ? "completed" : "cancelled"}
          className="capitalize"
        >
          {row.isActive ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Product,
      cell: (row: Product) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditProduct(row)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteProduct(row)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-poppins text-gray-800">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product inventory</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            className="bg-primary hover:bg-primary-dark"
            onClick={openNewProductDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList>
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8 w-full md:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {!categoriesLoading &&
                        categories?.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <div className="border-r border-gray-300 h-8 hidden sm:block"></div>
                  
                  <div className="flex">
                    <Button
                      variant={view === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="rounded-r-none"
                      onClick={() => setView("grid")}
                    >
                      <Grid2X2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={view === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="rounded-l-none"
                      onClick={() => setView("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="all" className="pt-4">
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productsLoading ? (
                    // Loading skeleton
                    Array(8)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="border rounded-lg shadow-sm overflow-hidden"
                        >
                          <div className="h-40 bg-gray-200 animate-pulse"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                            <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                          </div>
                        </div>
                      ))
                  ) : (
                    filteredProducts?.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        category={getCategoryById(product.categoryId)}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                      />
                    ))
                  )}
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredProducts || []}
                  loading={productsLoading}
                  emptyState={
                    <div className="text-center py-12">
                      <PackageCheck className="mx-auto h-12 w-12 text-gray-300" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No products</h3>
                      <p className="mt-1 text-gray-500">Get started by adding a new product.</p>
                      <Button
                        className="mt-6 bg-primary hover:bg-primary-dark"
                        onClick={openNewProductDialog}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </div>
                  }
                />
              )}
            </TabsContent>

            <TabsContent value="active" className="pt-4">
              <DataTable
                columns={columns}
                data={(filteredProducts || []).filter((p) => p.isActive)}
                loading={productsLoading}
              />
            </TabsContent>

            <TabsContent value="inactive" className="pt-4">
              <DataTable
                columns={columns}
                data={(filteredProducts || []).filter((p) => !p.isActive)}
                loading={productsLoading}
              />
            </TabsContent>

            <TabsContent value="low-stock" className="pt-4">
              {/* This would ideally fetch and display low stock items */}
              <div className="text-center py-8">
                <p>Low stock products will show here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            defaultValues={
              editingProduct
                ? {
                    ...editingProduct,
                    price: editingProduct.price.toString(),
                    costPrice: editingProduct.costPrice?.toString() || "",
                    weight: editingProduct.weight?.toString() || "",
                  }
                : undefined
            }
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
