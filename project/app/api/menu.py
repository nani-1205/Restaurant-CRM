from flask import Blueprint, jsonify
from app.models import MenuItem

menu_bp = Blueprint('menu', __name__)

@menu_bp.route('/', methods=['GET'])
def get_menu_items():
    """Returns the entire menu."""
    items = MenuItem.query.order_by(MenuItem.category, MenuItem.name).all()
    return jsonify([item.to_dict() for item in items])