import { ShoppingBasket, Package, UserPlus, BarChart3 } from "lucide-react";

const QuickAccess = () => {
  const quickLinks = [
    {
      title: "New Order",
      icon: <ShoppingBasket className="h-6 w-6 text-primary" />,
      path: "/pos"
    },
    {
      title: "Add Product",
      icon: <Package className="h-6 w-6 text-secondary" />,
      path: "/products/new"
    },
    {
      title: "New Customer",
      icon: <UserPlus className="h-6 w-6 text-accent" />,
      path: "/customers/new"
    },
    {
      title: "Reports",
      icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
      path: "/reports"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-lg font-poppins text-gray-800">Quick Access</h2>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {quickLinks.map((link, index) => (
          <div 
            key={index} 
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition duration-150 flex flex-col items-center cursor-pointer"
            onClick={() => window.location.href = link.path}
          >
            <span className="inline-block mb-2">{link.icon}</span>
            <p className="text-sm font-medium text-gray-800">{link.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAccess;
