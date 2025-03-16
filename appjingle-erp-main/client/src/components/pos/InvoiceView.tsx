import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CartItem } from "./POSLayout";
import { Check, Edit, FileText, Printer, X } from "lucide-react";
import { Customer } from "@shared/schema";

interface InvoiceProps {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  selectedCustomer?: Customer | null;
  storeInfo?: any;
  onClose: () => void;
  isEditable?: boolean;
}

export default function InvoiceView({
  orderNumber,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  selectedCustomer,
  storeInfo,
  onClose,
  isEditable = false
}: InvoiceProps) {
  const [isEditing, setIsEditing] = useState(isEditable);
  const [notes, setNotes] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${orderNumber.split('-')[1]}`);
  const [customerDetails, setCustomerDetails] = useState({
    name: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : "",
    email: selectedCustomer?.email || "",
    phone: selectedCustomer?.phone || "",
    address: selectedCustomer ? 
      `${selectedCustomer.address || ""}, ${selectedCustomer.city || ""}, ${selectedCustomer.state || ""} ${selectedCustomer.zipCode || ""}` : 
      ""
  });
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; }
            .invoice { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company-info h1 { margin: 0 0 5px 0; color: #27AE60; }
            .company-info p { margin: 0; color: #666; }
            .invoice-details { text-align: right; }
            .invoice-details h2 { margin: 0 0 5px 0; }
            .invoice-details p { margin: 0; color: #666; }
            .customer-details { margin-bottom: 30px; }
            .customer-details h3 { margin: 0 0 10px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th { background-color: #f5f5f5; padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }
            .items-table tfoot td { border-bottom: none; font-weight: bold; }
            .summary { text-align: right; }
            .notes { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
            @media print {
              body { font-size: 12pt; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice">
            ${content.innerHTML}
            <div class="footer">
              <p>Thank you for your business!</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    // Here you would typically save the edited invoice details to your database
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold flex items-center text-primary">
          <FileText className="mr-2" />
          {isEditing ? 'Edit Invoice' : 'Invoice'}
        </h2>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveEdit}>
                <Check className="h-4 w-4 mr-1" /> Save
              </Button>
            </>
          ) : (
            <>
              {isEditable && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4 mr-1" /> Close
              </Button>
            </>
          )}
        </div>
      </div>

      <div ref={printRef}>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="company-info">
            <h3 className="text-lg font-semibold mb-2">From</h3>
            {isEditing ? (
              <div className="space-y-2">
                <Input 
                  value={storeInfo?.name || "GroceryERP Store"} 
                  disabled 
                  className="bg-gray-50"
                />
                <Input 
                  value={storeInfo?.address || "123 Main Street"} 
                  disabled 
                  className="bg-gray-50"
                />
                <Input 
                  value={storeInfo?.phone || "555-1234-5678"} 
                  disabled 
                  className="bg-gray-50"
                />
                <Input 
                  value={storeInfo?.email || "contact@groceryerp.com"} 
                  disabled 
                  className="bg-gray-50"
                />
              </div>
            ) : (
              <div>
                <p className="font-semibold">{storeInfo?.name || "GroceryERP Store"}</p>
                <p>{storeInfo?.address || "123 Main Street"}</p>
                <p>{storeInfo?.phone || "555-1234-5678"}</p>
                <p>{storeInfo?.email || "contact@groceryerp.com"}</p>
              </div>
            )}
          </div>

          <div className="invoice-details text-right">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-medium">Invoice Number:</p>
                {isEditing ? (
                  <Input 
                    value={invoiceNumber} 
                    onChange={(e) => setInvoiceNumber(e.target.value)} 
                    className="w-48 ml-auto"
                  />
                ) : (
                  <p>{invoiceNumber}</p>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Order Number:</p>
                <p>{orderNumber}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Date:</p>
                <p>{formatDate(new Date())}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Payment Method:</p>
                <p className="capitalize">{paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Bill To</h3>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              <Input 
                value={customerDetails.name} 
                onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})} 
                placeholder="Customer Name"
              />
              <Input 
                value={customerDetails.email} 
                onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})} 
                placeholder="Email"
              />
              <Input 
                value={customerDetails.phone} 
                onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})} 
                placeholder="Phone"
              />
              <Input 
                value={customerDetails.address} 
                onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})} 
                placeholder="Address"
              />
            </div>
          ) : (
            <div>
              {customerDetails.name && <p className="font-medium">{customerDetails.name}</p>}
              {customerDetails.email && <p>{customerDetails.email}</p>}
              {customerDetails.phone && <p>{customerDetails.phone}</p>}
              {customerDetails.address && <p>{customerDetails.address}</p>}
              {!customerDetails.name && !customerDetails.email && !customerDetails.phone && !customerDetails.address && 
                <p className="text-gray-500 italic">No customer selected</p>
              }
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Items</h3>
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-left border-b">Item</th>
                <th className="py-2 px-4 text-right border-b">Price</th>
                <th className="py-2 px-4 text-right border-b">Quantity</th>
                <th className="py-2 px-4 text-right border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.product.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">{formatCurrency(parseFloat(item.product.price))}</td>
                  <td className="py-3 px-4 text-right">{item.quantity}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mb-8">
          <div className="w-1/2">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            {isEditing ? (
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Add any notes about the transaction"
                className="h-32"
              />
            ) : (
              <div className="border rounded p-3 bg-gray-50 h-32 overflow-auto">
                {notes || <span className="text-gray-400 italic">No notes added</span>}
              </div>
            )}
          </div>
          
          <div className="w-1/3">
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Tax:</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-4">
        {!isEditing && (
          <div className="text-gray-500 text-sm italic">
            {isEditable ? 
              "You can edit this invoice using the Edit button" : 
              "This is a preview of your invoice"
            }
          </div>
        )}
      </div>
    </div>
  );
}