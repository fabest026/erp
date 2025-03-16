import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

const Header = ({ toggleMobileSidebar }: HeaderProps) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-white z-10 border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileSidebar}
          className="text-gray-500 hover:text-gray-700"
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 1a1 1 0 011 1v.5a1 1 0 01-1 1H3a1 1 0 00-1 1V15a1 1 0 001 1h10a1 1 0 001-1v-3.5a1 1 0 011-1h.5a1 1 0 011 1V15a3 3 0 01-3 3H3a3 3 0 01-3-3V4.5a3 3 0 013-3h5zM12.5 4a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-3 4a1 1 0 011-1h.01a1 1 0 110 2H10.5a1 1 0 01-1-1zm3.25 1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM8 10a1 1 0 011-1h.01a1 1 0 110 2H9a1 1 0 01-1-1zm1.5 3a.75.75 0 000 1.5h.01a.75.75 0 000-1.5H9.5z" />
          </svg>
          <h1 className="text-lg font-semibold font-poppins text-primary">GroceryERP</h1>
        </div>
        
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-amber-500" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
