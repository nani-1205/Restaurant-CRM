# backend/app/api/inventory.py
from flask import Blueprint, request, jsonify
from ..models import InventoryItem
from .. import db

inventory_bp = Blueprint('inventory', __name__)

# Get all inventory items
@inventory_bp.route('/', methods=['GET'])
def get_inventory():
    items = InventoryItem.query.all()
    return jsonify([{
        'id': item.id,
        'name': item.name,
        'quantity': item.quantity,
        'unit': item.unit,
        'low_stock_threshold': item.low_stock_threshold
    } for item in items])

# Add a new inventory item
@inventory_bp.route('/', methods=['POST'])
def add_inventory_item():
    data = request.get_json()
    if not all(k in data for k in ['name', 'quantity', 'unit']):
        return jsonify({'error': 'Missing data'}), 400

    new_item = InventoryItem(
        name=data['name'],
        quantity=float(data['quantity']),
        unit=data['unit'],
        low_stock_threshold=float(data.get('low_stock_threshold', 10.0))
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'id': new_item.id, 'name': new_item.name}), 201

# Update inventory item (e.g., adjust stock)
@inventory_bp.route('/<int:id>', methods=['PUT'])
def update_inventory_item(id):
    item = InventoryItem.query.get_or_404(id)
    data = request.get_json()
    
    item.quantity = float(data.get('quantity', item.quantity))
    item.name = data.get('name', item.name)
    item.unit = data.get('unit', item.unit)
    
    db.session.commit()
    return jsonify({'message': 'Inventory item updated'})