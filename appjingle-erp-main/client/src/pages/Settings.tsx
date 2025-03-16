import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Settings2, CreditCard, Users, ShieldCheck, Database, Key, Globe } from "lucide-react";

// Define form schemas
const userProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.string(),
});

const securitySettingsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const taxRatesSchema = z.object({
  defaultTaxRate: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Tax rate must be a positive number",
  }),
});

type UserProfileValues = z.infer<typeof userProfileSchema>;
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;
type TaxRatesValues = z.infer<typeof taxRatesSchema>;

export default function Settings() {
  const { toast } = useToast();
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableInventoryAlerts, setEnableInventoryAlerts] = useState(true);
  const [enableOrderNotifications, setEnableOrderNotifications] = useState(true);
  
  // User profile form
  const userProfileForm = useForm<UserProfileValues>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "Sarah Johnson",
      email: "sarah@groceryerp.com",
      phone: "555-1111",
      role: "admin",
    },
  });

  // Security settings form
  const securityForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Tax rates form
  const taxRatesForm = useForm<TaxRatesValues>({
    resolver: zodResolver(taxRatesSchema),
    defaultValues: {
      defaultTaxRate: "8.25",
    },
  });

  const handleSaveUserProfile = (data: UserProfileValues) => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  const handleChangePassword = (data: SecuritySettingsValues) => {
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });
    securityForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleTaxRatesUpdate = (data: TaxRatesValues) => {
    toast({
      title: "Tax rates updated",
      description: "Tax rate settings have been saved.",
    });
  };

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold font-poppins text-gray-800">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account and application preferences</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="account" className="flex items-center justify-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center justify-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden md:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center justify-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">System</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Manage your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...userProfileForm}>
                <form onSubmit={userProfileForm.handleSubmit(handleSaveUserProfile)} className="space-y-6">
                  <FormField
                    control={userProfileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userProfileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userProfileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userProfileForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="manager">Store Manager</SelectItem>
                            <SelectItem value="employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your role determines your permissions in the system
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="bg-primary hover:bg-primary-dark">
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Update your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(handleChangePassword)} className="space-y-6">
                  <FormField
                    control={securityForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 8 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={securityForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="bg-primary hover:bg-primary-dark">
                    Change Password
                  </Button>
                </form>
              </Form>
              
              <Separator className="my-8" />
              
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Setup 2FA</Button>
                </div>
                
                <h3 className="text-lg font-medium pt-4">Login Sessions</h3>
                <div className="rounded-md border p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500">Started 2 hours ago • Chrome on Windows</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="business">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>
                  Configure tax rates for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...taxRatesForm}>
                  <form onSubmit={taxRatesForm.handleSubmit(handleTaxRatesUpdate)} className="space-y-4">
                    <FormField
                      control={taxRatesForm.control}
                      name="defaultTaxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormDescription>
                            Applied to all sales unless overridden by location-specific rates
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="bg-primary hover:bg-primary-dark">
                      Save Tax Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Configure payment options for your stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Credit Card</p>
                        <p className="text-sm text-gray-500">Accept Visa, Mastercard, Amex</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium">Cash</p>
                        <p className="text-sm text-gray-500">Accept cash payments</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Online Payment</p>
                        <p className="text-sm text-gray-500">PayPal, Stripe integration</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Configure Payment Gateways</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Customize how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-gray-500">Master toggle for all system notifications</p>
                </div>
                <Switch 
                  checked={enableNotifications} 
                  onCheckedChange={setEnableNotifications} 
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Inventory Notifications</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-gray-500">Get notified when products reach low stock levels</p>
                  </div>
                  <Switch 
                    checked={enableInventoryAlerts} 
                    onCheckedChange={setEnableInventoryAlerts}
                    disabled={!enableNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-gray-500">Receive notifications for new orders and status changes</p>
                  </div>
                  <Switch 
                    checked={enableOrderNotifications} 
                    onCheckedChange={setEnableOrderNotifications}
                    disabled={!enableNotifications}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Preferences</h3>
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <p className="font-medium">Daily Summary</p>
                    <p className="text-sm text-gray-500">Receive a daily summary of store performance</p>
                  </div>
                  <Switch disabled={!enableNotifications} />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div>
                    <p className="font-medium">Weekly Reports</p>
                    <p className="text-sm text-gray-500">Get weekly sales and inventory reports</p>
                  </div>
                  <Switch defaultChecked disabled={!enableNotifications} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-primary hover:bg-primary-dark">
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>
                
                <div className="space-y-1">
                  <p className="font-medium">Database Backup</p>
                  <p className="text-sm text-gray-500">Last backup: Never</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Database className="h-4 w-4 mr-2" />
                      Back Up Now
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule Backups
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">API Integration</h3>
                
                <div className="space-y-1">
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-gray-500">Manage API keys for third-party integrations</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Key className="h-4 w-4 mr-2" />
                      Manage API Keys
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Information</h3>
                
                <div className="rounded-md border p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Version</span>
                    <span className="text-sm">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Environment</span>
                    <span className="text-sm">Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Last Updated</span>
                    <span className="text-sm">May 15, 2023</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Bell(props: React.ComponentProps<typeof LucideIcon>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

type LucideIcon = typeof User;
