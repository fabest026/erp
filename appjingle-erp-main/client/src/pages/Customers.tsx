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
import { formatDate } from "@/lib/utils";
import { Customer, insertCustomerSchema } from "@shared/schema";
import { Users, Plus, Edit, Trash2, Clock } from "lucide-react";

const customerSchema = insertCustomerSchema.extend({
  id: z.number().optional(),
  createdAt: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function Customers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormValues) => {
      const res = await apiRequest("POST", "/api/customers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Customer created",
        description: "Customer has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CustomerFormValues }) => {
      const res = await apiRequest("PUT", `/api/customers/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setDialogOpen(false);
      setEditingCustomer(null);
      form.reset();
      toast({
        title: "Customer updated",
        description: "Customer has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Customer deleted",
        description: "Customer has been removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete customer: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateCustomer = (data: CustomerFormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdateCustomer = (data: CustomerFormValues) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    }
  };

  const handleDeleteCustomer = (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`)) {
      deleteMutation.mutate(customer.id);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      ...customer,
      createdAt: customer.createdAt ? new Date(customer.createdAt).toISOString() : undefined,
    });
    setDialogOpen(true);
  };

  const openNewCustomerDialog = () => {
    setEditingCustomer(null);
    form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setDialogOpen(true);
  };

  // Table columns
  const columns = [
    {
      header: "Name",
      accessorKey: "firstName" as keyof Customer,
      enableSorting: true,
      cell: (row: Customer) => (
        <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email" as keyof Customer,
    },
    {
      header: "Phone",
      accessorKey: "phone" as keyof Customer,
    },
    {
      header: "Address",
      accessorKey: "address" as keyof Customer,
      cell: (row: Customer) => (
        <div>{row.address ? `${row.address}, ${row.city}, ${row.state} ${row.zipCode}` : "-"}</div>
      ),
    },
    {
      header: "Created",
      accessorKey: "createdAt" as keyof Customer,
      enableSorting: true,
      cell: (row: Customer) => (
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1 text-gray-400" />
          {row.createdAt ? formatDate(row.createdAt) : "-"}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Customer,
      cell: (row: Customer) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditCustomer(row)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteCustomer(row)}
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
          <h1 className="text-2xl font-semibold font-poppins text-gray-800">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your customer database</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            className="bg-primary hover:bg-primary-dark"
            onClick={openNewCustomerDialog}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="relative w-full md:w-64 mb-6">
          <Input placeholder="Search customers..." className="w-full" />
        </div>

        <DataTable
          columns={columns}
          data={customers || []}
          loading={isLoading}
          emptyState={
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No customers found</h3>
              <p className="mt-1 text-gray-500">Get started by adding your first customer.</p>
              <Button
                className="mt-6 bg-primary hover:bg-primary-dark"
                onClick={openNewCustomerDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          }
        />
      </div>

      {/* Customer Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(editingCustomer ? handleUpdateCustomer : handleCreateCustomer)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="First name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
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
                        <FormLabel>City</FormLabel>
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
                        <FormLabel>State</FormLabel>
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
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Zip code" />
                      </FormControl>
                      <FormMessage />
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
                    "Save Customer"
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
