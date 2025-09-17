import { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  Home,
  AlertTriangle,
  Printer,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  Bell
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Badge } from "./components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Textarea } from "./components/ui/textarea";
import { Separator } from "./components/ui/separator";
import { Alert, AlertDescription } from "./components/ui/alert";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Sidebar Component
const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/finance', icon: DollarSign, label: 'Finance' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          ClothierPOS
        </h2>
        <p className="text-slate-400 text-sm">Clothing Store Management</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transform scale-105' 
                  : 'hover:bg-slate-700 hover:transform hover:scale-105'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <div className="flex items-center space-x-2 text-slate-600">
          <Calendar size={20} />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              LKR {dashboardData?.daily_sales?.total_sales?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-blue-600">
              {dashboardData?.daily_sales?.total_orders || 0} orders today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {dashboardData?.order_stats?.total || 0}
            </div>
            <p className="text-xs text-orange-600">
              {dashboardData?.order_stats?.pending || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Delivered</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {dashboardData?.order_stats?.delivered || 0}
            </div>
            <p className="text-xs text-green-600">
              {dashboardData?.order_stats?.on_courier || 0} on courier
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {dashboardData?.low_stock_count || 0}
            </div>
            <p className="text-xs text-red-600">items need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart size={20} />
              <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData?.recent_orders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-slate-600">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">LKR {order.total_amount.toFixed(2)}</p>
                  <Badge variant={
                    order.status === 'delivered' ? 'default' :
                    order.status === 'on_courier' ? 'secondary' :
                    order.status === 'pending' ? 'outline' : 'destructive'
                  }>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle size={20} />
              <span>Low Stock Items</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData?.low_stock_items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-slate-600">{item.size} - {item.color}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{item.current_stock} left</p>
                  <p className="text-xs text-slate-500">Min: {item.threshold}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Inventory Management Component
const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    low_stock_threshold: 5,
    variants: [{ size: 'M', color: '', sku: '', stock_quantity: 0, price: 0 }]
  });

  useEffect(() => {
    fetchProducts();
    fetchLowStock();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await axios.get(`${API}/products/low-stock`);
      setLowStockItems(response.data);
    } catch (error) {
      console.error("Failed to fetch low stock items");
    }
  };

  const handleAddProduct = async () => {
    try {
      await axios.post(`${API}/products`, newProduct);
      toast.success("Product added successfully");
      setShowAddDialog(false);
      setNewProduct({
        name: '',
        description: '',
        category: '',
        low_stock_threshold: 5,
        variants: [{ size: 'M', color: '', sku: '', stock_quantity: 0, price: 0 }]
      });
      fetchProducts();
      fetchLowStock();
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API}/products/${productId}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const addVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { size: 'M', color: '', sku: '', stock_quantity: 0, price: 0 }]
    });
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[index][field] = value;
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const removeVariant = (index) => {
    const updatedVariants = newProduct.variants.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  if (loading) return <div className="p-6">Loading inventory...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus size={20} className="mr-2" />
          Add Product
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{lowStockItems.length} items</strong> are running low on stock and need restocking.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span><strong>Category:</strong> {product.category}</span>
                  <span><strong>Low Stock Threshold:</strong> {product.low_stock_threshold}</span>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Variants:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {product.variants?.map((variant) => (
                      <div key={variant.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{variant.size}</Badge>
                            <span className="text-sm font-medium">{variant.color}</span>
                          </div>
                          <Badge variant={variant.stock_quantity <= product.low_stock_threshold ? "destructive" : "default"}>
                            {variant.stock_quantity} in stock
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <div><strong>SKU:</strong> {variant.sku}</div>
                          <div><strong>Price:</strong> LKR {variant.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product with multiple size and color variants.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  placeholder="e.g., T-Shirts, Jeans, Dresses"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Product description"
              />
            </div>

            <div>
              <Label htmlFor="threshold">Low Stock Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={newProduct.low_stock_threshold}
                onChange={(e) => setNewProduct({...newProduct, low_stock_threshold: parseInt(e.target.value)})}
                placeholder="5"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Product Variants</Label>
                <Button type="button" onClick={addVariant} variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {newProduct.variants.map((variant, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {newProduct.variants.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <Label>Size</Label>
                        <Select
                          value={variant.size}
                          onValueChange={(value) => updateVariant(index, 'size', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="XS">XS</SelectItem>
                            <SelectItem value="S">S</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="XL">XL</SelectItem>
                            <SelectItem value="XXL">XXL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Color</Label>
                        <Input
                          value={variant.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          placeholder="Red, Blue, etc."
                        />
                      </div>
                      
                      <div>
                        <Label>SKU</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          placeholder="SKU123"
                        />
                      </div>
                      
                      <div>
                        <Label>Stock Qty</Label>
                        <Input
                          type="number"
                          value={variant.stock_quantity}
                          onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <Label>Price (LKR)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Customer Management Component
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    try {
      await axios.post(`${API}/customers`, newCustomer);
      toast.success("Customer added successfully");
      setShowAddDialog(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: ''
      });
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to add customer");
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer(customer);
    setShowAddDialog(true);
  };

  const handleUpdateCustomer = async () => {
    try {
      await axios.put(`${API}/customers/${editingCustomer.id}`, newCustomer);
      toast.success("Customer updated successfully");
      setShowAddDialog(false);
      setEditingCustomer(null);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: ''
      });
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to update customer");
    }
  };

  if (loading) return <div className="p-6">Loading customers...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Customer Management</h1>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
          <Plus size={20} className="mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4">
        {customers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-slate-600">{customer.email}</p>
                    <p className="text-slate-600">{customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">
                      <strong>Address:</strong><br />
                      {customer.address}<br />
                      {customer.city}, {customer.postal_code}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    <p>Customer since: {new Date(customer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditCustomer(customer)}
                  >
                    <Edit size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Update customer information.' : 'Add a new customer to your database.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-name">Full Name</Label>
                <Input
                  id="customer-name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer-phone">Phone Number</Label>
              <Input
                id="customer-phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                placeholder="+94 71 234 5678"
              />
            </div>

            <div>
              <Label htmlFor="customer-address">Address</Label>
              <Textarea
                id="customer-address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-city">City</Label>
                <Input
                  id="customer-city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                  placeholder="Colombo"
                />
              </div>
              <div>
                <Label htmlFor="customer-postal">Postal Code</Label>
                <Input
                  id="customer-postal"
                  value={newCustomer.postal_code}
                  onChange={(e) => setNewCustomer({...newCustomer, postal_code: e.target.value})}
                  placeholder="00100"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingCustomer(null);
              setNewCustomer({
                name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postal_code: ''
              });
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
              className="bg-gradient-to-r from-green-600 to-teal-600"
            >
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Orders Management Component
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    items: [{ product_id: '', variant_id: '', quantity: 1 }],
    tax_rate: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers");
    }
  };

  const handleCreateOrder = async () => {
    try {
      const customer = customers.find(c => c.id === newOrder.customer_id);
      if (!customer) {
        toast.error("Please select a customer");
        return;
      }

      const orderItems = [];
      let subtotal = 0;

      for (const item of newOrder.items) {
        const product = products.find(p => p.id === item.product_id);
        const variant = product?.variants?.find(v => v.id === item.variant_id);
        
        if (!product || !variant) {
          toast.error("Invalid product or variant selected");
          return;
        }

        const totalPrice = variant.price * item.quantity;
        subtotal += totalPrice;

        orderItems.push({
          product_id: product.id,
          variant_id: variant.id,
          product_name: product.name,
          size: variant.size,
          color: variant.color,
          quantity: item.quantity,
          unit_price: variant.price,
          total_price: totalPrice
        });
      }

      const taxAmount = subtotal * (newOrder.tax_rate / 100);
      const totalAmount = subtotal + taxAmount;

      const orderData = {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_address: `${customer.address}, ${customer.city}, ${customer.postal_code}`,
        customer_phone: customer.phone,
        items: orderItems,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount
      };

      await axios.post(`${API}/orders`, orderData);
      toast.success("Order created successfully");
      setShowAddDialog(false);
      setNewOrder({
        customer_id: '',
        items: [{ product_id: '', variant_id: '', quantity: 1 }],
        tax_rate: 0
      });
      fetchOrders();
    } catch (error) {
      toast.error("Failed to create order");
    }
  };

  const updateOrderStatus = async (orderId, status, trackingNumber = '') => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, null, {
        params: { status, tracking_number: trackingNumber || undefined }
      });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleBulkPrintLabels = () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders to print labels");
      return;
    }

    const url = `${API}/orders/bulk-labels`;
    const newWindow = window.open();
    
    axios.post(url, selectedOrders)
      .then(response => {
        newWindow.document.write(response.data);
        newWindow.document.close();
        setTimeout(() => {
          newWindow.print();
        }, 500);
      })
      .catch(error => {
        toast.error("Failed to generate labels");
        newWindow.close();
      });
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product_id: '', variant_id: '', quantity: 1 }]
    });
  };

  const updateOrderItem = (index, field, value) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index][field] = value;
    
    // Reset variant_id when product changes
    if (field === 'product_id') {
      updatedItems[index].variant_id = '';
    }
    
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const removeOrderItem = (index) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on_courier': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-6">Loading orders...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Order Management</h1>
        <div className="flex space-x-3">
          {selectedOrders.length > 0 && (
            <Button onClick={handleBulkPrintLabels} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
              <Printer size={20} className="mr-2" />
              Print Labels ({selectedOrders.length})
            </Button>
          )}
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
            <Plus size={20} className="mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrders([...selectedOrders, order.id]);
                      } else {
                        setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{order.order_number}</h3>
                    <p className="text-slate-600">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="font-semibold text-lg">LKR {order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm text-slate-600">
                        {item.product_name} ({item.size}, {item.color}) x{item.quantity}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Details:</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div><strong>Phone:</strong> {order.customer_phone}</div>
                    <div><strong>Address:</strong> {order.customer_address}</div>
                    {order.tracking_number && (
                      <div><strong>Tracking:</strong> {order.tracking_number}</div>
                    )}
                    <div><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-slate-500">
                  Subtotal: LKR {order.subtotal.toFixed(2)} + Tax: LKR {order.tax_amount.toFixed(2)}
                </div>
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const trackingNumber = prompt("Enter tracking number:");
                        if (trackingNumber) {
                          updateOrderStatus(order.id, 'on_courier', trackingNumber);
                        }
                      }}
                    >
                      Ship Order
                    </Button>
                  )}
                  {order.status === 'on_courier' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                    >
                      Mark Delivered
                    </Button>
                  )}
                  {(order.status === 'delivered' || order.status === 'on_courier') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600"
                      onClick={() => updateOrderStatus(order.id, 'returned')}
                    >
                      Mark Returned
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`${API}/orders/${order.id}/shipping-label`, '_blank')}
                  >
                    <Printer size={16} className="mr-1" />
                    Label
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Order Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Create a new order for a customer with multiple items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="customer-select">Select Customer</Label>
              <Select value={newOrder.customer_id} onValueChange={(value) => setNewOrder({...newOrder, customer_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Order Items</Label>
                <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {newOrder.items.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {newOrder.items.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeOrderItem(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Product</Label>
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => updateOrderItem(index, 'product_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Variant</Label>
                        <Select
                          value={item.variant_id}
                          onValueChange={(value) => updateOrderItem(index, 'variant_id', value)}
                          disabled={!item.product_id}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select variant" />
                          </SelectTrigger>
                          <SelectContent>
                            {products
                              .find(p => p.id === item.product_id)
                              ?.variants?.map((variant) => (
                                <SelectItem key={variant.id} value={variant.id}>
                                  {variant.size} - {variant.color} (LKR {variant.price.toFixed(2)})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                value={newOrder.tax_rate}
                onChange={(e) => setNewOrder({...newOrder, tax_rate: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} className="bg-gradient-to-r from-emerald-600 to-cyan-600">
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Finance = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Finance & Reports</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-slate-600">Finance and reporting functionality coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

const SettingsPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Settings</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-slate-600">Settings functionality coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

// Main App Component
function App() {
  return (
    <div className="App min-h-screen bg-slate-50">
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;