from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Association table for the many-to-many relationship between Order and Table
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

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<MenuItem {self.name}>"

class Table(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10), nullable=False, unique=True)
    status = db.Column(db.String(20), nullable=False, default='Available') # Available, Occupied, Reserved
    shape = db.Column(db.String(20), nullable=False, default='square') # square, rectangle, circle, oval
    
    # Grid positioning properties for the layout
    pos_x = db.Column(db.Integer, nullable=False) # Grid column start
    pos_y = db.Column(db.Integer, nullable=False) # Grid row start
    span_x = db.Column(db.Integer, default=1) # Grid column span
    span_y = db.Column(db.Integer, default=1) # Grid row span

    def __repr__(self):
        return f"<Table {self.name}>"

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False, default="In-house")
    order_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default='Pending') # Pending, Preparing, Ready, Served, Paid
    total_price = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    
    # Many-to-many relationship with Table
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