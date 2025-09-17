#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import uuid

class ClothierPOSAPITester:
    def __init__(self, base_url="https://clothier-ops.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = {
            'products': [],
            'customers': [],
            'orders': []
        }

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def run_api_test(self, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            
            if success:
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, response.text
            else:
                print(f"   Status: {response.status_code}, Expected: {expected_status}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"   Error: {str(e)}")
            return False, {}

    def test_dashboard(self):
        """Test dashboard endpoint"""
        print("\n🏠 Testing Dashboard...")
        success, data = self.run_api_test('GET', 'dashboard', 200)
        
        if success and isinstance(data, dict):
            required_keys = ['daily_sales', 'low_stock_count', 'recent_orders', 'order_stats']
            has_all_keys = all(key in data for key in required_keys)
            return self.log_test("Dashboard API", has_all_keys, 
                               f"- Keys present: {list(data.keys())}")
        
        return self.log_test("Dashboard API", False, "- Invalid response structure")

    def test_products_crud(self):
        """Test product CRUD operations"""
        print("\n📦 Testing Products CRUD...")
        
        # Test GET products (empty initially)
        success, _ = self.run_api_test('GET', 'products', 200)
        self.log_test("Get Products", success)
        
        # Test CREATE product
        product_data = {
            "name": "Test T-Shirt",
            "description": "A comfortable cotton t-shirt",
            "category": "T-Shirts",
            "low_stock_threshold": 5,
            "variants": [
                {
                    "size": "M",
                    "color": "Blue",
                    "sku": "TSH-M-BLU-001",
                    "stock_quantity": 10,
                    "price": 1500.00
                },
                {
                    "size": "L", 
                    "color": "Red",
                    "sku": "TSH-L-RED-001",
                    "stock_quantity": 8,
                    "price": 1600.00
                }
            ]
        }
        
        success, product = self.run_api_test('POST', 'products', 200, product_data)
        if success and 'id' in product:
            self.created_items['products'].append(product['id'])
            self.log_test("Create Product", True, f"- ID: {product['id']}")
            
            # Test GET single product
            success, _ = self.run_api_test('GET', f"products/{product['id']}", 200)
            self.log_test("Get Single Product", success)
            
            # Test UPDATE product
            product_data['name'] = "Updated Test T-Shirt"
            success, _ = self.run_api_test('PUT', f"products/{product['id']}", 200, product_data)
            self.log_test("Update Product", success)
            
        else:
            self.log_test("Create Product", False)
        
        # Test low stock endpoint
        success, low_stock = self.run_api_test('GET', 'products/low-stock', 200)
        self.log_test("Get Low Stock Products", success, f"- Found {len(low_stock) if isinstance(low_stock, list) else 0} items")

    def test_customers_crud(self):
        """Test customer CRUD operations"""
        print("\n👥 Testing Customers CRUD...")
        
        # Test GET customers
        success, _ = self.run_api_test('GET', 'customers', 200)
        self.log_test("Get Customers", success)
        
        # Test CREATE customer
        customer_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+94 71 234 5678",
            "address": "123 Test Street",
            "city": "Colombo",
            "postal_code": "00100"
        }
        
        success, customer = self.run_api_test('POST', 'customers', 200, customer_data)
        if success and 'id' in customer:
            self.created_items['customers'].append(customer['id'])
            self.log_test("Create Customer", True, f"- ID: {customer['id']}")
            
            # Test GET single customer
            success, _ = self.run_api_test('GET', f"customers/{customer['id']}", 200)
            self.log_test("Get Single Customer", success)
            
            # Test UPDATE customer
            customer_data['name'] = "John Updated Doe"
            success, _ = self.run_api_test('PUT', f"customers/{customer['id']}", 200, customer_data)
            self.log_test("Update Customer", success)
            
        else:
            self.log_test("Create Customer", False)

    def test_orders_workflow(self):
        """Test complete order workflow"""
        print("\n🛒 Testing Orders Workflow...")
        
        # Test GET orders
        success, _ = self.run_api_test('GET', 'orders', 200)
        self.log_test("Get Orders", success)
        
        # Create fresh product and customer for order test
        product_data = {
            "name": "Order Test T-Shirt",
            "description": "A test t-shirt for order workflow",
            "category": "T-Shirts",
            "low_stock_threshold": 5,
            "variants": [
                {
                    "size": "M",
                    "color": "Green",
                    "sku": "ORDER-TSH-M-GRN",
                    "stock_quantity": 20,
                    "price": 2000.00
                }
            ]
        }
        
        success, product = self.run_api_test('POST', 'products', 200, product_data)
        if not success or 'id' not in product:
            return self.log_test("Orders Workflow", False, "- Cannot create test product")
        
        test_product_id = product['id']
        
        customer_data = {
            "name": "Order Test Customer",
            "email": "ordertest@example.com",
            "phone": "+94 71 999 8888",
            "address": "456 Order Test Street",
            "city": "Kandy",
            "postal_code": "20000"
        }
        
        success, customer = self.run_api_test('POST', 'customers', 200, customer_data)
        if not success or 'id' not in customer:
            return self.log_test("Orders Workflow", False, "- Cannot create test customer")
        
        test_customer_id = customer['id']
        variant = product['variants'][0]
        
        # Test CREATE order
        order_data = {
            "customer_id": test_customer_id,
            "customer_name": customer['name'],
            "customer_address": f"{customer['address']}, {customer['city']}, {customer['postal_code']}",
            "customer_phone": customer['phone'],
            "items": [
                {
                    "product_id": test_product_id,
                    "variant_id": variant['id'],
                    "product_name": product['name'],
                    "size": variant['size'],
                    "color": variant['color'],
                    "quantity": 2,
                    "unit_price": variant['price'],
                    "total_price": variant['price'] * 2
                }
            ],
            "subtotal": variant['price'] * 2,
            "tax_amount": variant['price'] * 2 * 0.1,
            "total_amount": variant['price'] * 2 * 1.1
        }
        
        success, order = self.run_api_test('POST', 'orders', 200, order_data)
        if success and 'id' in order:
            order_id = order['id']
            self.created_items['orders'].append(order_id)
            self.log_test("Create Order", True, f"- Order: {order.get('order_number', order_id)}")
            
            # Test order status updates
            success, _ = self.run_api_test('PUT', f"orders/{order_id}/status", 200, 
                                        params={'status': 'on_courier', 'tracking_number': 'TRK123456'})
            self.log_test("Update Order Status (On Courier)", success)
            
            success, _ = self.run_api_test('PUT', f"orders/{order_id}/status", 200, 
                                        params={'status': 'delivered'})
            self.log_test("Update Order Status (Delivered)", success)
            
            success, _ = self.run_api_test('PUT', f"orders/{order_id}/status", 200, 
                                        params={'status': 'returned'})
            self.log_test("Update Order Status (Returned)", success)
            
            # Clean up test data
            self.run_api_test('DELETE', f"products/{test_product_id}", 200)
            
        else:
            self.log_test("Create Order", False)

    def test_shipping_labels(self):
        """Test shipping label generation"""
        print("\n🏷️ Testing Shipping Labels...")
        
        if not self.created_items['orders']:
            return self.log_test("Shipping Labels", False, "- No orders available")
        
        order_id = self.created_items['orders'][0]
        
        # Test individual label
        try:
            response = requests.get(f"{self.api_url}/orders/{order_id}/shipping-label")
            success = response.status_code == 200 and 'html' in response.headers.get('content-type', '').lower()
            self.log_test("Individual Shipping Label", success, 
                         f"- Content-Type: {response.headers.get('content-type', 'unknown')}")
        except Exception as e:
            self.log_test("Individual Shipping Label", False, f"- Error: {str(e)}")
        
        # Test bulk labels
        try:
            response = requests.post(f"{self.api_url}/orders/bulk-labels", 
                                   json=self.created_items['orders'])
            success = response.status_code == 200 and 'html' in response.headers.get('content-type', '').lower()
            self.log_test("Bulk Shipping Labels", success, 
                         f"- Orders: {len(self.created_items['orders'])}")
        except Exception as e:
            self.log_test("Bulk Shipping Labels", False, f"- Error: {str(e)}")

    def test_finance_reports(self):
        """Test finance and reporting endpoints"""
        print("\n💰 Testing Finance Reports...")
        
        # Test daily sales
        today = datetime.now().strftime("%Y-%m-%d")
        success, data = self.run_api_test('GET', 'finance/daily-sales', 200, params={'date': today})
        if success and isinstance(data, dict):
            required_keys = ['date', 'total_sales', 'total_orders']
            has_keys = all(key in data for key in required_keys)
            self.log_test("Daily Sales Report", has_keys, 
                         f"- Sales: LKR {data.get('total_sales', 0)}, Orders: {data.get('total_orders', 0)}")
        else:
            self.log_test("Daily Sales Report", False)
        
        # Test profit/loss report
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        end_date = datetime.now().strftime("%Y-%m-%d")
        
        success, data = self.run_api_test('GET', 'finance/profit-loss', 200, 
                                        params={'start_date': start_date, 'end_date': end_date})
        if success and isinstance(data, dict):
            required_keys = ['total_revenue', 'total_cost', 'profit', 'profit_margin']
            has_keys = all(key in data for key in required_keys)
            self.log_test("Profit/Loss Report", has_keys, 
                         f"- Revenue: LKR {data.get('total_revenue', 0)}, Profit: LKR {data.get('profit', 0)}")
        else:
            self.log_test("Profit/Loss Report", False)

    def test_settings(self):
        """Test settings management"""
        print("\n⚙️ Testing Settings...")
        
        # Test GET settings
        success, settings = self.run_api_test('GET', 'settings', 200)
        if success and isinstance(settings, dict):
            self.log_test("Get Settings", True, f"- Business: {settings.get('business_name', 'Unknown')}")
            
            # Test UPDATE settings
            settings['business_name'] = "Test Clothing Store"
            settings['tax_rate'] = 10.0
            success, _ = self.run_api_test('PUT', 'settings', 200, settings)
            self.log_test("Update Settings", success)
            
        else:
            self.log_test("Get Settings", False)

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete orders first (due to dependencies)
        for order_id in self.created_items['orders']:
            success, _ = self.run_api_test('DELETE', f"orders/{order_id}", 200)
            # Note: Order deletion might not be implemented, that's okay
        
        # Delete products
        for product_id in self.created_items['products']:
            success, _ = self.run_api_test('DELETE', f"products/{product_id}", 200)
            if success:
                print(f"   Deleted product: {product_id}")
        
        # Note: Customer deletion might not be implemented

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting ClothierPOS API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test basic connectivity
        try:
            response = requests.get(f"{self.base_url}/api/dashboard", timeout=10)
            if response.status_code != 200:
                print(f"❌ Cannot connect to API. Status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Cannot connect to API. Error: {str(e)}")
            return False
        
        print("✅ API connectivity confirmed")
        
        # Run all test suites
        self.test_dashboard()
        self.test_products_crud()
        self.test_customers_crud()
        self.test_orders_workflow()
        self.test_shipping_labels()
        self.test_finance_reports()
        self.test_settings()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Cleanup
        self.cleanup_test_data()
        
        return self.tests_passed == self.tests_run

def main():
    tester = ClothierPOSAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())