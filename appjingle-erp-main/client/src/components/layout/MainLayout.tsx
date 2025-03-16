import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        closeMobileSidebar={closeMobileSidebar} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleMobileSidebar={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
