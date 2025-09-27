# backend/app/api/orders.py
from flask import Blueprint, request, jsonify
from ..models import Order, OrderItem, MenuItem
from .. import db

orders_bp = Blueprint('orders', __name__)

# Get all orders
@orders_bp.route('/', methods=['GET'])
def get_orders():
    orders = Order.query.order_by(Order.timestamp.desc()).all()
    return jsonify([{
        'id': order.id,
        'timestamp': order.timestamp.isoformat(),
        'status': order.status,
        'total_price': order.total_price,
        'employee_id': order.employee_id
    } for order in orders])

# Get a single order with details
@orders_bp.route('/<int:id>', methods=['GET'])
def get_order_details(id):
    order = Order.query.get_or_404(id)
    order_items = [{
        'menu_item': item.menu_item.name,
        'quantity': item.quantity,
        'price': item.menu_item.price
    } for item in order.order_items]
    
    return jsonify({
        'id': order.id,
        'status': order.status,
        'total_price': order.total_price,
        'items': order_items
    })

# Update order status
@orders_bp.route('/<int:id>/status', methods=['PUT'])
def update_order_status(id):
    order = Order.query.get_or_404(id)
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
        
    order.status = data['status']
    db.session.commit()
    return jsonify({'message': f'Order {id} status updated to {order.status}'})

# Note: A POST endpoint to create an order would be more complex.
# It would need to receive employee_id and a list of menu_item_ids and quantities,
# then calculate the total price and create Order and OrderItem entries.