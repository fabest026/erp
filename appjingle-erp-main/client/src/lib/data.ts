import { OrderStatus, OrderType } from "@shared/schema";

export interface StatusOption {
  value: OrderStatus;
  label: string;
  color: string;
}

export interface OrderTypeOption {
  value: OrderType;
  label: string;
}

export const orderStatusOptions: StatusOption[] = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "bg-yellow-100 text-yellow-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export const orderTypeOptions: OrderTypeOption[] = [
  { value: "in_store", label: "In Store" },
  { value: "online", label: "Online" }
];

export const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit Card" },
  { value: "debit", label: "Debit Card" },
  { value: "online", label: "Online Payment" },
];

export const employeePositions = [
  { value: "manager", label: "Store Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "inventory", label: "Inventory Clerk" },
  { value: "stocker", label: "Stocker" },
  { value: "butcher", label: "Butcher" },
  { value: "baker", label: "Baker" },
  { value: "produce", label: "Produce Clerk" },
  { value: "customer_service", label: "Customer Service" },
  { value: "delivery", label: "Delivery Driver" },
];

export const dateRangeOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
];

export const weightUnits = [
  { value: "lb", label: "Pound (lb)" },
  { value: "kg", label: "Kilogram (kg)" },
  { value: "oz", label: "Ounce (oz)" },
  { value: "g", label: "Gram (g)" },
];

export const volumeUnits = [
  { value: "gallon", label: "Gallon" },
  { value: "half-gallon", label: "Half Gallon" },
  { value: "quart", label: "Quart" },
  { value: "pint", label: "Pint" },
  { value: "liter", label: "Liter" },
  { value: "ml", label: "Milliliter" },
];

export const countUnits = [
  { value: "piece", label: "Piece" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "dozen", label: "Dozen" },
  { value: "case", label: "Case" },
  { value: "bag", label: "Bag" },
];

export const allUnits = [...weightUnits, ...volumeUnits, ...countUnits];

export const getUnitLabel = (unitValue: string): string => {
  const unit = allUnits.find(u => u.value === unitValue);
  return unit ? unit.label : unitValue;
};

export const getStatusBadgeColor = (status: OrderStatus | string): string => {
  const statusOption = orderStatusOptions.find(s => s.value === status);
  return statusOption ? statusOption.color : "bg-gray-100 text-gray-800";
};

export const getStatusLabel = (status: OrderStatus | string): string => {
  const statusOption = orderStatusOptions.find(s => s.value === status);
  return statusOption ? statusOption.label : status;
};
