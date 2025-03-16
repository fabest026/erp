import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Store, insertStoreSchema } from "@shared/schema";
import { Store as StoreIcon, Plus, Edit, Trash2, Map, Phone, Mail } from "lucide-react";

const storeSchema = insertStoreSchema.extend({
  id: z.number().optional(),
});

type StoreFormValues = z.infer<typeof storeSchema>;

export default function Stores() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      isActive: true,
    },
  });

  const { data: stores, isLoading } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: StoreFormValues) => {
      const res = await apiRequest("POST", "/api/stores", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Store created",
        description: "Store location has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create store location: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: StoreFormValues }) => {
      const res = await apiRequest("PUT", `/api/stores/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      setDialogOpen(false);
      setEditingStore(null);
      form.reset();
      toast({
        title: "Store updated",
        description: "Store location has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update store location: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/stores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      toast({
        title: "Store deleted",
        description: "Store location has been removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete store location: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateStore = (data: StoreFormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdateStore = (data: StoreFormValues) => {
    if (editingStore) {
      updateMutation.mutate({ id: editingStore.id, data });
    }
  };

  const handleDeleteStore = (store: Store) => {
    if (confirm(`Are you sure you want to delete ${store.name}?`)) {
      deleteMutation.mutate(store.id);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    form.reset(store);
    setDialogOpen(true);
  };

  const openNewStoreDialog = () => {
    setEditingStore(null);
    form.reset({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  // Table columns
  const columns = [
    {
      header: "Store Name",
      accessorKey: "name" as keyof Store,
      enableSorting: true,
      cell: (row: Store) => <div className="font-medium">{row.name}</div>,
    },
    {
      header: "Address",
      accessorKey: "address" as keyof Store,
      cell: (row: Store) => (
        <div className="flex items-center">
          <Map className="h-4 w-4 mr-2 text-gray-400" />
          <span>{`${row.address}, ${row.city}, ${row.state} ${row.zipCode}`}</span>
        </div>
      ),
    },
    {
      header: "Contact Information",
      accessorKey: "phone" as keyof Store,
      cell: (row: Store) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span>{row.phone || "—"}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span>{row.email || "—"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive" as keyof Store,
      cell: (row: Store) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Store,
      cell: (row: Store) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditStore(row)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteStore(row)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
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
          <h1 className="text-2xl font-semibold font-poppins text-gray-800">Store Locations</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your store locations and branches</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            className="bg-primary hover:bg-primary-dark"
            onClick={openNewStoreDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Store
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="relative w-full md:w-64 mb-6">
          <Input placeholder="Search stores..." className="w-full" />
        </div>

        <DataTable
          columns={columns}
          data={stores || []}
          loading={isLoading}
          emptyState={
            <div className="text-center py-12">
              <StoreIcon className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No stores found</h3>
              <p className="mt-1 text-gray-500">Get started by adding your first store location.</p>
              <Button
                className="mt-6 bg-primary hover:bg-primary-dark"
                onClick={openNewStoreDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Store
              </Button>
            </div>
          }
        />
      </div>

      {/* Store Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStore ? "Edit Store Location" : "Add New Store Location"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(editingStore ? handleUpdateStore : handleCreateStore)}>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Store name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Street address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="City" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="State" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Zip code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Email address" type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Store location will be available for orders and inventory
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary-dark"
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    "Saving..."
                  ) : (
                    "Save Store"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
