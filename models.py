from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    """User model for authentication."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    
    # FIX: Increased length from 128 to 256 to accommodate modern password hashes.
    password_hash = db.Column(db.String(256), nullable=False)
    
    role = db.Column(db.String(80), nullable=False, default='Cashier') # e.g., Admin, Cashier

    def set_password(self, password):
        """Hashes and sets the user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if the provided password matches the hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

# Association table for Order and Table many-to-many relationship
order_tables = db.Table('order_tables',
    db.Column('order_id', db.Integer, db.ForeignKey('order.id'), primary_key=True),
    db.Column('table_id', db.Integer, db.ForeignKey('table.id'), primary_key=True)
)

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
    unit = db.Column(db.String(20), nullable=False)
    low_stock_threshold = db.Column(db.Float, nullable=False, default=10.0)

    def __repr__(self):
        return f"<InventoryItem {self.name}>"

class MenuCategory(db.Model):
    """Model for categorizing menu items (e.g., Appetizers, Drinks)."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    items = db.relationship('MenuItem', backref='category', lazy=True)
    
    def __repr__(self):
        return f"<MenuCategory {self.name}>"

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_file = db.Column(db.String(100), nullable=True, default='default.jpg')
    category_id = db.Column(db.Integer, db.ForeignKey('menu_category.id'), nullable=False)

    def __repr__(self):
        return f"<MenuItem {self.name}>"

class Table(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10), nullable=False, unique=True)
    status = db.Column(db.String(20), nullable=False, default='Available')
    shape = db.Column(db.String(20), nullable=False, default='square')
    pos_x = db.Column(db.Integer, nullable=False)
    pos_y = db.Column(db.Integer, nullable=False)
    span_x = db.Column(db.Integer, default=1)
    span_y = db.Column(db.Integer, default=1)

    def __repr__(self):
        return f"<Table {self.name}>"

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False, default="In-house")
    order_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default='Pending')
    total_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    tables = db.relationship('Table', secondary=order_tables, lazy='subquery',
                             backref=db.backref('orders', lazy=True))

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