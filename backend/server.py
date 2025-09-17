from fastapi import FastAPI, APIRouter, HTTPException, Form, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class OrderStatus(str, Enum):
    PENDING = "pending"
    ON_COURIER = "on_courier"
    DELIVERED = "delivered"
    RETURNED = "returned"

class SizeEnum(str, Enum):
    XS = "XS"
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"

# Pydantic Models
class ProductVariant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    size: SizeEnum
    color: str
    sku: str
    stock_quantity: int
    price: float
    buy_price: Optional[float] = None
    purchase_date: Optional[datetime] = None

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    variants: List[ProductVariant]
    low_stock_threshold: int = 5
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    phone_2: Optional[str] = None
    address: str
    city: str
    postal_code: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderItem(BaseModel):
    product_id: str
    variant_id: str
    product_name: str
    size: str
    color: str
    quantity: int
    unit_price: float
    total_price: float

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: Optional[str] = None
    customer_id: str
    customer_name: str
    customer_address: str
    customer_phone: str
    customer_phone_2: Optional[str] = None
    customer_city: Optional[str] = None
    items: List[OrderItem]
    subtotal: float
    tax_amount: float
    courier_charges: float = 350.0
    discount_amount: float = 0.0
    discount_percentage: float = 0.0
    total_amount: float
    status: OrderStatus = OrderStatus.PENDING
    tracking_number: Optional[str] = None
    cod_amount: Optional[float] = None
    remarks: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BusinessSettings(BaseModel):
    id: str = Field(default="business_settings")
    business_name: str = "My Clothing Store"
    address: str = ""
    phone: str = ""
    email: str = ""
    tax_rate: float = 0.0
    shipping_label_template: str = """
    <div style="width: 210mm; height: 297mm; padding: 20mm; font-family: Arial, sans-serif;">
        <div style="border: 2px solid #000; height: 100%; padding: 10mm;">
            <h2 style="text-align: center; margin-bottom: 20px;">{{business_name}}</h2>
            <div style="margin-bottom: 20px;">
                <strong>From:</strong><br>
                {{business_address}}<br>
                {{business_phone}}
            </div>
            <div style="margin-bottom: 20px;">
                <strong>To:</strong><br>
                {{customer_name}}<br>
                {{customer_address}}<br>
                {{customer_phone}}
            </div>
            <div style="margin-bottom: 20px;">
                <strong>Order #:</strong> {{order_number}}<br>
                <strong>Tracking #:</strong> {{tracking_number}}<br>
                <strong>Date:</strong> {{order_date}}
            </div>
            <div style="margin-bottom: 20px;">
                <strong>Items:</strong><br>
                {{order_items}}
            </div>
            <div style="margin-top: 40px; text-align: center;">
                <strong>Total: LKR {{total_amount}}</strong>
            </div>
        </div>
    </div>
    """

# Helper functions
def prepare_for_mongo(data):
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, list):
                data[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
            elif isinstance(value, dict):
                data[key] = prepare_for_mongo(value)
    return data

def parse_from_mongo(item):
    if isinstance(item, dict):
        for key, value in item.items():
            if key == '_id':
                # Skip MongoDB ObjectId fields
                continue
            elif isinstance(value, str) and 'T' in value and (value.endswith('Z') or (len(value) > 6 and '+' in value[-6:])):
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
            elif isinstance(value, list):
                item[key] = [parse_from_mongo(sub_item) if isinstance(sub_item, dict) else sub_item for sub_item in value]
            elif isinstance(value, dict):
                item[key] = parse_from_mongo(value)
    return item

# Product Routes
@api_router.post("/products", response_model=Product)
async def create_product(product: Product):
    product_dict = prepare_for_mongo(product.dict())
    await db.products.insert_one(product_dict)
    return product

@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find().to_list(1000)
    return [Product(**parse_from_mongo(product)) for product in products]

@api_router.get("/products/low-stock")
async def get_low_stock_products():
    products = await db.products.find().to_list(1000)
    low_stock_items = []
    
    for product in products:
        product_obj = Product(**parse_from_mongo(product))
        for variant in product_obj.variants:
            if variant.stock_quantity <= product_obj.low_stock_threshold:
                low_stock_items.append({
                    "product_id": product_obj.id,
                    "product_name": product_obj.name,
                    "variant_id": variant.id,
                    "size": variant.size,
                    "color": variant.color,
                    "current_stock": variant.stock_quantity,
                    "threshold": product_obj.low_stock_threshold
                })
    
    return low_stock_items

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**parse_from_mongo(product))

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product: Product):
    product.updated_at = datetime.now(timezone.utc)
    product_dict = prepare_for_mongo(product.dict())
    await db.products.update_one({"id": product_id}, {"$set": product_dict})
    return product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted successfully"}

# Customer Routes
@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: Customer):
    customer_dict = prepare_for_mongo(customer.dict())
    await db.customers.insert_one(customer_dict)
    return customer

@api_router.get("/customers", response_model=List[Customer])
async def get_customers():
    customers = await db.customers.find().to_list(1000)
    return [Customer(**parse_from_mongo(customer)) for customer in customers]

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return Customer(**parse_from_mongo(customer))

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer: Customer):
    customer_dict = prepare_for_mongo(customer.dict())
    await db.customers.update_one({"id": customer_id}, {"$set": customer_dict})
    return customer

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str):
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    await db.customers.delete_one({"id": customer_id})
    return {"message": "Customer deleted successfully"}

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order: Order):
    # Generate order number
    order_count = await db.orders.count_documents({})
    order.order_number = f"ORD-{order_count + 1:06d}"
    
    # Update stock quantities
    for item in order.items:
        product = await db.products.find_one({"id": item.product_id})
        if product:
            product_obj = Product(**parse_from_mongo(product))
            for variant in product_obj.variants:
                if variant.id == item.variant_id:
                    variant.stock_quantity -= item.quantity
                    break
            
            product_dict = prepare_for_mongo(product_obj.dict())
            await db.products.update_one({"id": item.product_id}, {"$set": product_dict})
    
    order_dict = prepare_for_mongo(order.dict())
    await db.orders.insert_one(order_dict)
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find().to_list(1000)
    return [Order(**parse_from_mongo(order)) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**parse_from_mongo(order))

@api_router.post("/orders/export-csv")
async def export_orders_csv(order_ids: List[str]):
    try:
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write CSV headers
        headers = [
            "Waybill Number", "Order Number", "Customer Name", "Address", 
            "Order Description", "Customer First Phone No", "Customer Second Phone No",
            "COD Amount", "City", "Remarks"
        ]
        writer.writerow(headers)
        
        # Fetch orders and write data
        for order_id in order_ids:
            order = await db.orders.find_one({"id": order_id})
            if order:
                order_obj = Order(**parse_from_mongo(order))
                
                # Create order description from items
                order_description = "; ".join([
                    f"{item.product_name} ({item.size}, {item.color}) x{item.quantity}" 
                    for item in order_obj.items
                ])
                
                # Extract city from address
                address_parts = order_obj.customer_address.split(", ")
                city = address_parts[-2] if len(address_parts) >= 2 else order_obj.customer_city if hasattr(order_obj, 'customer_city') else ""
                
                row = [
                    order_obj.tracking_number or "",
                    order_obj.order_number or "",
                    order_obj.customer_name or "",
                    order_obj.customer_address or "",
                    order_description,
                    order_obj.customer_phone or "",
                    order_obj.customer_phone_2 or "",
                    order_obj.cod_amount or order_obj.total_amount,
                    city,
                    order_obj.remarks or ""
                ]
                writer.writerow(row)
        
        output.seek(0)
        csv_content = output.getvalue()
        output.close()
        
        from fastapi.responses import Response
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=orders_export.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@api_router.put("/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, order: Order):
    existing_order = await db.orders.find_one({"id": order_id})
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.updated_at = datetime.now(timezone.utc)
    order_dict = prepare_for_mongo(order.dict())
    await db.orders.update_one({"id": order_id}, {"$set": order_dict})
    return order

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str):
    existing_order = await db.orders.find_one({"id": order_id})
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order_obj = Order(**parse_from_mongo(existing_order))
    
    # Restore stock quantities when deleting order
    for item in order_obj.items:
        product = await db.products.find_one({"id": item.product_id})
        if product:
            product_obj = Product(**parse_from_mongo(product))
            for variant in product_obj.variants:
                if variant.id == item.variant_id:
                    variant.stock_quantity += item.quantity
                    break
            
            product_dict = prepare_for_mongo(product_obj.dict())
            await db.products.update_one({"id": item.product_id}, {"$set": product_dict})
    
    await db.orders.delete_one({"id": order_id})
    return {"message": "Order deleted successfully"}

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus, tracking_number: Optional[str] = None):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order_obj = Order(**parse_from_mongo(order))
    
    # If returning order, restore stock
    if status == OrderStatus.RETURNED and order_obj.status != OrderStatus.RETURNED:
        for item in order_obj.items:
            product = await db.products.find_one({"id": item.product_id})
            if product:
                product_obj = Product(**parse_from_mongo(product))
                for variant in product_obj.variants:
                    if variant.id == item.variant_id:
                        variant.stock_quantity += item.quantity
                        break
                
                product_dict = prepare_for_mongo(product_obj.dict())
                await db.products.update_one({"id": item.product_id}, {"$set": product_dict})
    
    update_data = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if tracking_number:
        update_data["tracking_number"] = tracking_number
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    return {"message": "Order status updated successfully"}

# Shipping Label Routes
@api_router.get("/orders/{order_id}/shipping-label", response_class=HTMLResponse)
async def get_shipping_label(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    settings = await db.settings.find_one({"id": "business_settings"})
    if not settings:
        settings = BusinessSettings().dict()
    
    order_obj = Order(**parse_from_mongo(order))
    settings_obj = BusinessSettings(**settings)
    
    # Prepare template variables
    order_items_html = "<ul>"
    for item in order_obj.items:
        order_items_html += f"<li>{item.product_name} ({item.size}, {item.color}) x{item.quantity}</li>"
    order_items_html += "</ul>"
    
    html_content = settings_obj.shipping_label_template
    html_content = html_content.replace("{{business_name}}", settings_obj.business_name or "")
    html_content = html_content.replace("{{business_address}}", settings_obj.address or "")
    html_content = html_content.replace("{{business_phone}}", settings_obj.phone or "")
    html_content = html_content.replace("{{customer_name}}", order_obj.customer_name or "")
    html_content = html_content.replace("{{customer_address}}", order_obj.customer_address or "")
    html_content = html_content.replace("{{customer_phone}}", order_obj.customer_phone or "")
    html_content = html_content.replace("{{order_number}}", order_obj.order_number or "TBD")
    html_content = html_content.replace("{{tracking_number}}", order_obj.tracking_number or "TBD")
    html_content = html_content.replace("{{order_date}}", order_obj.created_at.strftime("%Y-%m-%d") if order_obj.created_at else "")
    html_content = html_content.replace("{{order_items}}", order_items_html)
    html_content = html_content.replace("{{total_amount}}", f"{order_obj.total_amount:.2f}" if order_obj.total_amount else "0.00")
    
    return HTMLResponse(content=html_content)

@api_router.post("/orders/bulk-labels", response_class=HTMLResponse)
async def get_bulk_shipping_labels(order_ids: List[str]):
    settings = await db.settings.find_one({"id": "business_settings"})
    if not settings:
        settings = BusinessSettings().dict()
    
    settings_obj = BusinessSettings(**settings)
    bulk_html = ""
    
    for order_id in order_ids:
        order = await db.orders.find_one({"id": order_id})
        if order:
            order_obj = Order(**parse_from_mongo(order))
            
            order_items_html = "<ul>"
            for item in order_obj.items:
                order_items_html += f"<li>{item.product_name} ({item.size}, {item.color}) x{item.quantity}</li>"
            order_items_html += "</ul>"
            
            html_content = settings_obj.shipping_label_template
            html_content = html_content.replace("{{business_name}}", settings_obj.business_name or "")
            html_content = html_content.replace("{{business_address}}", settings_obj.address or "")
            html_content = html_content.replace("{{business_phone}}", settings_obj.phone or "")
            html_content = html_content.replace("{{customer_name}}", order_obj.customer_name or "")
            html_content = html_content.replace("{{customer_address}}", order_obj.customer_address or "")
            html_content = html_content.replace("{{customer_phone}}", order_obj.customer_phone or "")
            html_content = html_content.replace("{{order_number}}", order_obj.order_number or "TBD")
            html_content = html_content.replace("{{tracking_number}}", order_obj.tracking_number or "TBD")
            html_content = html_content.replace("{{order_date}}", order_obj.created_at.strftime("%Y-%m-%d") if order_obj.created_at else "")
            html_content = html_content.replace("{{order_items}}", order_items_html)
            html_content = html_content.replace("{{total_amount}}", f"{order_obj.total_amount:.2f}" if order_obj.total_amount else "0.00")
            
            bulk_html += html_content + '<div style="page-break-after: always;"></div>'
    
    return HTMLResponse(content=bulk_html)

# Finance Routes
@api_router.get("/finance/daily-sales")
async def get_daily_sales(date: str = None):
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    start_date = datetime.fromisoformat(f"{date}T00:00:00")
    end_date = datetime.fromisoformat(f"{date}T23:59:59")
    
    orders = await db.orders.find({
        "created_at": {"$gte": start_date.isoformat(), "$lte": end_date.isoformat()},
        "status": {"$ne": "returned"}
    }).to_list(1000)
    
    total_sales = sum(order["total_amount"] for order in orders)
    total_orders = len(orders)
    
    return {
        "date": date,
        "total_sales": total_sales,
        "total_orders": total_orders,
        "orders": [Order(**parse_from_mongo(order)) for order in orders]
    }

@api_router.get("/finance/profit-loss")
async def get_profit_loss(start_date: str, end_date: str):
    start = datetime.fromisoformat(f"{start_date}T00:00:00")
    end = datetime.fromisoformat(f"{end_date}T23:59:59")
    
    orders = await db.orders.find({
        "created_at": {"$gte": start.isoformat(), "$lte": end.isoformat()},
        "status": {"$ne": "returned"}
    }).to_list(1000)
    
    total_revenue = sum(order["total_amount"] for order in orders)
    total_actual_cost = 0.0
    total_estimated_cost = 0.0
    items_with_cost_data = 0
    total_items = 0
    
    # Calculate actual costs from buy prices
    for order in orders:
        order_obj = Order(**parse_from_mongo(order))
        for item in order_obj.items:
            total_items += item.quantity
            # Try to get actual buy price from product variant
            product = await db.products.find_one({"id": item.product_id})
            if product:
                product_obj = Product(**parse_from_mongo(product))
                for variant in product_obj.variants:
                    if variant.id == item.variant_id and variant.buy_price:
                        actual_cost = variant.buy_price * item.quantity
                        total_actual_cost += actual_cost
                        items_with_cost_data += item.quantity
                        break
                else:
                    # No buy price found, use estimated cost
                    estimated_cost = item.unit_price * 0.6 * item.quantity
                    total_estimated_cost += estimated_cost
            else:
                # Product not found, use estimated cost
                estimated_cost = item.unit_price * 0.6 * item.quantity
                total_estimated_cost += estimated_cost
    
    total_cost = total_actual_cost + total_estimated_cost
    profit = total_revenue - total_cost
    profit_margin = (profit / total_revenue * 100) if total_revenue > 0 else 0
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_revenue": total_revenue,
        "total_cost": total_cost,
        "actual_cost": total_actual_cost,
        "estimated_cost": total_estimated_cost,
        "profit": profit,
        "profit_margin": profit_margin,
        "cost_data_coverage": (items_with_cost_data / total_items * 100) if total_items > 0 else 0,
        "items_with_actual_cost": items_with_cost_data,
        "total_items_sold": total_items
    }

# Settings Routes
@api_router.get("/settings", response_model=BusinessSettings)
async def get_settings():
    settings = await db.settings.find_one({"id": "business_settings"})
    if not settings:
        default_settings = BusinessSettings()
        await db.settings.insert_one(prepare_for_mongo(default_settings.dict()))
        return default_settings
    return BusinessSettings(**settings)

@api_router.put("/settings", response_model=BusinessSettings)
async def update_settings(settings: BusinessSettings):
    settings.id = "business_settings"
    settings_dict = prepare_for_mongo(settings.dict())
    await db.settings.update_one(
        {"id": "business_settings"}, 
        {"$set": settings_dict}, 
        upsert=True
    )
    return settings

# Dashboard route
@api_router.get("/dashboard")
async def get_dashboard():
    # Get today's stats
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    daily_sales = await get_daily_sales(today)
    
    # Get low stock items
    low_stock = await get_low_stock_products()
    
    # Get recent orders
    recent_orders = await db.orders.find().sort("created_at", -1).limit(10).to_list(10)
    
    # Get order status counts
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    on_courier_orders = await db.orders.count_documents({"status": "on_courier"})
    delivered_orders = await db.orders.count_documents({"status": "delivered"})
    
    return {
        "daily_sales": daily_sales,
        "low_stock_count": len(low_stock),
        "low_stock_items": low_stock[:5],  # Show only first 5
        "recent_orders": [Order(**parse_from_mongo(order)) for order in recent_orders],
        "order_stats": {
            "total": total_orders,
            "pending": pending_orders,
            "on_courier": on_courier_orders,
            "delivered": delivered_orders
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()