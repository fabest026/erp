import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Download, 
  FileText, 
  Filter, 
  PieChart as PieChartIcon 
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { dateRangeOptions } from "@/lib/data";

// Sample data for charts (in a real app, this would come from the API)
const sampleSalesData = [
  { name: "Jan", total: 4200 },
  { name: "Feb", total: 3800 },
  { name: "Mar", total: 5200 },
  { name: "Apr", total: 4800 },
  { name: "May", total: 6000 },
  { name: "Jun", total: 7200 },
  { name: "Jul", total: 8300 },
  { name: "Aug", total: 7500 },
  { name: "Sep", total: 6800 },
  { name: "Oct", total: 7300 },
  { name: "Nov", total: 8600 },
  { name: "Dec", total: 9500 },
];

const sampleCategoryData = [
  { name: "Fruits & Vegetables", value: 35 },
  { name: "Dairy & Eggs", value: 25 },
  { name: "Meat & Seafood", value: 20 },
  { name: "Bakery", value: 15 },
  { name: "Beverages", value: 5 },
];

const COLORS = ["#27AE60", "#2980B9", "#F39C12", "#E67E22", "#CB4335"];

// Top 10 selling products for product performance report
const sampleTopProducts = [
  { id: 1, name: "Organic Apples", category: "Fruits & Vegetables", sold: 142, revenue: 566.58 },
  { id: 2, name: "Whole Milk", category: "Dairy & Eggs", sold: 128, revenue: 318.72 },
  { id: 3, name: "Artisan Bread", category: "Bakery", sold: 95, revenue: 403.75 },
  { id: 4, name: "Chicken Breast", category: "Meat & Seafood", sold: 87, revenue: 521.13 },
  { id: 5, name: "Organic Bananas", category: "Fruits & Vegetables", sold: 76, revenue: 75.24 },
  { id: 6, name: "Almond Milk", category: "Dairy & Eggs", sold: 68, revenue: 237.32 },
  { id: 7, name: "Ground Beef", category: "Meat & Seafood", sold: 64, revenue: 447.36 },
  { id: 8, name: "Eggs (Dozen)", category: "Dairy & Eggs", sold: 63, revenue: 226.80 },
  { id: 9, name: "Avocados", category: "Fruits & Vegetables", sold: 58, revenue: 174.00 },
  { id: 10, name: "Frozen Pizza", category: "Frozen Foods", sold: 52, revenue: 363.48 },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState<string>("thisMonth");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const { data: stores, isLoading: storesLoading } = useQuery({
    queryKey: ['/api/stores'],
  });

  // Define table columns for product performance report
  const productColumns = [
    {
      header: "Product",
      accessorKey: "name",
      enableSorting: true,
      cell: (row: any) => <div className="font-medium">{row.name}</div>,
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Units Sold",
      accessorKey: "sold",
      enableSorting: true,
      cell: (row: any) => <div className="text-right">{row.sold}</div>,
    },
    {
      header: "Revenue",
      accessorKey: "revenue",
      enableSorting: true,
      cell: (row: any) => <div className="text-right">{formatCurrency(row.revenue)}</div>,
    },
  ];

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-poppins text-gray-800">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">View and analyze business performance</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  selectedDate.toLocaleDateString()
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <Select
            value={dateRange}
            onValueChange={setDateRange}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-auto">
          <Select
            value={selectedStore}
            onValueChange={setSelectedStore}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores?.map((store: any) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 flex justify-end">
          <Button variant="outline" className="w-full md:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales">
        <TabsList className="mb-6">
          <TabsTrigger value="sales" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Sales Report
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Product Performance
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Category Breakdown
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                Monthly sales data for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sampleSalesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('en-US', {
                          notation: 'compact',
                          compactDisplay: 'short',
                          currency: 'USD',
                        }).format(value)
                      } 
                    />
                    <Tooltip 
                      formatter={(value) => 
                        new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(Number(value))
                      } 
                    />
                    <Legend />
                    <Bar dataKey="total" name="Revenue" fill="#27AE60" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
                <CardDescription>
                  Daily sales trend for the current month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.from({ length: 30 }, (_, i) => ({
                        day: i + 1,
                        sales: Math.floor(Math.random() * 5000) + 1000,
                      }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis 
                        tickFormatter={(value) => 
                          new Intl.NumberFormat('en-US', {
                            notation: 'compact',
                            compactDisplay: 'short',
                            currency: 'USD',
                          }).format(value)
                        } 
                      />
                      <Tooltip 
                        formatter={(value) => 
                          new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(Number(value))
                        } 
                        labelFormatter={(label) => `Day ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        name="Daily Sales"
                        stroke="#2980B9"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Types</CardTitle>
                <CardDescription>
                  Distribution of in-store vs. online orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'In-Store', value: 65 },
                          { name: 'Online', value: 35 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#2980B9" />
                        <Cell fill="#F39C12" />
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Performance of your best-selling products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={productColumns}
                data={sampleTopProducts}
                searchable={true}
                pagination={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Distribution of sales across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sampleCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sampleCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
