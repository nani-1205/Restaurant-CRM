# backend/app/routes.py
from flask import Blueprint, render_template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def dashboard():
    return render_template('dashboard.html')

@main_bp.route('/employees')
def employees_page():
    return render_template('employees.html')

@main_bp.route('/orders')
def orders_page():
    return render_template('orders.html')

@main_bp.route('/inventory')
def inventory_page():
    return render_template('inventory.html')