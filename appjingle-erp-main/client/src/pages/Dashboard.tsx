import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, DollarSign, Users, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatCard from "@/components/dashboard/StatCard";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import QuickAccess from "@/components/dashboard/QuickAccess";
import TopSellingProducts from "@/components/dashboard/TopSellingProducts";
import InventoryAlert from "@/components/dashboard/InventoryAlert";
import { Store } from "@shared/schema";

interface DashboardData {
  todaysOrders: number;
  todaysRevenue: number;
  customerCount: number;
  lowStockCount: number;
}

const Dashboard = () => {
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("today");
  const [category, setCategory] = useState<string>("all");

  const { data: stores } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
  });

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard', { storeId: selectedStore !== "all" ? parseInt(selectedStore) : undefined }],
  });

  // If the data is loading, use placeholder values
  const stats = [
    {
      title: "Today's Orders",
      value: isLoading ? "-" : dashboardData?.todaysOrders || 0,
      icon: ShoppingCart,
      change: { value: "12%", type: "increase" as const },
      color: "primary" as const,
      compareText: "vs yesterday"
    },
    {
      title: "Revenue",
      value: isLoading ? "-" : `$${dashboardData?.todaysRevenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      change: { value: "8.2%", type: "increase" as const },
      color: "secondary" as const,
      compareText: "vs yesterday"
    },
    {
      title: "Customers",
      value: isLoading ? "-" : dashboardData?.customerCount || 0,
      icon: Users,
      change: { value: "5.1%", type: "increase" as const },
      color: "accent" as const,
      compareText: "vs yesterday"
    },
    {
      title: "Low Stock Items",
      value: isLoading ? "-" : dashboardData?.lowStockCount || 0,
      icon: AlertCircle,
      change: { value: "3", type: "increase" as const },
      color: "danger" as const,
      compareText: "since last week"
    }
  ];

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-poppins text-gray-800">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of your grocery business</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 w-full"
            />
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
          <Button className="inline-flex items-center bg-primary hover:bg-primary-dark">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      {/* Store Selection & Quick Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <label htmlFor="store-select" className="block text-sm font-medium text-gray-500 mb-1">Store Location</label>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores?.map(store => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <label htmlFor="date-range" className="block text-sm font-medium text-gray-500 mb-1">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Today" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-500 mb-1">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="1">Fruits & Vegetables</SelectItem>
              <SelectItem value="2">Dairy & Eggs</SelectItem>
              <SelectItem value="3">Meat & Seafood</SelectItem>
              <SelectItem value="4">Bakery</SelectItem>
              <SelectItem value="5">Beverages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable />
        </div>
        
        {/* Side Panel Content */}
        <div className="space-y-6">
          <QuickAccess />
          <TopSellingProducts />
          <InventoryAlert />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
