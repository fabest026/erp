import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  ShoppingCart,
  Package,
  ShoppingBasket,
  User,
  BarChart3,
  Store,
  Users,
  Settings,
  Database,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
}

const navItems = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", path: "/", icon: <LayoutDashboard className="h-5 w-5" /> },
      { name: "POS", path: "/pos", icon: <ShoppingCart className="h-5 w-5" /> },
      { name: "Orders", path: "/orders", icon: <ShoppingBasket className="h-5 w-5" /> },
      { name: "Products", path: "/products", icon: <Package className="h-5 w-5" /> },
      { name: "Customers", path: "/customers", icon: <User className="h-5 w-5" /> },
    ]
  },
  {
    title: "Management",
    items: [
      { name: "Inventory", path: "/inventory", icon: <Database className="h-5 w-5" /> },
      { name: "Stores", path: "/stores", icon: <Store className="h-5 w-5" /> },
      { name: "Employees", path: "/employees", icon: <Users className="h-5 w-5" /> },
      { name: "Reports", path: "/reports", icon: <BarChart3 className="h-5 w-5" /> },
      { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
    ]
  }
];

const Sidebar = ({ isMobileOpen, closeMobileSidebar }: SidebarProps) => {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex-none flex-col bg-white shadow-sm border-r border-gray-200 transition-transform duration-300 md:static md:translate-x-0 flex",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 1a1 1 0 011 1v.5a1 1 0 01-1 1H3a1 1 0 00-1 1V15a1 1 0 001 1h10a1 1 0 001-1v-3.5a1 1 0 011-1h.5a1 1 0 011 1V15a3 3 0 01-3 3H3a3 3 0 01-3-3V4.5a3 3 0 013-3h5zM12.5 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-3 4a1 1 0 011-1h.01a1 1 0 110 2H10.5a1 1 0 01-1-1zm3.25 1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM8 10a1 1 0 011-1h.01a1 1 0 110 2H9a1 1 0 01-1-1zm1.5 3a.75.75 0 000 1.5h.01a.75.75 0 000-1.5H9.5z" />
            </svg>
            <h1 className="text-xl font-semibold font-poppins text-primary">GroceryERP</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto pt-5 pb-4">
          {navItems.map((section, index) => (
            <div key={section.title} className={cn(index > 0 && "mt-6")}>
              <div className="px-4 mb-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{section.title}</h2>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div
                    key={item.path}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium cursor-pointer",
                      location === item.path
                        ? "bg-emerald-50 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => {
                      if (isMobileOpen) closeMobileSidebar();
                      window.location.href = item.path;
                    }}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary">SJ</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Sarah Johnson</p>
                <p className="text-xs text-gray-500">Store Manager</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
