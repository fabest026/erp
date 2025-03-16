import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus, X, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "./POSLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface CartProps {
  items: CartItem[];
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onCheckout: (paymentMethod: string, customerId?: number | null) => void;
  selectedStore?: string;
}

export default function Cart({
  items,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onCheckout,
  selectedStore,
}: CartProps) {
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerPhone, setCustomerPhone] = useState("");
  const { toast } = useToast();

  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
  });

  const handleQuantityChange = (productId: number, amount: number) => {
    const item = items.find((item) => item.product.id === productId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + amount);
      onQuantityChange(productId, newQuantity);
    }
  };

  const subtotal = items.reduce((total, item) => total + item.total, 0);
  const tax = subtotal * 0.0825; // Example tax rate: 8.25%
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (!selectedStore) {
      toast({
        title: "No store selected",
        description: "Please select a store location",
        variant: "destructive",
      });
      return;
    }

    setIsCheckoutDialogOpen(true);
  };

  // State for customer selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Find customer by phone number
  const findCustomerByPhone = (phone: string) => {
    if (!phone || !customers) return null;
    return customers.find(customer => customer.phone === phone);
  };

  const processPayment = () => {
    setIsCheckoutDialogOpen(false);
    
    // Find customer id based on phone number if entered
    let customerId = selectedCustomerId;
    if (customerPhone && !customerId) {
      const customer = findCustomerByPhone(customerPhone);
      if (customer) {
        customerId = customer.id;
      }
    }
    
    // Pass payment method and customer ID to the parent checkout handler
    onCheckout(paymentMethod, customerId);

    toast({
      title: "Order completed",
      description: "Payment processed successfully",
      variant: "default",
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold font-poppins text-gray-800">Current Order</h2>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-500 hover:text-red-500"
                onClick={onClearCart}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-300 mb-2" />
            <h3 className="text-gray-500 font-medium">Your cart is empty</h3>
            <p className="text-gray-400 text-sm mt-1">
              Add products to begin your order
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex border-b border-gray-100 pb-3"
                >
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-800">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.product.price)} &times; {item.quantity} {item.product.unit}
                    </p>
                  </div>

                  <div className="ml-3 flex items-center">
                    <div className="flex items-center border rounded-md">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none text-gray-500"
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <div className="w-10 text-center text-sm">
                        {item.quantity}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none text-gray-500"
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="ml-3 w-20 text-right">
                      <span className="text-sm font-medium">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Cart Summary */}
        <div className="border-t border-gray-200 p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax (8.25%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2"></div>
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-medium text-lg">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-4">
            <Button
              className="w-full bg-primary hover:bg-primary-dark"
              size="lg"
              onClick={handleCheckout}
              disabled={items.length === 0 || !selectedStore}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Order</DialogTitle>
            <DialogDescription>
              Finalize the purchase with payment details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="payment-method" className="text-sm font-medium">
                Payment Method
              </label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="debit">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="customer" className="text-sm font-medium">
                Customer Phone (Optional)
              </label>
              <Input
                id="customer"
                placeholder="Customer phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="border rounded-md p-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-100 my-1 pt-1"></div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary-dark" onClick={processPayment}>
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
