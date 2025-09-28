from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    hire_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    orders = db.relationship('Order', backref='employee', lazy=True)

    def __repr__(self):
        return f"<Employee {self.name}>"

class InventoryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    quantity = db.Column(db.Float, nullable=False, default=0.0)
    unit = db.Column(db.String(20), nullable=False) # e.g., 'kg', 'liters', 'pcs'
    low_stock_threshold = db.Column(db.Float, nullable=False, default=10.0)

    def __repr__(self):
        return f"<InventoryItem {self.name}>"

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<MenuItem {self.name}>"

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False, default="In-house")
    order_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default='Pending') # Pending, Preparing, Ready, Served, Paid
    total_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Order {self.id}>"

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    
    menu_item = db.relationship('MenuItem')

    def __repr__(self):
        return f"<OrderItem Order:{self.order_id} Item:{self.menu_item.name}>"