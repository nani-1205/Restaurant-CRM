from . import db
from sqlalchemy.sql import func
import enum

class TableStatus(enum.Enum):
    AVAILABLE = "Available"
    RESERVED = "Reserved"
    OCCUPIED = "Occupied"

class OrderStatus(enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class Table(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.Integer, unique=True, nullable=False)
    capacity = db.Column(db.Integer, nullable=False, default=4)
    status = db.Column(db.Enum(TableStatus), nullable=False, default=TableStatus.AVAILABLE)
    
    def to_dict(self):
        return {
            "id": self.id,
            "table_number": self.table_number,
            "capacity": self.capacity,
            "status": self.status.value
        }

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    table_id = db.Column(db.Integer, db.ForeignKey('table.id'), nullable=False)
    status = db.Column(db.Enum(OrderStatus), nullable=False, default=OrderStatus.PENDING)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    total_price = db.Column(db.Float, default=0.0)
    
    table = db.relationship('Table', backref=db.backref('orders', lazy=True))
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade="all, delete-orphan")

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price = db.Column(db.Float, nullable=False) # Price at time of order

    menu_item = db.relationship('MenuItem')