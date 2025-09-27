from flask import Blueprint, jsonify, request
from app.models import Order, OrderItem, MenuItem, Table, TableStatus
from app import db

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['POST'])
def create_order():
    data = request.get_json()
    if not data or 'table_id' not in data or 'items' not in data:
        return jsonify({"error": "Missing data"}), 400

    table_id = data['table_id']
    items_data = data['items']

    table = Table.query.get(table_id)
    if not table:
        return jsonify({"error": "Table not found"}), 404
    
    if table.status == TableStatus.OCCUPIED:
        # This check prevents creating a new order on an already occupied table.
        # You might want to modify this logic later to *add* to an existing order.
        return jsonify({"error": "Table is already occupied"}), 400

    new_order = Order(table_id=table_id, status='In Progress') # Set to In Progress
    db.session.add(new_order)
    
    total_price = 0
    
    # Loop through the items sent from the frontend
    for item_data in items_data:
        menu_item = MenuItem.query.get(item_data['menu_item_id'])
        if not menu_item:
            db.session.rollback() # Important: cancel the transaction if an item is invalid
            return jsonify({"error": f"Menu item with id {item_data['menu_item_id']} not found"}), 404
        
        quantity = item_data['quantity']
        price_at_order = menu_item.price
        total_price += price_at_order * quantity
        
        order_item = OrderItem(
            order=new_order,
            menu_item_id=menu_item.id,
            quantity=quantity,
            price=price_at_order
        )
        db.session.add(order_item)

    new_order.total_price = total_price
    table.status = TableStatus.OCCUPIED
    
    db.session.commit()
    
    return jsonify({"message": "Order created successfully", "order_id": new_order.id}), 201