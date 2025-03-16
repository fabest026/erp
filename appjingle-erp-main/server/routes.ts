import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProductSchema,
  insertProductCategorySchema,
  insertStoreSchema,
  insertInventorySchema,
  insertEmployeeSchema,
  insertCustomerSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertUserSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema,
  OrderStatusEnum,
  OrderTypeEnum
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // Categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await storage.getCategory(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    try {
      const categoryData = insertProductCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const success = await storage.deleteCategory(id);
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(204).send();
  });

  // Products
  app.get("/api/products", async (req: Request, res: Response) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const success = await storage.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(204).send();
  });

  // Stores
  app.get("/api/stores", async (req: Request, res: Response) => {
    const stores = await storage.getStores();
    res.json(stores);
  });

  app.get("/api/stores/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid store ID" });
    }

    const store = await storage.getStore(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json(store);
  });

  app.post("/api/stores", async (req: Request, res: Response) => {
    try {
      const storeData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(storeData);
      res.status(201).json(store);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid store data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create store" });
    }
  });

  app.put("/api/stores/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid store ID" });
    }

    try {
      const storeData = insertStoreSchema.partial().parse(req.body);
      const store = await storage.updateStore(id, storeData);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      res.json(store);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid store data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update store" });
    }
  });

  app.delete("/api/stores/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid store ID" });
    }

    const success = await storage.deleteStore(id);
    if (!success) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.status(204).send();
  });

  // Inventory
  app.get("/api/inventory", async (req: Request, res: Response) => {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const inventory = await storage.getInventory(storeId);
    res.json(inventory);
  });

  app.get("/api/inventory/low-stock", async (req: Request, res: Response) => {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const lowStockItems = await storage.getLowStockItems(storeId);
    res.json(lowStockItems);
  });

  app.get("/api/inventory/product/:productId", async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const inventoryItem = await storage.getProductInventory(productId, storeId);
    if (!inventoryItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.json(inventoryItem);
  });

  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      const inventoryData = insertInventorySchema.parse(req.body);
      const inventoryItem = await storage.createInventory(inventoryData);
      res.status(201).json(inventoryItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid inventory ID" });
    }

    try {
      const inventoryData = insertInventorySchema.partial().parse(req.body);
      const inventoryItem = await storage.updateInventory(id, inventoryData);
      if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.json(inventoryItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  // Employees
  app.get("/api/employees", async (req: Request, res: Response) => {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const employees = await storage.getEmployees(storeId);
    res.json(employees);
  });

  app.get("/api/employees/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await storage.getEmployee(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  });

  app.post("/api/employees", async (req: Request, res: Response) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    try {
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, employeeData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const success = await storage.deleteEmployee(id);
    if (!success) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(204).send();
  });

  // Customers
  app.get("/api/customers", async (req: Request, res: Response) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.get("/api/customers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await storage.getCustomer(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  });

  app.post("/api/customers", async (req: Request, res: Response) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const success = await storage.deleteCustomer(id);
    if (!success) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(204).send();
  });

  // Orders
  app.get("/api/orders", async (req: Request, res: Response) => {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const orders = await storage.getOrders(storeId);
    res.json(orders);
  });

  app.get("/api/orders/recent", async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const recentOrders = await storage.getRecentOrders(limit, storeId);
    res.json(recentOrders);
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await storage.getOrderWithItems(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      const orderData = insertOrderSchema.parse(order);
      const itemsData = z.array(insertOrderItemSchema).parse(items);

      const newOrder = await storage.createOrder(orderData, itemsData);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id/status", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
      const { status } = req.body;
      const orderStatus = OrderStatusEnum.parse(status);

      const order = await storage.updateOrderStatus(id, orderStatus);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Auth and Users
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await storage.validateUser(username, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get the employee data if available
    let employee = undefined;
    if (user.employeeId) {
      employee = await storage.getEmployee(user.employeeId);
    }

    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      employee
    });
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        employeeId: user.employeeId,
        isActive: user.isActive
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    
    // Get recent orders
    const recentOrders = await storage.getRecentOrders(5, storeId);
    
    // Get low stock items
    const lowStockItems = await storage.getLowStockItems(storeId);
    
    // Get today's orders count
    const allOrders = await storage.getOrders(storeId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysOrders = allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= today;
    });
    
    // Calculate today's revenue
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + Number(order.total), 0);
    
    // Get customer count
    const customers = await storage.getCustomers();
    
    // Get products and inventory for top selling calculation
    const products = await storage.getProducts();
    const orderItems = Array.from(allOrders).flatMap(async order => {
      return await storage.getOrderItems(order.id);
    });
    
    // Prepare dashboard data
    const dashboardData = {
      todaysOrders: todaysOrders.length,
      todaysRevenue,
      customerCount: customers.length,
      lowStockCount: lowStockItems.length,
      recentOrders,
      lowStockItems: await Promise.all(
        lowStockItems.map(async item => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      )
    };
    
    res.json(dashboardData);
  });

  // Purchase Orders
  app.get("/api/purchase-orders", async (req: Request, res: Response) => {
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const purchaseOrders = await storage.getPurchaseOrders(storeId);
    res.json(purchaseOrders);
  });

  app.get("/api/purchase-orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid purchase order ID" });
    }

    const purchaseOrder = await storage.getPurchaseOrder(id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const items = await storage.getPurchaseOrderItems(id);
    res.json({ purchaseOrder, items });
  });

  app.post("/api/purchase-orders", async (req: Request, res: Response) => {
    try {
      const { purchaseOrder, items } = req.body;
      
      const poData = insertPurchaseOrderSchema.parse(purchaseOrder);
      const itemsData = z.array(insertPurchaseOrderItemSchema).parse(items);

      const newPO = await storage.createPurchaseOrder(poData, itemsData);
      res.status(201).json(newPO);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  app.put("/api/purchase-orders/:id/status", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid purchase order ID" });
    }

    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const purchaseOrder = await storage.updatePurchaseOrderStatus(id, status);
      if (!purchaseOrder) {
        return res.status(404).json({ message: "Purchase order not found" });
      }

      res.json(purchaseOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update purchase order status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
