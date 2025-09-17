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

// Basic placeholder components for now
const Inventory = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-slate-600">Inventory management functionality coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

const Customers = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-slate-600">Customer management functionality coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

const Orders = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Order Management</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-slate-600">Order management functionality coming soon...</p>
      </CardContent>
    </Card>
  </div>
);

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
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;