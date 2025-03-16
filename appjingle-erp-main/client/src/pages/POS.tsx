import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import POSLayout, { CartItem } from "@/components/pos/POSLayout";
import { apiRequest } from "@/lib/queryClient";
import { generateOrderNumber } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import InvoiceView from "@/components/pos/InvoiceView";
import { Customer, Store } from "@shared/schema";

export default function POS() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [invoiceEditable, setInvoiceEditable] = useState(true);
  
  const { data: stores } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });
  
  const createOrderMutation = useMutation({
    mutationFn: async ({
      items,
      subtotal,
      tax,
      total,
      storeId,
      paymentMethod,
      customerId,
    }: {
      items: CartItem[];
      subtotal: number;
      tax: number;
      total: number;
      storeId: number;
      paymentMethod: string;
      customerId?: number | null;
    }) => {
      const orderNumber = generateOrderNumber();
      
      const orderData = {
        order: {
          orderNumber,
          storeId,
          orderStatus: "completed",
          orderType: "in_store",
          total: total.toString(),
          tax: tax.toString(),
          discount: "0",
          paymentMethod,
          customerId,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          total: item.total.toString(),
          discount: "0",
        })),
      };

      const res = await apiRequest("POST", "/api/orders", orderData);
      const responseData = await res.json();
      
      // Return order data and additional information for invoice
      return {
        ...responseData,
        orderNumber,
        items,
        subtotal,
        tax,
        total,
        paymentMethod,
        storeId,
        customerId
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      toast({
        title: "Order completed",
        description: "The order has been processed successfully",
      });
      
      // Save order data for invoice
      setOrderData(data);
      // Show invoice after successful order
      setInvoiceOpen(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCheckout = (
    items: CartItem[], 
    subtotal: number, 
    tax: number, 
    total: number, 
    paymentMethod: string,
    storeId: number,
    customerId?: number | null
  ) => {
    createOrderMutation.mutate({
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      storeId,
      customerId
    });
  };
  
  const closeInvoice = () => {
    setInvoiceOpen(false);
    setInvoiceEditable(true); // Reset for next invoice
  };
  
  // Find store information based on storeId
  const findStoreInfo = (storeId: number) => {
    if (!stores) return null;
    return stores.find(store => store.id === storeId);
  };
  
  // Find customer information based on customerId
  const findCustomerInfo = (customerId?: number | null) => {
    if (!customerId || !customers) return null;
    return customers.find(customer => customer.id === customerId);
  };

  return (
    <div className="px-4 py-6 md:p-8 h-[calc(100vh-64px)] md:h-screen flex flex-col">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-poppins text-gray-800">Point of Sale</h1>
          <p className="mt-1 text-sm text-gray-500">Process sales and manage orders</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <POSLayout onCheckout={handleCheckout} />
      </div>
      
      {/* Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          {orderData && (
            <InvoiceView
              orderNumber={orderData.orderNumber}
              items={orderData.items}
              subtotal={orderData.subtotal}
              tax={orderData.tax}
              total={orderData.total}
              paymentMethod={orderData.paymentMethod}
              selectedCustomer={findCustomerInfo(orderData.customerId)}
              storeInfo={findStoreInfo(orderData.storeId)}
              onClose={closeInvoice}
              isEditable={invoiceEditable}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
