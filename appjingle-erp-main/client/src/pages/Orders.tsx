import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { orderStatusOptions, orderTypeOptions } from "@/lib/data";
import { Order, Customer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Orders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<{
    order: Order;
    items: any[];
  } | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Get orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders', selectedStatus],
    queryFn: async () => {
      let endpoint = '/api/orders';
      if (selectedStatus) {
        endpoint += `?status=${selectedStatus}`;
      }
      const response = await apiRequest('GET', endpoint);
      return response.json();
    },
  });

  // Get customers for display
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PUT', `/api/orders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
      setStatusDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update order status. ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleViewOrder = async (order: Order) => {
    try {
      const response = await apiRequest('GET', `/api/orders/${order.id}`);
      const details = await response.json();
      setOrderDetails(details);
      setDetailsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load order details. ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (status: string) => {
    if (selectedOrder) {
      updateStatusMutation.mutate({ id: selectedOrder.id, status });
    }
  };

  const getCustomerName = (customerId: number | null) => {
    if (!customerId) return "No Customer";
    const customer = customers?.find(c => c.id === customerId);
    return customer 
      ? `${customer.firstName} ${customer.lastName}` 
      : `Customer #${customerId}`;
  };

  const formatDate = (date: string | Date) => {
    return date instanceof Date ? date.toLocaleDateString() : new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: string | number) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const columns = [
    {
      header: "Order ID",
      accessorKey: "orderNumber",
      cell: (row: Order) => (
        <span className="font-medium">{row.orderNumber}</span>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customerId",
      cell: (row: Order) => getCustomerName(row.customerId),
    },
    {
      header: "Date",
      accessorKey: "orderDate",
      cell: (row: Order) => formatDate(row.orderDate),
    },
    {
      header: "Type",
      accessorKey: "orderType",
      cell: (row: Order) => (
        <span className="capitalize">{row.orderType.replace('_', ' ')}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "orderStatus",
      cell: (row: Order) => <StatusBadge status={row.orderStatus} />,
    },
    {
      header: "Total",
      accessorKey: "total",
      cell: (row: Order) => formatCurrency(row.total),
    },
    {
      header: "",
      accessorKey: "actions",
      cell: (row: Order) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleViewOrder(row)}
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedOrder(row);
              setStatusDialogOpen(true);
            }}
          >
            Update Status
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orders</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Select
            value={selectedStatus || 'all'}
            onValueChange={(value) => setSelectedStatus(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {orderStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex-1 flex justify-end">
            <Input
              placeholder="Search orders..."
              className="w-full sm:w-[300px]"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={orders || []}
          loading={isLoading}
          searchable={true}
          pagination={true}
        />
      </div>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a new status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={updateStatusMutation.isPending}
              onClick={() => {
                if (selectedOrder && document.querySelector('[data-radix-select-value]')?.textContent) {
                  const status = document.querySelector('[data-radix-select-value]')?.textContent?.toLowerCase() || '';
                  updateStatusMutation.mutate({ id: selectedOrder.id, status });
                }
              }}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {orderDetails && (
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Information</h3>
                  <p className="mt-1"><span className="font-medium">Order ID:</span> {orderDetails.order.orderNumber}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(orderDetails.order.orderDate)}</p>
                  <p><span className="font-medium">Status:</span> {orderDetails.order.orderStatus}</p>
                  <p><span className="font-medium">Type:</span> {orderDetails.order.orderType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                  <p className="mt-1"><span className="font-medium">Customer:</span> {getCustomerName(orderDetails.order.customerId)}</p>
                  <p><span className="font-medium">Payment Method:</span> {orderDetails.order.paymentMethod}</p>
                  <p><span className="font-medium">Total:</span> {formatCurrency(orderDetails.order.total)}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Items</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase border-b">Product</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase border-b">Quantity</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase border-b">Unit Price</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase border-b">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-4">{item.productName || `Product #${item.productId}`}</td>
                      <td className="py-4 px-4">{item.quantity}</td>
                      <td className="py-4 px-4">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-4 px-4">{formatCurrency(Number(item.unitPrice) * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-right font-medium">Subtotal:</td>
                    <td className="py-4 px-4">{formatCurrency(orderDetails.items.reduce((sum, item) => sum + (Number(item.unitPrice) * item.quantity), 0))}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-right font-medium">Tax:</td>
                    <td className="py-4 px-4">{formatCurrency(Number(orderDetails.order.tax) || 0)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="py-4 px-4 text-right font-bold">Total:</td>
                    <td className="py-4 px-4 font-bold">{formatCurrency(orderDetails.order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
