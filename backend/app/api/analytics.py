# backend/app/api/analytics.py
from flask import Blueprint, jsonify
from ..models import Order, Employee
from sqlalchemy import func
from .. import db

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/summary', methods=['GET'])
def get_summary():
    total_sales = db.session.query(func.sum(Order.total_price)).scalar() or 0
    total_orders = Order.query.count()
    employee_count = Employee.query.count()
    
    # Example performance data
    top_employees = Employee.query.order_by(Employee.performance_score.desc()).limit(5).all()
    top_employees_data = [{'name': e.name, 'score': e.performance_score} for e in top_employees]

    summary = {
        'totalSales': f"${total_sales:,.2f}",
        'totalOrders': total_orders,
        'employeeCount': employee_count,
        'avgOrderValue': f"${(total_sales / total_orders if total_orders > 0 else 0):,.2f}",
        'topPerformers': top_employees_data
    }
    return jsonify(summary)