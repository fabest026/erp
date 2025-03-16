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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { formatDate } from "@/lib/utils";
import { Employee, Store, insertEmployeeSchema } from "@shared/schema";
import { employeePositions } from "@/lib/data";
import { Users, Plus, Edit, Trash2, Mail, Phone, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const employeeSchema = insertEmployeeSchema.extend({
  id: z.number().optional(),
  hireDate: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export default function Employees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>("");

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      isActive: true,
    },
  });

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees', { storeId: storeFilter ? parseInt(storeFilter) : undefined }],
  });

  const { data: stores } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      return apiRequest('/api/employees', {
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Employee created",
        description: "Employee has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create employee: ${error}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EmployeeFormValues }) => {
      return apiRequest(`/api/employees/${id}`, {
        method: 'PUT',
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setDialogOpen(false);
      setEditingEmployee(null);
      form.reset();
      toast({
        title: "Employee updated",
        description: "Employee has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update employee: ${error}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/employees/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Employee deleted",
        description: "Employee has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete employee: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateEmployee = (data: EmployeeFormValues) => {
    createMutation.mutate(data);
  };

  const handleUpdateEmployee = (data: EmployeeFormValues) => {
    if (editingEmployee) {
      updateMutation.mutate({ id: editingEmployee.id, data });
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    if (confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      deleteMutation.mutate(employee.id);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      storeId: employee.storeId,
      isActive: employee.isActive,
    });
    setDialogOpen(true);
  };

  const onSubmit = (data: EmployeeFormValues) => {
    if (editingEmployee) {
      handleUpdateEmployee(data);
    } else {
      handleCreateEmployee(data);
    }
  };

  const getStoreName = (storeId: number) => {
    const store = stores?.find((s) => s.id === storeId);
    return store ? store.name : `Store #${storeId}`;
  };

  const columns = [
    {
      header: "Employee",
      accessorKey: "firstName",
      cell: (row: Employee) => (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(row.firstName, row.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
            <div className="text-sm text-gray-500">{row.position}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "email",
      cell: (row: Employee) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Mail className="mr-2 h-3 w-3 text-gray-500" />
            <span>{row.email}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="mr-2 h-3 w-3 text-gray-500" />
            <span>{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Store",
      accessorKey: "storeId",
      cell: (row: Employee) => getStoreName(row.storeId),
    },
    {
      header: "Hire Date",
      accessorKey: "hireDate",
      cell: (row: Employee) => (
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          <span>{row.hireDate ? formatDate(row.hireDate) : "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row: Employee) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.isActive
              ? "bg-green-50 text-green-700"
              : "bg-gray-50 text-gray-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "",
      accessorKey: "actions",
      cell: (row: Employee) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditEmployee(row)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteEmployee(row)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
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
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Employees</h1>
          </div>
          <Button onClick={() => {
            setEditingEmployee(null);
            form.reset({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              position: "",
              isActive: true,
            });
            setDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Select
            value={storeFilter}
            onValueChange={setStoreFilter}
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
              placeholder="Search employees..."
              className="w-full sm:w-[300px]"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={employees || []}
          loading={isLoading}
          searchable={true}
          pagination={true}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employeePositions.map((position) => (
                            <SelectItem key={position.value} value={position.value}>
                              {position.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores?.map((store) => (
                            <SelectItem key={store.id} value={store.id.toString()}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingEmployee
                    ? "Update"
                    : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
