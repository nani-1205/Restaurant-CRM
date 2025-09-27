from flask import Blueprint, jsonify, request
from app.models import Table, TableStatus
from app import db

tables_bp = Blueprint('tables', __name__)

@tables_bp.route('/', methods=['GET'])
def get_tables():
    tables = Table.query.order_by(Table.table_number).all()
    return jsonify([table.to_dict() for table in tables])

@tables_bp.route('/<int:table_id>/status', methods=['PUT'])
def update_table_status(table_id):
    table = Table.query.get_or_404(table_id)
    data = request.get_json()
    new_status_str = data.get('status')
    
    if not new_status_str or new_status_str not in [s.value for s in TableStatus]:
        return jsonify({"error": "Invalid status provided"}), 400
        
    table.status = TableStatus(new_status_str)
    db.session.commit()
    
    return jsonify(table.to_dict())