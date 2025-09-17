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
  Bell,
  Download
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

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
  }, [sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      let sortedProducts = [...response.data];
      
      // Sort products based on selected option
      switch (sortBy) {
        case 'newest':
          sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'oldest':
          sortedProducts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'name_asc':
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'category':
          sortedProducts.sort((a, b) => a.category.localeCompare(b.category));
          break;
        case 'stock_low':
          sortedProducts.sort((a, b) => {
            const aMinStock = Math.min(...a.variants.map(v => v.stock_quantity));
            const bMinStock = Math.min(...b.variants.map(v => v.stock_quantity));
            return aMinStock - bMinStock;
          });
          break;
        case 'stock_high':
          sortedProducts.sort((a, b) => {
            const aMaxStock = Math.max(...a.variants.map(v => v.stock_quantity));
            const bMaxStock = Math.max(...b.variants.map(v => v.stock_quantity));
            return bMaxStock - aMaxStock;
          });
          break;
        default:
          break;
      }
      
      setProducts(sortedProducts);
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
      resetNewProduct();
      fetchProducts();
      fetchLowStock();
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      category: product.category,
      low_stock_threshold: product.low_stock_threshold,
      variants: product.variants.map(variant => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        stock_quantity: variant.stock_quantity,
        price: variant.price
      }))
    });
    setShowEditDialog(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const updatedProduct = {
        ...editingProduct,
        name: newProduct.name,
        description: newProduct.description,
        category: newProduct.category,
        low_stock_threshold: newProduct.low_stock_threshold,
        variants: newProduct.variants
      };
      
      await axios.put(`${API}/products/${editingProduct.id}`, updatedProduct);
      toast.success("Product updated successfully");
      setShowEditDialog(false);
      setEditingProduct(null);
      resetNewProduct();
      fetchProducts();
      fetchLowStock();
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        await axios.delete(`${API}/products/${productId}`);
        toast.success("Product deleted successfully");
        fetchProducts();
        fetchLowStock();
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const resetNewProduct = () => {
    setNewProduct({
      name: '',
      description: '',
      category: '',
      low_stock_threshold: 5,
      variants: [{ size: 'M', color: '', sku: '', stock_quantity: 0, price: 0 }]
    });
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

  // Pagination helpers
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

      {/* Sorting and Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <Label htmlFor="sort-select">Sort by:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="stock_low">Stock (Low to High)</SelectItem>
              <SelectItem value="stock_high">Stock (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600">
            Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} of {products.length} products
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {currentProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                    className="text-blue-600"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <span><strong>Category:</strong> {product.category}</span>
                  <span><strong>Low Stock Threshold:</strong> {product.low_stock_threshold}</span>
                  <span><strong>Created:</strong> {new Date(product.created_at).toLocaleDateString()}</span>
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingProduct(null);
          resetNewProduct();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information and variants.' : 'Create a new product with multiple size and color variants.'}
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
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setShowEditDialog(false);
              setEditingProduct(null);
              resetNewProduct();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingProduct ? handleUpdateProduct : handleAddProduct} 
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(20);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    phone_2: '',
    address: '',
    city: '',
    postal_code: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, [sortBy]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      let sortedCustomers = [...response.data];
      
      // Sort customers based on selected option
      switch (sortBy) {
        case 'newest':
          sortedCustomers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'oldest':
          sortedCustomers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'name_asc':
          sortedCustomers.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          sortedCustomers.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'city':
          sortedCustomers.sort((a, b) => a.city.localeCompare(b.city));
          break;
        case 'email':
          sortedCustomers.sort((a, b) => a.email.localeCompare(b.email));
          break;
        default:
          break;
      }
      
      setCustomers(sortedCustomers);
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
      resetNewCustomer();
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to add customer");
    }
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postal_code: customer.postal_code
    });
    setShowEditDialog(true);
  };

  const handleUpdateCustomer = async () => {
    try {
      await axios.put(`${API}/customers/${editingCustomer.id}`, newCustomer);
      toast.success("Customer updated successfully");
      setShowEditDialog(false);
      setEditingCustomer(null);
      resetNewCustomer();
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to update customer");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      try {
        await axios.delete(`${API}/customers/${customerId}`);
        toast.success("Customer deleted successfully");
        fetchCustomers();
      } catch (error) {
        toast.error("Failed to delete customer");
      }
    }
  };

  const resetNewCustomer = () => {
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postal_code: ''
    });
  };

  // Pagination helpers
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(customers.length / customersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

      {/* Sorting and Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <Label htmlFor="sort-select">Sort by:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600">
            Showing {indexOfFirstCustomer + 1}-{Math.min(indexOfLastCustomer, customers.length)} of {customers.length} customers
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {currentCustomers.map((customer) => (
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
                    <p><strong>Customer since:</strong> {new Date(customer.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditCustomer(customer)}
                    className="text-blue-600"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingCustomer(null);
          resetNewCustomer();
        }
      }}>
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
              setShowEditDialog(false);
              setEditingCustomer(null);
              resetNewCustomer();
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkCreateDialog, setShowBulkCreateDialog] = useState(false);
  const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(20);

  const [newOrder, setNewOrder] = useState({
    customer_id: '',
    items: [{ product_id: '', variant_id: '', quantity: 1 }],
    tax_rate: 0,
    tracking_number: '',
    courier_charges: 350,
    discount_amount: 0,
    discount_percentage: 0,
    discount_type: 'amount', // 'amount' or 'percentage'
    customer_phone_2: '',
    cod_amount: 0,
    remarks: ''
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });

  const [bulkOrders, setBulkOrders] = useState([
    {
      customer_id: '',
      items: [{ product_id: '', variant_id: '', quantity: 1 }],
      tax_rate: 0,
      tracking_number: ''
    }
  ]);

  const [bulkStatusData, setBulkStatusData] = useState({
    status: 'on_courier',
    tracking_number: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, [sortBy]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      let sortedOrders = [...response.data];
      
      // Sort orders based on selected option
      switch (sortBy) {
        case 'newest':
          sortedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'oldest':
          sortedOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'amount_high':
          sortedOrders.sort((a, b) => b.total_amount - a.total_amount);
          break;
        case 'amount_low':
          sortedOrders.sort((a, b) => a.total_amount - b.total_amount);
          break;
        case 'status':
          sortedOrders.sort((a, b) => a.status.localeCompare(b.status));
          break;
        default:
          break;
      }
      
      setOrders(sortedOrders);
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
      
      // Calculate discount
      let discountAmount = 0;
      if (newOrder.discount_type === 'percentage') {
        discountAmount = (subtotal + taxAmount) * (newOrder.discount_percentage / 100);
      } else {
        discountAmount = newOrder.discount_amount || 0;
      }

      const totalAmount = subtotal + taxAmount + newOrder.courier_charges - discountAmount;

      const orderData = {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_address: `${customer.address}, ${customer.city}, ${customer.postal_code}`,
        customer_phone: customer.phone,
        customer_phone_2: newOrder.customer_phone_2 || null,
        customer_city: customer.city,
        items: orderItems,
        subtotal,
        tax_amount: taxAmount,
        courier_charges: newOrder.courier_charges,
        discount_amount: discountAmount,
        discount_percentage: newOrder.discount_type === 'percentage' ? newOrder.discount_percentage : 0,
        total_amount: totalAmount,
        tracking_number: newOrder.tracking_number || null,
        cod_amount: newOrder.cod_amount || totalAmount,
        remarks: newOrder.remarks || null
      };

      await axios.post(`${API}/orders`, orderData);
      toast.success("Order created successfully");
      setShowAddDialog(false);
      resetNewOrder();
      fetchOrders();
    } catch (error) {
      toast.error("Failed to create order");
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setNewOrder({
      customer_id: order.customer_id,
      items: order.items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity
      })),
      tax_rate: (order.tax_amount / order.subtotal * 100) || 0,
      tracking_number: order.tracking_number || '',
      courier_charges: order.courier_charges || 350,
      discount_amount: order.discount_amount || 0,
      discount_percentage: order.discount_percentage || 0,
      discount_type: order.discount_percentage > 0 ? 'percentage' : 'amount',
      customer_phone_2: order.customer_phone_2 || '',
      cod_amount: order.cod_amount || order.total_amount,
      remarks: order.remarks || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateOrder = async () => {
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
      
      // Calculate discount
      let discountAmount = 0;
      if (newOrder.discount_type === 'percentage') {
        discountAmount = (subtotal + taxAmount) * (newOrder.discount_percentage / 100);
      } else {
        discountAmount = newOrder.discount_amount || 0;
      }

      const totalAmount = subtotal + taxAmount + newOrder.courier_charges - discountAmount;

      const orderData = {
        ...editingOrder,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_address: `${customer.address}, ${customer.city}, ${customer.postal_code}`,
        customer_phone: customer.phone,
        customer_phone_2: newOrder.customer_phone_2 || null,
        customer_city: customer.city,
        items: orderItems,
        subtotal,
        tax_amount: taxAmount,
        courier_charges: newOrder.courier_charges,
        discount_amount: discountAmount,
        discount_percentage: newOrder.discount_type === 'percentage' ? newOrder.discount_percentage : 0,
        total_amount: totalAmount,
        tracking_number: newOrder.tracking_number || null,
        cod_amount: newOrder.cod_amount || totalAmount,
        remarks: newOrder.remarks || null
      };

      await axios.put(`${API}/orders/${editingOrder.id}`, orderData);
      toast.success("Order updated successfully");
      setShowEditDialog(false);
      setEditingOrder(null);
      resetNewOrder();
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? Stock quantities will be restored.")) {
      try {
        await axios.delete(`${API}/orders/${orderId}`);
        toast.success("Order deleted successfully");
        fetchOrders();
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const response = await axios.post(`${API}/customers`, newCustomer);
      toast.success("Customer created successfully");
      setCustomers([...customers, response.data]);
      setNewOrder({ ...newOrder, customer_id: response.data.id });
      setShowCustomerDialog(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: ''
      });
    } catch (error) {
      toast.error("Failed to create customer");
    }
  };

  const handleExportCSV = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders to export");
      return;
    }

    try {
      const response = await axios.post(`${API}/orders/export-csv`, selectedOrders, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Orders exported successfully");
    } catch (error) {
      toast.error("Failed to export orders");
    }
  };

  const resetNewOrder = () => {
    setNewOrder({
      customer_id: '',
      items: [{ product_id: '', variant_id: '', quantity: 1 }],
      tax_rate: 0,
      tracking_number: '',
      courier_charges: 350,
      discount_amount: 0,
      discount_percentage: 0,
      discount_type: 'amount',
      customer_phone_2: '',
      cod_amount: 0,
      remarks: ''
    });
  };

  const handleBulkCreateOrders = async () => {
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const orderData of bulkOrders) {
        try {
          const customer = customers.find(c => c.id === orderData.customer_id);
          if (!customer) {
            errorCount++;
            continue;
          }

          const orderItems = [];
          let subtotal = 0;

          for (const item of orderData.items) {
            const product = products.find(p => p.id === item.product_id);
            const variant = product?.variants?.find(v => v.id === item.variant_id);
            
            if (!product || !variant) {
              errorCount++;
              continue;
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

          if (orderItems.length === 0) {
            errorCount++;
            continue;
          }

          const taxAmount = subtotal * (orderData.tax_rate / 100);
          const totalAmount = subtotal + taxAmount;

          const finalOrderData = {
            customer_id: customer.id,
            customer_name: customer.name,
            customer_address: `${customer.address}, ${customer.city}, ${customer.postal_code}`,
            customer_phone: customer.phone,
            items: orderItems,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            tracking_number: orderData.tracking_number || null
          };

          await axios.post(`${API}/orders`, finalOrderData);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} orders created successfully`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} orders failed to create`);
      }

      setShowBulkCreateDialog(false);
      setBulkOrders([
        {
          customer_id: '',
          items: [{ product_id: '', variant_id: '', quantity: 1 }],
          tax_rate: 0,
          tracking_number: ''
        }
      ]);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to create bulk orders");
    }
  };

  const handleBulkStatusChange = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Please select orders to update");
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const orderId of selectedOrders) {
        try {
          await axios.put(`${API}/orders/${orderId}/status`, null, {
            params: {
              status: bulkStatusData.status,
              tracking_number: bulkStatusData.tracking_number || undefined
            }
          });
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} orders updated successfully`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} orders failed to update`);
      }

      setShowBulkStatusDialog(false);
      setSelectedOrders([]);
      setBulkStatusData({ status: 'on_courier', tracking_number: '' });
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update orders");
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
    
    axios.post(url, selectedOrders, {
      headers: {
        'Content-Type': 'application/json'
      },
      responseType: 'text'  // Important: specify text response type for HTML
    })
      .then(response => {
        newWindow.document.write(response.data);
        newWindow.document.close();
        setTimeout(() => {
          newWindow.print();
        }, 500);
        toast.success("Labels generated successfully");
      })
      .catch(error => {
        console.error("Label generation error:", error);
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

  // Bulk order creation helpers
  const addBulkOrder = () => {
    setBulkOrders([
      ...bulkOrders,
      {
        customer_id: '',
        items: [{ product_id: '', variant_id: '', quantity: 1 }],
        tax_rate: 0,
        tracking_number: ''
      }
    ]);
  };

  const updateBulkOrder = (orderIndex, field, value) => {
    const updatedOrders = [...bulkOrders];
    updatedOrders[orderIndex][field] = value;
    setBulkOrders(updatedOrders);
  };

  const updateBulkOrderItem = (orderIndex, itemIndex, field, value) => {
    const updatedOrders = [...bulkOrders];
    updatedOrders[orderIndex].items[itemIndex][field] = value;
    
    // Reset variant_id when product changes
    if (field === 'product_id') {
      updatedOrders[orderIndex].items[itemIndex].variant_id = '';
    }
    
    setBulkOrders(updatedOrders);
  };

  const addBulkOrderItem = (orderIndex) => {
    const updatedOrders = [...bulkOrders];
    updatedOrders[orderIndex].items.push({ product_id: '', variant_id: '', quantity: 1 });
    setBulkOrders(updatedOrders);
  };

  const removeBulkOrderItem = (orderIndex, itemIndex) => {
    const updatedOrders = [...bulkOrders];
    updatedOrders[orderIndex].items = updatedOrders[orderIndex].items.filter((_, i) => i !== itemIndex);
    setBulkOrders(updatedOrders);
  };

  const removeBulkOrder = (orderIndex) => {
    const updatedOrders = bulkOrders.filter((_, i) => i !== orderIndex);
    setBulkOrders(updatedOrders);
  };

  // Pagination helpers
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            <>
              <Button 
                onClick={handleExportCSV} 
                variant="outline" 
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Download size={20} className="mr-2" />
                Export CSV ({selectedOrders.length})
              </Button>
              <Button 
                onClick={() => setShowBulkStatusDialog(true)} 
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Edit size={20} className="mr-2" />
                Update Status ({selectedOrders.length})
              </Button>
              <Button onClick={handleBulkPrintLabels} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                <Printer size={20} className="mr-2" />
                Print Labels ({selectedOrders.length})
              </Button>
            </>
          )}
          <Button 
            onClick={() => setShowBulkCreateDialog(true)} 
            variant="outline" 
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Plus size={20} className="mr-2" />
            Bulk Create
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
            <Plus size={20} className="mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Sorting and Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <Label htmlFor="sort-select">Sort by:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount_high">Amount (High to Low)</SelectItem>
              <SelectItem value="amount_low">Amount (Low to High)</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600">
            Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {currentOrders.map((order) => (
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
                  {order.remarks && (
                    <div className="mt-2">
                      <h4 className="font-medium text-sm">Remarks:</h4>
                      <p className="text-sm text-slate-600">{order.remarks}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Details:</h4>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div><strong>Phone:</strong> {order.customer_phone}</div>
                    {order.customer_phone_2 && (
                      <div><strong>Phone 2:</strong> {order.customer_phone_2}</div>
                    )}
                    <div><strong>Address:</strong> {order.customer_address}</div>
                    {order.tracking_number && (
                      <div><strong>Tracking:</strong> {order.tracking_number}</div>
                    )}
                    <div><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</div>
                    {order.cod_amount && (
                      <div><strong>COD Amount:</strong> LKR {order.cod_amount.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-slate-500 space-y-1">
                  <div>Subtotal: LKR {order.subtotal.toFixed(2)} + Tax: LKR {order.tax_amount.toFixed(2)}</div>
                  <div>Courier: LKR {(order.courier_charges || 0).toFixed(2)} - Discount: LKR {(order.discount_amount || 0).toFixed(2)}</div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditOrder(order)}
                    className="text-blue-600"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteOrder(order.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
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

      {/* Create/Edit Order Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
          setEditingOrder(null);
          resetNewOrder();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Edit Order' : 'Create New Order'}</DialogTitle>
            <DialogDescription>
              {editingOrder ? 'Update order details and items.' : 'Create a new order for a customer with multiple items.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-select">Select Customer</Label>
                <div className="flex space-x-2">
                  <Select value={newOrder.customer_id} onValueChange={(value) => setNewOrder({...newOrder, customer_id: value})}>
                    <SelectTrigger className="flex-1">
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
                  <Button 
                    type="button" 
                    onClick={() => setShowCustomerDialog(true)} 
                    variant="outline" 
                    size="sm"
                    className="px-3"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="customer-phone-2">Secondary Phone (Optional)</Label>
                <Input
                  id="customer-phone-2"
                  value={newOrder.customer_phone_2}
                  onChange={(e) => setNewOrder({...newOrder, customer_phone_2: e.target.value})}
                  placeholder="+94 77 123 4567"
                />
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div>
                <Label htmlFor="courier-charges">Courier Charges (LKR)</Label>
                <Input
                  id="courier-charges"
                  type="number"
                  step="0.01"
                  value={newOrder.courier_charges}
                  onChange={(e) => setNewOrder({...newOrder, courier_charges: parseFloat(e.target.value) || 0})}
                  placeholder="350"
                />
              </div>

              <div>
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select value={newOrder.discount_type} onValueChange={(value) => setNewOrder({...newOrder, discount_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount (LKR)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount-value">
                  Discount {newOrder.discount_type === 'percentage' ? '(%)' : '(LKR)'}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  step="0.01"
                  value={newOrder.discount_type === 'percentage' ? newOrder.discount_percentage : newOrder.discount_amount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (newOrder.discount_type === 'percentage') {
                      setNewOrder({...newOrder, discount_percentage: value, discount_amount: 0});
                    } else {
                      setNewOrder({...newOrder, discount_amount: value, discount_percentage: 0});
                    }
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tracking-number">Waybill/Tracking Number (Optional)</Label>
                <Input
                  id="tracking-number"
                  value={newOrder.tracking_number}
                  onChange={(e) => setNewOrder({...newOrder, tracking_number: e.target.value})}
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <Label htmlFor="cod-amount">COD Amount (LKR)</Label>
                <Input
                  id="cod-amount"
                  type="number"
                  step="0.01"
                  value={newOrder.cod_amount}
                  onChange={(e) => setNewOrder({...newOrder, cod_amount: parseFloat(e.target.value) || 0})}
                  placeholder="Will default to total amount"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={newOrder.remarks}
                onChange={(e) => setNewOrder({...newOrder, remarks: e.target.value})}
                placeholder="Any additional notes or remarks"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setShowEditDialog(false);
              setEditingOrder(null);
              resetNewOrder();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingOrder ? handleUpdateOrder : handleCreateOrder} 
              className="bg-gradient-to-r from-emerald-600 to-cyan-600"
            >
              {editingOrder ? 'Update Order' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Creation Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer and add them to this order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-customer-name">Full Name</Label>
                <Input
                  id="new-customer-name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="new-customer-email">Email</Label>
                <Input
                  id="new-customer-email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-customer-phone">Phone Number</Label>
              <Input
                id="new-customer-phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                placeholder="+94 71 234 5678"
              />
            </div>

            <div>
              <Label htmlFor="new-customer-address">Address</Label>
              <Textarea
                id="new-customer-address"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-customer-city">City</Label>
                <Input
                  id="new-customer-city"
                  value={newCustomer.city}
                  onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})}
                  placeholder="Colombo"
                />
              </div>
              <div>
                <Label htmlFor="new-customer-postal">Postal Code</Label>
                <Input
                  id="new-customer-postal"
                  value={newCustomer.postal_code}
                  onChange={(e) => setNewCustomer({...newCustomer, postal_code: e.target.value})}
                  placeholder="00100"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomer} className="bg-gradient-to-r from-green-600 to-teal-600">
              Create & Select Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Orders Dialog */}
      <Dialog open={showBulkCreateDialog} onOpenChange={setShowBulkCreateDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Create Orders</DialogTitle>
            <DialogDescription>
              Create multiple orders at once. Each order can have multiple items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Orders to Create ({bulkOrders.length})</h4>
              <Button onClick={addBulkOrder} variant="outline" size="sm">
                <Plus size={16} className="mr-2" />
                Add Another Order
              </Button>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {bulkOrders.map((order, orderIndex) => (
                <div key={orderIndex} className="p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-medium text-lg">Order {orderIndex + 1}</h5>
                    {bulkOrders.length > 1 && (
                      <Button
                        onClick={() => removeBulkOrder(orderIndex)}
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label>Customer</Label>
                      <Select 
                        value={order.customer_id} 
                        onValueChange={(value) => updateBulkOrder(orderIndex, 'customer_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose customer" />
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
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={order.tax_rate}
                        onChange={(e) => updateBulkOrder(orderIndex, 'tax_rate', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label>Waybill/Tracking Number</Label>
                      <Input
                        value={order.tracking_number}
                        onChange={(e) => updateBulkOrder(orderIndex, 'tracking_number', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Items for Order {orderIndex + 1}</Label>
                      <Button 
                        onClick={() => addBulkOrderItem(orderIndex)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Item {itemIndex + 1}</span>
                            {order.items.length > 1 && (
                              <Button
                                onClick={() => removeBulkOrderItem(orderIndex, itemIndex)}
                                variant="outline"
                                size="sm"
                                className="text-red-600"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div>
                              <Select
                                value={item.product_id}
                                onValueChange={(value) => updateBulkOrderItem(orderIndex, itemIndex, 'product_id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Product" />
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
                              <Select
                                value={item.variant_id}
                                onValueChange={(value) => updateBulkOrderItem(orderIndex, itemIndex, 'variant_id', value)}
                                disabled={!item.product_id}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Variant" />
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
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateBulkOrderItem(orderIndex, itemIndex, 'quantity', parseInt(e.target.value) || 1)}
                                placeholder="Qty"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCreateOrders} className="bg-gradient-to-r from-purple-600 to-indigo-600">
              Create {bulkOrders.length} Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Change Dialog */}
      <Dialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedOrders.length} selected orders.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-status">New Status</Label>
              <Select 
                value={bulkStatusData.status} 
                onValueChange={(value) => setBulkStatusData({...bulkStatusData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="on_courier">On Courier</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(bulkStatusData.status === 'on_courier' || bulkStatusData.status === 'delivered') && (
              <div>
                <Label htmlFor="bulk-tracking">Waybill/Tracking Number</Label>
                <Input
                  id="bulk-tracking"
                  value={bulkStatusData.tracking_number}
                  onChange={(e) => setBulkStatusData({...bulkStatusData, tracking_number: e.target.value})}
                  placeholder="Enter tracking number"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkStatusChange} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Update {selectedOrders.length} Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Finance & Reports Component
const Finance = () => {
  const [dailySales, setDailySales] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDailySales();
    fetchProfitLoss();
  }, [selectedDate, startDate, endDate]);

  const fetchDailySales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/finance/daily-sales`, {
        params: { date: selectedDate }
      });
      setDailySales(response.data);
    } catch (error) {
      toast.error("Failed to fetch daily sales");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitLoss = async () => {
    try {
      const response = await axios.get(`${API}/finance/profit-loss`, {
        params: { start_date: startDate, end_date: endDate }
      });
      setProfitLoss(response.data);
    } catch (error) {
      toast.error("Failed to fetch profit/loss data");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Finance & Reports</h1>

      {/* Daily Sales Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp size={20} />
            <span>Daily Sales Report</span>
          </CardTitle>
          <CardDescription>View sales performance for a specific date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="date-picker">Select Date:</Label>
              <Input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>

            {dailySales && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800">Total Sales</h3>
                  <p className="text-2xl font-bold text-blue-900">LKR {dailySales.total_sales.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Total Orders</h3>
                  <p className="text-2xl font-bold text-green-900">{dailySales.total_orders}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Average Order Value</h3>
                  <p className="text-2xl font-bold text-purple-900">
                    LKR {dailySales.total_orders > 0 ? (dailySales.total_sales / dailySales.total_orders).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            )}

            {dailySales?.orders && dailySales.orders.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Orders for {selectedDate}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dailySales.orders.map((order) => (
                    <div key={order.id} className="p-3 bg-slate-50 rounded flex items-center justify-between">
                      <div>
                        <span className="font-medium">{order.order_number}</span>
                        <span className="text-slate-600 ml-2">- {order.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'on_courier' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }>
                          {order.status.replace('_', ' ')}
                        </Badge>
                        <span className="font-semibold">LKR {order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profit & Loss Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign size={20} />
            <span>Profit & Loss Report</span>
          </CardTitle>
          <CardDescription>Analyze profitability over a date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div>
                <Label htmlFor="start-date">Start Date:</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date:</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                />
              </div>
            </div>

            {profitLoss && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <h3 className="font-semibold text-emerald-800">Total Revenue</h3>
                    <p className="text-2xl font-bold text-emerald-900">LKR {profitLoss.total_revenue.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h3 className="font-semibold text-red-800">Total Cost</h3>
                    <p className="text-2xl font-bold text-red-900">LKR {profitLoss.total_cost.toFixed(2)}</p>
                    <p className="text-xs text-red-600">Estimated at 60% of revenue</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">Net Profit</h3>
                    <p className={`text-2xl font-bold ${profitLoss.profit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                      LKR {profitLoss.profit.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800">Profit Margin</h3>
                    <p className={`text-2xl font-bold ${profitLoss.profit_margin >= 0 ? 'text-purple-900' : 'text-red-900'}`}>
                      {profitLoss.profit_margin.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Period Summary</h4>
                  <p className="text-slate-600">
                    Analysis from {new Date(profitLoss.start_date).toLocaleDateString()} to {new Date(profitLoss.end_date).toLocaleDateString()}
                  </p>
                  <div className="mt-2 text-sm text-slate-500">
                    <p>• Cost calculation is estimated at 60% of selling price</p>
                    <p>• Profit margin = (Revenue - Cost) / Revenue × 100</p>
                    <p>• Only delivered orders are included in calculations</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tax Report */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Report</CardTitle>
          <CardDescription>Tax summary for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Tax Information</h4>
            <p className="text-yellow-700">
              Tax calculations are included in individual orders. 
              Total tax collected in selected period: LKR {profitLoss ? (profitLoss.total_revenue * 0.1).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              * Estimated tax at 10% rate for demonstration purposes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Component
const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const previewLabel = () => {
    if (!settings) return;
    
    // Create a sample order for preview
    const sampleOrder = {
      order_number: "ORD-000001",
      tracking_number: "TRK123456789",
      created_at: new Date().toISOString(),
      customer_name: "John Doe",
      customer_address: "123 Sample Street, Colombo 01, 00100",
      customer_phone: "+94 71 234 5678",
      total_amount: 2500.00,
      items: [
        { product_name: "Cotton T-Shirt", size: "M", color: "Blue", quantity: 2 },
        { product_name: "Denim Jeans", size: "L", color: "Black", quantity: 1 }
      ]
    };

    let html = settings.shipping_label_template;
    html = html.replace(/{{business_name}}/g, settings.business_name);
    html = html.replace(/{{business_address}}/g, settings.address);
    html = html.replace(/{{business_phone}}/g, settings.phone);
    html = html.replace(/{{customer_name}}/g, sampleOrder.customer_name);
    html = html.replace(/{{customer_address}}/g, sampleOrder.customer_address);
    html = html.replace(/{{customer_phone}}/g, sampleOrder.customer_phone);
    html = html.replace(/{{order_number}}/g, sampleOrder.order_number);
    html = html.replace(/{{tracking_number}}/g, sampleOrder.tracking_number);
    html = html.replace(/{{order_date}}/g, new Date(sampleOrder.created_at).toLocaleDateString());
    html = html.replace(/{{total_amount}}/g, sampleOrder.total_amount.toFixed(2));
    
    const orderItemsHtml = sampleOrder.items.map(item => 
      `<div>${item.product_name} (${item.size}, ${item.color}) x${item.quantity}</div>`
    ).join('');
    html = html.replace(/{{order_items}}/g, orderItemsHtml);

    const newWindow = window.open();
    newWindow.document.write(html);
    newWindow.document.close();
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business">Business Information</TabsTrigger>
          <TabsTrigger value="labels">Shipping Labels</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Configure your business information that will appear on invoices and shipping labels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={settings?.business_name || ''}
                    onChange={(e) => updateSetting('business_name', e.target.value)}
                    placeholder="My Clothing Store"
                  />
                </div>
                <div>
                  <Label htmlFor="business-email">Email</Label>
                  <Input
                    id="business-email"
                    type="email"
                    value={settings?.email || ''}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    placeholder="info@myclothingstore.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="business-phone">Phone Number</Label>
                <Input
                  id="business-phone"
                  value={settings?.phone || ''}
                  onChange={(e) => updateSetting('phone', e.target.value)}
                  placeholder="+94 11 234 5678"
                />
              </div>

              <div>
                <Label htmlFor="business-address">Business Address</Label>
                <Textarea
                  id="business-address"
                  value={settings?.address || ''}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  placeholder="Enter your complete business address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  value={settings?.tax_rate || 0}
                  onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-sm text-slate-500 mt-1">
                  This will be used as the default tax rate for new orders
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Label Template</CardTitle>
              <CardDescription>
                Customize the HTML template for your shipping labels. Labels are designed for A4 paper size.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <Button 
                  onClick={previewLabel} 
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Eye size={16} className="mr-2" />
                  Preview Label
                </Button>
                <div className="text-sm text-slate-600">
                  <p><strong>Available Variables:</strong></p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-xs">
                    <code>{"{{business_name}}"}</code>
                    <code>{"{{business_address}}"}</code>
                    <code>{"{{business_phone}}"}</code>
                    <code>{"{{customer_name}}"}</code>
                    <code>{"{{customer_address}}"}</code>
                    <code>{"{{customer_phone}}"}</code>
                    <code>{"{{order_number}}"}</code>
                    <code>{"{{tracking_number}}"}</code>
                    <code>{"{{order_date}}"}</code>
                    <code>{"{{order_items}}"}</code>
                    <code>{"{{total_amount}}"}</code>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="label-template">HTML Template</Label>
                <Textarea
                  id="label-template"
                  value={settings?.shipping_label_template || ''}
                  onChange={(e) => updateSetting('shipping_label_template', e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter your HTML template here..."
                />
                <p className="text-sm text-slate-500 mt-1">
                  Use HTML and inline CSS. The template is designed for A4 paper (210mm x 297mm).
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Template Tips:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Use inline CSS for styling (external stylesheets won't work in print)</li>
                    <li>Set page size to A4: <code>width: 210mm; height: 297mm</code></li>
                    <li>Use <code>page-break-after: always;</code> for bulk printing separation</li>
                    <li>Test your template with the preview function</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

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