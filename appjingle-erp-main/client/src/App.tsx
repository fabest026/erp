import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import POS from "@/pages/POS";
import Orders from "@/pages/Orders";
import Inventory from "@/pages/Inventory";
import Customers from "@/pages/Customers";
import Stores from "@/pages/Stores";
import Employees from "@/pages/Employees";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import AuthPage from "@/pages/auth-page";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/pos" component={POS} />
      <ProtectedRoute path="/products" component={Products} />
      <ProtectedRoute path="/orders" component={Orders} />
      <ProtectedRoute path="/inventory" component={Inventory} />
      <ProtectedRoute path="/customers" component={Customers} />
      <ProtectedRoute path="/stores" component={Stores} />
      <ProtectedRoute path="/employees" component={Employees} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthPage] = useRoute("/auth");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {isAuthPage ? (
          <Router />
        ) : (
          <MainLayout>
            <Router />
          </MainLayout>
        )}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
