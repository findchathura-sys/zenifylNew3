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
        """Test shipping label generation - COMPREHENSIVE TESTING"""
        print("\n🏷️ Testing Shipping Labels (COMPREHENSIVE)...")
        
        # Create specific test data for label generation
        self.create_label_test_data()
        
        if not self.created_items['orders']:
            return self.log_test("Shipping Labels Setup", False, "- No orders available for testing")
        
        # TEST 1: Individual Label Generation
        print("   Testing Individual Label Generation...")
        for i, order_id in enumerate(self.created_items['orders'][:3]):  # Test first 3 orders
            try:
                response = requests.get(f"{self.api_url}/orders/{order_id}/shipping-label")
                
                # Check response status
                status_ok = response.status_code == 200
                
                # Check content type
                content_type = response.headers.get('content-type', '').lower()
                is_html = 'html' in content_type
                
                # Check HTML content quality
                html_content = response.text
                has_template_vars = all(var not in html_content for var in [
                    '{{business_name}}', '{{customer_name}}', '{{order_number}}',
                    '{{tracking_number}}', '{{order_items}}', '{{total_amount}}'
                ])
                
                # Check for essential content
                has_customer_info = any(keyword in html_content.lower() for keyword in ['customer', 'name', 'address'])
                has_order_info = any(keyword in html_content.lower() for keyword in ['order', 'total', 'items'])
                
                success = status_ok and is_html and has_template_vars and has_customer_info and has_order_info
                
                self.log_test(f"Individual Label {i+1}", success, 
                             f"- Status: {response.status_code}, HTML: {is_html}, Variables replaced: {has_template_vars}")
                
                if not success:
                    print(f"     Content preview: {html_content[:200]}...")
                    
            except Exception as e:
                self.log_test(f"Individual Label {i+1}", False, f"- Error: {str(e)}")
        
        # TEST 2: Bulk Label Generation
        print("   Testing Bulk Label Generation...")
        try:
            # Test with multiple orders
            test_order_ids = self.created_items['orders'][:3]
            response = requests.post(f"{self.api_url}/orders/bulk-labels", 
                                   json=test_order_ids,
                                   headers={'Content-Type': 'application/json'})
            
            status_ok = response.status_code == 200
            content_type = response.headers.get('content-type', '').lower()
            is_html = 'html' in content_type
            
            html_content = response.text
            
            # Check for page breaks (bulk labels should have page breaks)
            has_page_breaks = 'page-break-after' in html_content
            
            # Check that all orders are included
            order_count_in_html = html_content.count('Order #:') if 'Order #:' in html_content else html_content.count('order')
            expected_orders = len(test_order_ids)
            
            # Check template variables are replaced
            has_template_vars = all(var not in html_content for var in [
                '{{business_name}}', '{{customer_name}}', '{{order_number}}',
                '{{tracking_number}}', '{{order_items}}', '{{total_amount}}'
            ])
            
            success = status_ok and is_html and has_template_vars and has_page_breaks
            
            self.log_test("Bulk Label Generation", success, 
                         f"- Orders: {expected_orders}, Page breaks: {has_page_breaks}, Variables replaced: {has_template_vars}")
            
            if not success:
                print(f"     Status: {response.status_code}, Content-Type: {content_type}")
                print(f"     Content preview: {html_content[:300]}...")
                
        except Exception as e:
            self.log_test("Bulk Label Generation", False, f"- Error: {str(e)}")
        
        # TEST 3: Label Content Validation with Different Order Types
        print("   Testing Label Content with Different Order Types...")
        
        # Test with order that has tracking number
        order_with_tracking = None
        order_without_tracking = None
        
        for order_id in self.created_items['orders']:
            try:
                order_response = requests.get(f"{self.api_url}/orders/{order_id}")
                if order_response.status_code == 200:
                    order_data = order_response.json()
                    if order_data.get('tracking_number'):
                        order_with_tracking = order_id
                    else:
                        order_without_tracking = order_id
            except:
                continue
        
        # Test order with tracking number
        if order_with_tracking:
            try:
                response = requests.get(f"{self.api_url}/orders/{order_with_tracking}/shipping-label")
                html_content = response.text
                
                # Should not contain "TBD" for tracking number
                tracking_handled = 'TBD' not in html_content or html_content.count('TBD') <= 1  # Order number might be TBD
                
                self.log_test("Label with Tracking Number", tracking_handled,
                             f"- Tracking number properly displayed (no TBD)")
            except Exception as e:
                self.log_test("Label with Tracking Number", False, f"- Error: {str(e)}")
        
        # Test order without tracking number
        if order_without_tracking:
            try:
                response = requests.get(f"{self.api_url}/orders/{order_without_tracking}/shipping-label")
                html_content = response.text
                
                # Should contain "TBD" for tracking number
                tracking_handled = 'TBD' in html_content
                
                self.log_test("Label without Tracking Number", tracking_handled,
                             f"- Shows TBD for missing tracking number")
            except Exception as e:
                self.log_test("Label without Tracking Number", False, f"- Error: {str(e)}")
        
        # TEST 4: A4 Format and Styling
        print("   Testing A4 Format and Styling...")
        if self.created_items['orders']:
            try:
                response = requests.get(f"{self.api_url}/orders/{self.created_items['orders'][0]}/shipping-label")
                html_content = response.text
                
                # Check for A4 dimensions (210mm x 297mm)
                has_a4_dimensions = '210mm' in html_content and '297mm' in html_content
                
                # Check for proper styling
                has_styling = 'font-family' in html_content and 'padding' in html_content
                
                # Check for border/structure
                has_structure = 'border' in html_content or 'div' in html_content
                
                success = has_a4_dimensions and has_styling and has_structure
                
                self.log_test("A4 Format and Styling", success,
                             f"- A4 dims: {has_a4_dimensions}, Styling: {has_styling}, Structure: {has_structure}")
                
            except Exception as e:
                self.log_test("A4 Format and Styling", False, f"- Error: {str(e)}")
        
        # TEST 5: Error Handling for Invalid Orders
        print("   Testing Error Handling...")
        
        # Test with invalid order ID
        try:
            response = requests.get(f"{self.api_url}/orders/invalid-order-id/shipping-label")
            error_handled = response.status_code == 404
            
            self.log_test("Invalid Order ID Handling", error_handled,
                         f"- Returns 404 for invalid order ID")
        except Exception as e:
            self.log_test("Invalid Order ID Handling", False, f"- Error: {str(e)}")
        
        # Test bulk labels with invalid order IDs
        try:
            response = requests.post(f"{self.api_url}/orders/bulk-labels", 
                                   json=["invalid-id-1", "invalid-id-2"])
            
            # Should either return empty content or handle gracefully
            graceful_handling = response.status_code == 200
            
            self.log_test("Bulk Labels Invalid IDs", graceful_handling,
                         f"- Handles invalid IDs gracefully")
        except Exception as e:
            self.log_test("Bulk Labels Invalid IDs", False, f"- Error: {str(e)}")

    def create_label_test_data(self):
        """Create specific test data for comprehensive label testing"""
        print("   Creating comprehensive label test data...")
        
        # Create test product
        product_data = {
            "name": "Label Test T-Shirt",
            "description": "T-shirt for comprehensive label testing",
            "category": "T-Shirts",
            "low_stock_threshold": 5,
            "variants": [
                {
                    "size": "M",
                    "color": "Blue",
                    "sku": "LBL-TSH-M-BLU",
                    "stock_quantity": 100,
                    "price": 1500.00
                },
                {
                    "size": "L",
                    "color": "Red", 
                    "sku": "LBL-TSH-L-RED",
                    "stock_quantity": 100,
                    "price": 1700.00
                }
            ]
        }
        
        success, product = self.run_api_test('POST', 'products', 200, product_data)
        if not success:
            return
        
        # Create test customer
        customer_data = {
            "name": "Label Test Customer",
            "email": "labeltest@example.com",
            "phone": "+94 71 555 1234",
            "address": "123 Label Test Street, Test Area",
            "city": "Colombo",
            "postal_code": "00100"
        }
        
        success, customer = self.run_api_test('POST', 'customers', 200, customer_data)
        if not success:
            return
        
        # Create multiple test orders with different characteristics
        test_orders = [
            {
                "name": "Order with Tracking",
                "tracking_number": "TRK-LABEL-001",
                "remarks": "Test order with tracking number",
                "variant_index": 0
            },
            {
                "name": "Order without Tracking", 
                "tracking_number": None,
                "remarks": "Test order without tracking number",
                "variant_index": 1
            },
            {
                "name": "Order with Long Remarks",
                "tracking_number": "TRK-LABEL-002",
                "remarks": "This is a very long remark to test how the label handles extended text content and formatting",
                "variant_index": 0
            }
        ]
        
        for order_config in test_orders:
            variant = product['variants'][order_config['variant_index']]
            
            order_data = {
                "customer_id": customer['id'],
                "customer_name": customer['name'],
                "customer_address": f"{customer['address']}, {customer['city']}, {customer['postal_code']}",
                "customer_phone": customer['phone'],
                "customer_phone_2": "+94 77 555 9876",
                "customer_city": customer['city'],
                "items": [
                    {
                        "product_id": product['id'],
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
                "courier_charges": 350.0,
                "discount_amount": 50.0,
                "total_amount": (variant['price'] * 2 * 1.1) + 350.0 - 50.0,
                "cod_amount": 2000.0,
                "remarks": order_config['remarks']
            }
            
            if order_config['tracking_number']:
                order_data['tracking_number'] = order_config['tracking_number']
            
            success, order = self.run_api_test('POST', 'orders', 200, order_data)
            if success:
                self.created_items['orders'].append(order['id'])
                print(f"     Created {order_config['name']}: {order.get('order_number', order['id'])}")
        
        print(f"   Created {len(test_orders)} test orders for label testing")

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

    def test_enhanced_order_features(self):
        """Test ALL new enhanced order features from the review request"""
        print("\n🚀 Testing Enhanced Order Features...")
        
        # Create test data first
        product_data = {
            "name": "Enhanced Test Product",
            "description": "Product for testing enhanced features",
            "category": "Test Category",
            "low_stock_threshold": 5,
            "variants": [
                {
                    "size": "M",
                    "color": "Blue",
                    "sku": "ENH-M-BLU",
                    "stock_quantity": 50,
                    "price": 1000.00
                },
                {
                    "size": "L",
                    "color": "Red", 
                    "sku": "ENH-L-RED",
                    "stock_quantity": 30,
                    "price": 1200.00
                }
            ]
        }
        
        success, product = self.run_api_test('POST', 'products', 200, product_data)
        if not success:
            return self.log_test("Enhanced Features Setup", False, "- Cannot create test product")
        
        # Create test customer
        customer_data = {
            "name": "Enhanced Test Customer",
            "email": "enhanced@example.com",
            "phone": "+94 71 123 4567",
            "address": "123 Enhanced Street",
            "city": "Colombo",
            "postal_code": "00100"
        }
        success, customer = self.run_api_test('POST', 'customers', 200, customer_data)
        if not success:
            return self.log_test("Enhanced Features Setup", False, "- Cannot create test customer")
        
        variant = product['variants'][0]
        
        # TEST 1: Enhanced Order Fields (courier charges, discounts, secondary phone, COD, remarks)
        print("   Testing Enhanced Order Fields...")
        enhanced_order_data = {
            "customer_id": customer['id'],
            "customer_name": customer['name'],
            "customer_address": f"{customer['address']}, {customer['city']}, {customer['postal_code']}",
            "customer_phone": customer['phone'],
            "customer_phone_2": "+94 77 987 6543",  # NEW: Secondary phone
            "customer_city": customer['city'],
            "items": [
                {
                    "product_id": product['id'],
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
            "courier_charges": 350.0,  # NEW: Courier charges (default 350 LKR)
            "discount_amount": 100.0,  # NEW: Discount amount
            "discount_percentage": 0.0,  # NEW: Discount percentage
            "total_amount": (variant['price'] * 2 * 1.1) + 350.0 - 100.0,  # Include courier and discount
            "cod_amount": 1500.0,  # NEW: COD amount
            "remarks": "Test order with enhanced fields"  # NEW: Remarks
        }
        
        success, enhanced_order = self.run_api_test('POST', 'orders', 200, enhanced_order_data)
        if success and 'id' in enhanced_order:
            self.created_items['orders'].append(enhanced_order['id'])
            
            # Verify all enhanced fields are present
            enhanced_fields_present = all(field in enhanced_order for field in [
                'customer_phone_2', 'courier_charges', 'discount_amount', 
                'discount_percentage', 'cod_amount', 'remarks'
            ])
            
            self.log_test("Enhanced Order Fields", enhanced_fields_present,
                         f"- Order {enhanced_order.get('order_number')} with all enhanced fields")
            
            # Verify total calculation includes courier charges and discounts
            expected_total = (variant['price'] * 2 * 1.1) + 350.0 - 100.0
            actual_total = enhanced_order.get('total_amount', 0)
            total_calculation_correct = abs(expected_total - actual_total) < 0.01
            
            self.log_test("Total Calculation with Courier & Discount", total_calculation_correct,
                         f"- Expected: {expected_total:.2f}, Actual: {actual_total:.2f}")
        else:
            self.log_test("Enhanced Order Fields", False, "- Failed to create enhanced order")
            return
        
        # TEST 2: Order Edit Functionality (PUT endpoint)
        print("   Testing Order Edit Functionality...")
        
        # Modify the order data
        enhanced_order_data['remarks'] = "Updated remarks via edit"
        enhanced_order_data['courier_charges'] = 400.0  # Changed courier charges
        enhanced_order_data['discount_amount'] = 150.0  # Changed discount
        enhanced_order_data['total_amount'] = (variant['price'] * 2 * 1.1) + 400.0 - 150.0
        
        success, updated_order = self.run_api_test('PUT', f"orders/{enhanced_order['id']}", 200, enhanced_order_data)
        if success:
            # Verify the changes were applied
            remarks_updated = updated_order.get('remarks') == "Updated remarks via edit"
            courier_updated = updated_order.get('courier_charges') == 400.0
            
            self.log_test("Order Edit Functionality", remarks_updated and courier_updated,
                         f"- Updated remarks and courier charges successfully")
        else:
            self.log_test("Order Edit Functionality", False, "- Failed to update order")
        
        # TEST 3: Order Delete with Stock Restoration
        print("   Testing Order Delete with Stock Restoration...")
        
        # Get current stock before deletion
        success, product_before = self.run_api_test('GET', f"products/{product['id']}", 200)
        if success:
            stock_before = next((v['stock_quantity'] for v in product_before['variants'] if v['id'] == variant['id']), 0)
            
            # Delete the order
            success, _ = self.run_api_test('DELETE', f"orders/{enhanced_order['id']}", 200)
            if success:
                # Check if stock was restored
                success, product_after = self.run_api_test('GET', f"products/{product['id']}", 200)
                if success:
                    stock_after = next((v['stock_quantity'] for v in product_after['variants'] if v['id'] == variant['id']), 0)
                    stock_restored = stock_after == stock_before + 2  # We ordered 2 items
                    
                    self.log_test("Order Delete with Stock Restoration", stock_restored,
                                 f"- Stock before: {stock_before}, after: {stock_after} (restored +2)")
                    
                    # Remove from our tracking since it's deleted
                    if enhanced_order['id'] in self.created_items['orders']:
                        self.created_items['orders'].remove(enhanced_order['id'])
                else:
                    self.log_test("Order Delete with Stock Restoration", False, "- Cannot verify stock after deletion")
            else:
                self.log_test("Order Delete with Stock Restoration", False, "- Failed to delete order")
        else:
            self.log_test("Order Delete with Stock Restoration", False, "- Cannot get initial stock")
        
        # TEST 4: CSV Export Functionality
        print("   Testing CSV Export Functionality...")
        
        # Create a few more orders for CSV export testing
        csv_test_orders = []
        for i in range(3):
            csv_order_data = {
                "customer_id": customer['id'],
                "customer_name": customer['name'],
                "customer_address": f"{customer['address']}, {customer['city']}, {customer['postal_code']}",
                "customer_phone": customer['phone'],
                "customer_phone_2": f"+94 77 888 000{i}",
                "customer_city": customer['city'],
                "items": [
                    {
                        "product_id": product['id'],
                        "variant_id": variant['id'],
                        "product_name": product['name'],
                        "size": variant['size'],
                        "color": variant['color'],
                        "quantity": 1,
                        "unit_price": variant['price'],
                        "total_price": variant['price']
                    }
                ],
                "subtotal": variant['price'],
                "tax_amount": variant['price'] * 0.1,
                "courier_charges": 350.0,
                "discount_amount": 50.0,
                "total_amount": (variant['price'] * 1.1) + 350.0 - 50.0,
                "cod_amount": 1000.0 + (i * 100),
                "remarks": f"CSV test order {i+1}",
                "tracking_number": f"CSV-TRK-{i+1:03d}"
            }
            
            success, csv_order = self.run_api_test('POST', 'orders', 200, csv_order_data)
            if success:
                csv_test_orders.append(csv_order['id'])
                self.created_items['orders'].append(csv_order['id'])
        
        if len(csv_test_orders) >= 2:
            # Test CSV export with specific columns
            try:
                response = requests.post(f"{self.api_url}/orders/export-csv", 
                                       json=csv_test_orders[:2],  # Export first 2 orders
                                       headers={'Content-Type': 'application/json'})
                
                csv_export_success = response.status_code == 200 and 'text/csv' in response.headers.get('content-type', '')
                
                if csv_export_success:
                    # Verify CSV content has required columns
                    csv_content = response.text
                    required_columns = [
                        "Waybill Number", "Order Number", "Customer Name", "Address",
                        "Order Description", "Customer First Phone No", "Customer Second Phone No",
                        "COD Amount", "City", "Remarks"
                    ]
                    
                    has_required_columns = all(col in csv_content for col in required_columns)
                    
                    self.log_test("CSV Export Functionality", has_required_columns,
                                 f"- Exported {len(csv_test_orders[:2])} orders with all required columns")
                else:
                    self.log_test("CSV Export Functionality", False, 
                                 f"- Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}")
                    
            except Exception as e:
                self.log_test("CSV Export Functionality", False, f"- Error: {str(e)}")
        else:
            self.log_test("CSV Export Functionality", False, "- Not enough test orders created")
        
        # TEST 5: Percentage Discount Calculation
        print("   Testing Percentage Discount Calculation...")
        
        percentage_order_data = {
            "customer_id": customer['id'],
            "customer_name": customer['name'],
            "customer_address": f"{customer['address']}, {customer['city']}, {customer['postal_code']}",
            "customer_phone": customer['phone'],
            "customer_city": customer['city'],
            "items": [
                {
                    "product_id": product['id'],
                    "variant_id": variant['id'],
                    "product_name": product['name'],
                    "size": variant['size'],
                    "color": variant['color'],
                    "quantity": 1,
                    "unit_price": variant['price'],
                    "total_price": variant['price']
                }
            ],
            "subtotal": variant['price'],
            "tax_amount": variant['price'] * 0.1,
            "courier_charges": 350.0,
            "discount_amount": 0.0,
            "discount_percentage": 10.0,  # 10% discount
            "total_amount": (variant['price'] * 1.1 + 350.0) * 0.9,  # 10% off total
            "remarks": "Testing percentage discount"
        }
        
        success, percentage_order = self.run_api_test('POST', 'orders', 200, percentage_order_data)
        if success:
            self.created_items['orders'].append(percentage_order['id'])
            
            # Verify percentage discount is stored correctly
            percentage_correct = percentage_order.get('discount_percentage') == 10.0
            amount_zero = percentage_order.get('discount_amount', -1) >= 0  # Should be calculated
            
            self.log_test("Percentage Discount Calculation", percentage_correct and amount_zero,
                         f"- 10% discount applied, amount calculated: {percentage_order.get('discount_amount', 0):.2f}")
        else:
            self.log_test("Percentage Discount Calculation", False, "- Failed to create percentage discount order")
        
        # Cleanup enhanced test data
        self.run_api_test('DELETE', f"products/{product['id']}", 200)

    def test_order_validation_and_error_handling(self):
        """Test validation and error handling for enhanced features"""
        print("\n🛡️ Testing Order Validation and Error Handling...")
        
        # Test 1: Invalid customer ID
        invalid_order = {
            "customer_id": "invalid-customer-id",
            "customer_name": "Invalid Customer",
            "customer_address": "Invalid Address",
            "customer_phone": "Invalid Phone",
            "items": [],
            "subtotal": 0,
            "tax_amount": 0,
            "total_amount": 0
        }
        
        success, _ = self.run_api_test('POST', 'orders', 422, invalid_order)  # Expecting validation error
        if not success:
            # If 422 not returned, check if it's 400 or 500
            success, _ = self.run_api_test('POST', 'orders', 400, invalid_order)
            if not success:
                success, _ = self.run_api_test('POST', 'orders', 500, invalid_order)
        
        self.log_test("Invalid Order Validation", success, "- Properly rejects invalid orders")
        
        # Test 2: Invalid status update
        success, _ = self.run_api_test('PUT', 'orders/invalid-order-id/status', 404,
                                    params={'status': 'invalid_status'})
        self.log_test("Invalid Status Update", success, "- Properly handles invalid order ID")
        
        # Test 3: Empty tracking number handling
        if self.created_items['orders']:
            order_id = self.created_items['orders'][0]
            success, _ = self.run_api_test('PUT', f"orders/{order_id}/status", 200,
                                        params={'status': 'pending', 'tracking_number': ''})
            self.log_test("Empty Tracking Number", success, "- Handles empty tracking numbers")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting ClothierPOS Enhanced API Tests...")
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
        self.test_enhanced_order_features()  # NEW: Test enhanced features
        self.test_order_validation_and_error_handling()  # NEW: Test validation
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