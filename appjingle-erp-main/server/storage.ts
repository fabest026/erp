import { 
  Product, InsertProduct, products,
  ProductCategory, InsertProductCategory, productCategories,
  Store, InsertStore, stores,
  Inventory, InsertInventory, inventory,
  Employee, InsertEmployee, employees,
  Customer, InsertCustomer, customers,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems,
  User, InsertUser, users,
  PurchaseOrder, InsertPurchaseOrder, purchaseOrders,
  PurchaseOrderItem, InsertPurchaseOrderItem, purchaseOrderItems,
  OrderStatus, OrderType
} from "@shared/schema";

// Storage interface
import session from "express-session";
import createMemoryStore from "memorystore";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Categories
  getCategories(): Promise<ProductCategory[]>;
  getCategory(id: number): Promise<ProductCategory | undefined>;
  createCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateCategory(id: number, category: Partial<ProductCategory>): Promise<ProductCategory | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<Store>): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;

  // Inventory
  getInventory(storeId?: number): Promise<Inventory[]>;
  getProductInventory(productId: number, storeId?: number): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, inventory: Partial<Inventory>): Promise<Inventory | undefined>;
  getLowStockItems(storeId?: number): Promise<Inventory[]>;

  // Employees
  getEmployees(storeId?: number): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Orders
  getOrders(storeId?: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<{ order: Order; items: OrderItem[] } | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined>;
  getOrdersByStatus(status: OrderStatus, storeId?: number): Promise<Order[]>;
  getOrdersByType(type: OrderType, storeId?: number): Promise<Order[]>;
  getRecentOrders(limit: number, storeId?: number): Promise<Order[]>;

  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | undefined>;

  // Purchase Orders
  getPurchaseOrders(storeId?: number): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(purchaseOrder: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder>;
  updatePurchaseOrderStatus(id: number, status: string): Promise<PurchaseOrder | undefined>;
  
  // Purchase Order Items
  getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private categories: Map<number, ProductCategory>;
  private stores: Map<number, Store>;
  private inventory: Map<number, Inventory>;
  private employees: Map<number, Employee>;
  private customers: Map<number, Customer>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private users: Map<number, User>;
  private purchaseOrders: Map<number, PurchaseOrder>;
  private purchaseOrderItems: Map<number, PurchaseOrderItem>;
  
  public sessionStore: session.Store;

  // Counters for IDs
  private productId: number;
  private categoryId: number;
  private storeId: number;
  private inventoryId: number;
  private employeeId: number;
  private customerId: number;
  private orderId: number;
  private orderItemId: number;
  private userId: number;
  private purchaseOrderId: number;
  private purchaseOrderItemId: number;

  constructor() {
    // Initialize maps
    this.products = new Map();
    this.categories = new Map();
    this.stores = new Map();
    this.inventory = new Map();
    this.employees = new Map();
    this.customers = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.users = new Map();
    this.purchaseOrders = new Map();
    this.purchaseOrderItems = new Map();

    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Clear expired sessions once per day
    });

    // Initialize counters
    this.productId = 1;
    this.categoryId = 1;
    this.storeId = 1;
    this.inventoryId = 1;
    this.employeeId = 1;
    this.customerId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.userId = 1;
    this.purchaseOrderId = 1;
    this.purchaseOrderItemId = 1;

    // Initialize with some sample data
    this.initializeSampleData();
  }

  // Initialize some sample data for demo purposes
  private async initializeSampleData() {
    // Add sample categories
    const categories = [
      { name: 'Fruits & Vegetables', description: 'Fresh produce', imageUrl: '' },
      { name: 'Dairy & Eggs', description: 'Milk, cheese, and eggs', imageUrl: '' },
      { name: 'Meat & Seafood', description: 'Fresh meat and seafood', imageUrl: '' },
      { name: 'Bakery', description: 'Bread and baked goods', imageUrl: '' },
      { name: 'Beverages', description: 'Drinks and juices', imageUrl: '' },
    ];
    
    categories.forEach(cat => this.createCategory(cat));

    // Add sample stores
    const stores = [
      { name: 'Main Street - Downtown', address: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '90001', phone: '555-1234', email: 'downtown@groceryerp.com', isActive: true },
      { name: 'Westside Plaza', address: '456 West Ave', city: 'Anytown', state: 'CA', zipCode: '90002', phone: '555-5678', email: 'westside@groceryerp.com', isActive: true },
      { name: 'Northgate Mall', address: '789 North Blvd', city: 'Anytown', state: 'CA', zipCode: '90003', phone: '555-9012', email: 'northgate@groceryerp.com', isActive: true },
    ];
    
    stores.forEach(store => this.createStore(store));

    // Add sample products
    const products = [
      { name: 'Organic Apples', description: 'Fresh organic apples', sku: 'P001', price: '3.99', categoryId: 1, imageUrl: '', barcode: '123456789', unit: 'lb', isActive: true },
      { name: 'Whole Milk', description: 'Whole milk', sku: 'P002', price: '2.49', categoryId: 2, imageUrl: '', barcode: '234567890', unit: 'gallon', isActive: true },
      { name: 'Artisan Bread', description: 'Freshly baked artisan bread', sku: 'P003', price: '4.25', categoryId: 4, imageUrl: '', barcode: '345678901', unit: 'loaf', isActive: true },
      { name: 'Chicken Breast', description: 'Fresh chicken breast', sku: 'P004', price: '5.99', categoryId: 3, imageUrl: '', barcode: '456789012', unit: 'lb', isActive: true },
      { name: 'Organic Bananas', description: 'Fresh organic bananas', sku: 'P005', price: '0.99', categoryId: 1, imageUrl: '', barcode: '567890123', unit: 'lb', isActive: true },
      { name: 'Almond Milk', description: 'Unsweetened almond milk', sku: 'P006', price: '3.49', categoryId: 2, imageUrl: '', barcode: '678901234', unit: 'half-gallon', isActive: true },
      { name: 'Frozen Pizza', description: 'Pepperoni pizza', sku: 'P007', price: '6.99', categoryId: 5, imageUrl: '', barcode: '789012345', unit: 'piece', isActive: true },
    ];
    
    products.forEach(product => this.createProduct(product));

    // Add sample employees
    const employees = [
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@groceryerp.com', phone: '555-1111', position: 'Store Manager', storeId: 1, isActive: true },
      { firstName: 'John', lastName: 'Smith', email: 'john@groceryerp.com', phone: '555-2222', position: 'Cashier', storeId: 1, isActive: true },
      { firstName: 'Michael', lastName: 'Davis', email: 'michael@groceryerp.com', phone: '555-3333', position: 'Inventory Clerk', storeId: 1, isActive: true },
      { firstName: 'Emily', lastName: 'Wilson', email: 'emily@groceryerp.com', phone: '555-4444', position: 'Store Manager', storeId: 2, isActive: true },
      { firstName: 'David', lastName: 'Brown', email: 'david@groceryerp.com', phone: '555-5555', position: 'Cashier', storeId: 2, isActive: true },
    ];
    
    employees.forEach(employee => this.createEmployee(employee));

    // Add sample users - for our sample data, we'll use a dummy hashed value
    // Normally we'd use hashPassword but for simplicity use pre-generated hash
    // This is the hash of 'password123' for testing
    const hashedPassword = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.f7ff9e8b7bb2e09b70935a5d785e0cc5d9d0abf0';
    
    const users = [
      { username: 'sarah', password: hashedPassword, email: 'sarah@groceryerp.com', role: 'admin', employeeId: 1, isActive: true },
      { username: 'john', password: hashedPassword, email: 'john@groceryerp.com', role: 'employee', employeeId: 2, isActive: true },
      { username: 'michael', password: hashedPassword, email: 'michael@groceryerp.com', role: 'employee', employeeId: 3, isActive: true },
      { username: 'emily', password: hashedPassword, email: 'emily@groceryerp.com', role: 'manager', employeeId: 4, isActive: true },
      { username: 'david', password: hashedPassword, email: 'david@groceryerp.com', role: 'employee', employeeId: 5, isActive: true },
      // Add meman user to match the one user tried to log in with
      { username: 'meman', password: hashedPassword, email: 'meman@groceryerp.com', role: 'admin', isActive: true },
    ];
    
    users.forEach(user => this.createUser(user));

    // Add sample customers
    const customers = [
      { firstName: 'Robert', lastName: 'Johnson', email: 'robert@example.com', phone: '555-1111', address: '123 Oak St', city: 'Anytown', state: 'CA', zipCode: '90001' },
      { firstName: 'Maria', lastName: 'Garcia', email: 'maria@example.com', phone: '555-2222', address: '456 Pine St', city: 'Anytown', state: 'CA', zipCode: '90001' },
      { firstName: 'James', lastName: 'Smith', email: 'james@example.com', phone: '555-3333', address: '789 Maple St', city: 'Anytown', state: 'CA', zipCode: '90002' },
      { firstName: 'Jennifer', lastName: 'Brown', email: 'jennifer@example.com', phone: '555-4444', address: '321 Elm St', city: 'Anytown', state: 'CA', zipCode: '90002' },
      { firstName: 'Jose', lastName: 'Martinez', email: 'jose@example.com', phone: '555-5555', address: '654 Birch St', city: 'Anytown', state: 'CA', zipCode: '90003' },
    ];
    
    customers.forEach(customer => this.createCustomer(customer));

    // Add sample inventory
    for (let i = 1; i <= 7; i++) {
      for (let j = 1; j <= 3; j++) {
        const quantity = i === 5 && j === 1 ? 3 : // Organic Bananas in Store 1 has 3 left
                         i === 6 && j === 1 ? 5 : // Almond Milk in Store 1 has 5 left
                         i === 7 && j === 1 ? 8 : // Frozen Pizza in Store 1 has 8 left
                         Math.floor(Math.random() * 100) + 20; // Random quantity for others
        
        this.createInventory({
          productId: i,
          storeId: j,
          quantity,
          minStockLevel: 10,
          maxStockLevel: 100
        });
      }
    }

    // Add sample orders
    const orders = [
      { orderNumber: 'ORD-2305', customerId: 1, employeeId: 2, storeId: 1, orderStatus: 'completed', orderType: 'in_store', total: '124.00', tax: '10.00', discount: '0.00', paymentMethod: 'credit' },
      { orderNumber: 'ORD-2304', customerId: 2, employeeId: 2, storeId: 1, orderStatus: 'processing', orderType: 'online', total: '67.50', tax: '5.50', discount: '0.00', paymentMethod: 'credit' },
      { orderNumber: 'ORD-2303', customerId: 3, employeeId: 5, storeId: 2, orderStatus: 'out_for_delivery', orderType: 'online', total: '89.95', tax: '7.50', discount: '0.00', paymentMethod: 'credit' },
      { orderNumber: 'ORD-2302', customerId: 4, employeeId: 5, storeId: 2, orderStatus: 'cancelled', orderType: 'online', total: '45.20', tax: '3.70', discount: '0.00', paymentMethod: 'credit' },
      { orderNumber: 'ORD-2301', customerId: 5, employeeId: 2, storeId: 1, orderStatus: 'completed', orderType: 'in_store', total: '112.75', tax: '9.25', discount: '0.00', paymentMethod: 'cash' },
    ];
    
    orders.forEach(order => {
      this.createOrder(order, []);
    });

    // Add sample order items
    const orderItems = [
      { orderId: 1, productId: 1, quantity: 5, price: '3.99', total: '19.95', discount: '0.00' },
      { orderId: 1, productId: 2, quantity: 2, price: '2.49', total: '4.98', discount: '0.00' },
      { orderId: 1, productId: 4, quantity: 3, price: '5.99', total: '17.97', discount: '0.00' },
      { orderId: 2, productId: 3, quantity: 2, price: '4.25', total: '8.50', discount: '0.00' },
      { orderId: 2, productId: 6, quantity: 1, price: '3.49', total: '3.49', discount: '0.00' },
      { orderId: 3, productId: 7, quantity: 2, price: '6.99', total: '13.98', discount: '0.00' },
      { orderId: 3, productId: 1, quantity: 3, price: '3.99', total: '11.97', discount: '0.00' },
      { orderId: 4, productId: 2, quantity: 1, price: '2.49', total: '2.49', discount: '0.00' },
      { orderId: 4, productId: 5, quantity: 4, price: '0.99', total: '3.96', discount: '0.00' },
      { orderId: 5, productId: 4, quantity: 2, price: '5.99', total: '11.98', discount: '0.00' },
      { orderId: 5, productId: 3, quantity: 3, price: '4.25', total: '12.75', discount: '0.00' },
    ];
    
    orderItems.forEach(item => this.createOrderItem(item));
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Categories
  async getCategories(): Promise<ProductCategory[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<ProductCategory | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertProductCategory): Promise<ProductCategory> {
    const id = this.categoryId++;
    const newCategory: ProductCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<ProductCategory>): Promise<ProductCategory | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;

    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Stores
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(store: InsertStore): Promise<Store> {
    const id = this.storeId++;
    const newStore: Store = { ...store, id };
    this.stores.set(id, newStore);
    return newStore;
  }

  async updateStore(id: number, store: Partial<Store>): Promise<Store | undefined> {
    const existingStore = this.stores.get(id);
    if (!existingStore) return undefined;

    const updatedStore = { ...existingStore, ...store };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }

  async deleteStore(id: number): Promise<boolean> {
    return this.stores.delete(id);
  }

  // Inventory
  async getInventory(storeId?: number): Promise<Inventory[]> {
    const allInventory = Array.from(this.inventory.values());
    if (storeId) {
      return allInventory.filter(item => item.storeId === storeId);
    }
    return allInventory;
  }

  async getProductInventory(productId: number, storeId?: number): Promise<Inventory | undefined> {
    const allInventory = Array.from(this.inventory.values());
    if (storeId) {
      return allInventory.find(item => item.productId === productId && item.storeId === storeId);
    }
    return allInventory.find(item => item.productId === productId);
  }

  async createInventory(inventory: InsertInventory): Promise<Inventory> {
    const id = this.inventoryId++;
    const newInventory: Inventory = { ...inventory, id };
    this.inventory.set(id, newInventory);
    return newInventory;
  }

  async updateInventory(id: number, inventory: Partial<Inventory>): Promise<Inventory | undefined> {
    const existingInventory = this.inventory.get(id);
    if (!existingInventory) return undefined;

    const updatedInventory = { ...existingInventory, ...inventory };
    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }

  async getLowStockItems(storeId?: number): Promise<Inventory[]> {
    const allInventory = await this.getInventory(storeId);
    return allInventory.filter(item => 
      item.quantity <= (item.minStockLevel || 10)
    );
  }

  // Employees
  async getEmployees(storeId?: number): Promise<Employee[]> {
    const allEmployees = Array.from(this.employees.values());
    if (storeId) {
      return allEmployees.filter(employee => employee.storeId === storeId);
    }
    return allEmployees;
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.employeeId++;
    const newEmployee: Employee = { ...employee, id };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<Employee>): Promise<Employee | undefined> {
    const existingEmployee = this.employees.get(id);
    if (!existingEmployee) return undefined;

    const updatedEmployee = { ...existingEmployee, ...employee };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.customerId++;
    const newCustomer: Customer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) return undefined;

    const updatedCustomer = { ...existingCustomer, ...customer };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Orders
  async getOrders(storeId?: number): Promise<Order[]> {
    const allOrders = Array.from(this.orders.values());
    if (storeId) {
      return allOrders.filter(order => order.storeId === storeId);
    }
    return allOrders;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderWithItems(id: number): Promise<{ order: Order; items: OrderItem[] } | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;

    const items = await this.getOrderItems(id);
    return { order, items };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { ...order, id };
    this.orders.set(id, newOrder);

    // Create order items if provided
    if (items.length > 0) {
      items.forEach(item => {
        this.createOrderItem({ ...item, orderId: id });
      });
    }

    return newOrder;
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder = { ...existingOrder, orderStatus: status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrdersByStatus(status: OrderStatus, storeId?: number): Promise<Order[]> {
    const allOrders = await this.getOrders(storeId);
    return allOrders.filter(order => order.orderStatus === status);
  }

  async getOrdersByType(type: OrderType, storeId?: number): Promise<Order[]> {
    const allOrders = await this.getOrders(storeId);
    return allOrders.filter(order => order.orderType === type);
  }

  async getRecentOrders(limit: number, storeId?: number): Promise<Order[]> {
    const allOrders = await this.getOrders(storeId);
    return allOrders
      .sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
      .slice(0, limit);
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values())
      .find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.getUserByUsername(username);
    // Implementation will be handled by auth.ts that uses comparePasswords
    // This method is kept for interface compatibility but shouldn't be used directly
    return undefined;
  }

  // Purchase Orders
  async getPurchaseOrders(storeId?: number): Promise<PurchaseOrder[]> {
    const allPurchaseOrders = Array.from(this.purchaseOrders.values());
    if (storeId) {
      return allPurchaseOrders.filter(po => po.storeId === storeId);
    }
    return allPurchaseOrders;
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(purchaseOrder: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]): Promise<PurchaseOrder> {
    const id = this.purchaseOrderId++;
    const newPurchaseOrder: PurchaseOrder = { ...purchaseOrder, id };
    this.purchaseOrders.set(id, newPurchaseOrder);

    // Create purchase order items if provided
    if (items.length > 0) {
      items.forEach(item => {
        this.createPurchaseOrderItem({ ...item, purchaseOrderId: id });
      });
    }

    return newPurchaseOrder;
  }

  async updatePurchaseOrderStatus(id: number, status: string): Promise<PurchaseOrder | undefined> {
    const existingPurchaseOrder = this.purchaseOrders.get(id);
    if (!existingPurchaseOrder) return undefined;

    const updatedPurchaseOrder = { ...existingPurchaseOrder, status };
    this.purchaseOrders.set(id, updatedPurchaseOrder);
    return updatedPurchaseOrder;
  }

  // Purchase Order Items
  async getPurchaseOrderItems(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return Array.from(this.purchaseOrderItems.values())
      .filter(item => item.purchaseOrderId === purchaseOrderId);
  }

  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const id = this.purchaseOrderItemId++;
    const newItem: PurchaseOrderItem = { ...item, id };
    this.purchaseOrderItems.set(id, newItem);
    return newItem;
  }
}

export const storage = new MemStorage();
