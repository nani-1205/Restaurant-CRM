import json
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from config import Config
from models import db, User, Employee, InventoryItem, MenuItem, MenuCategory, Order, OrderItem, Table
from flask_migrate import Migrate
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from decimal import Decimal
from flask_login import LoginManager, login_user, logout_user, login_required, current_user

# --- App Initialization ---
app = Flask(__name__)
app.config.from_object(Config)

# --- Database & Login Manager Initialization ---
db.init_app(app)
migrate = Migrate(app, db) # Kept for potential future manual schema changes
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login' # Redirect to /login if user is not authenticated

# --- Automatic Database & Admin User Creation on Startup ---
with app.app_context():
    # This creates tables for all models if they don't exist.
    db.create_all()
    # Create a default admin user if one doesn't already exist.
    if not User.query.filter_by(username='admin').first():
        admin_user = User(username='admin', role='Admin')
        admin_user.set_password('admin123') # IMPORTANT: Change in a real production environment
        db.session.add(admin_user)
        db.session.commit()

@login_manager.user_loader
def load_user(user_id):
    """Flask-Login helper to load a user from the database by ID."""
    return User.query.get(int(user_id))

# --- Authentication Routes ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user and user.check_password(request.form['password']):
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Invalid username or password', 'danger')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# --- Main Application Routes ---
@app.route('/')
@login_required
def dashboard():
    # Data for Sales Chart (last 7 days)
    sales_over_time = db.session.query(
        cast(Order.order_time, Date).label('date'),
        func.sum(Order.total_price).label('total_sales')
    ).filter(Order.status == 'Paid', Order.order_time >= datetime.utcnow() - timedelta(days=7)) \
     .group_by('date').order_by('date').all()
    labels = [s.date.strftime('%b %d') for s in sales_over_time]
    data = [float(s.total_sales) for s in sales_over_time]
    
    # Data for Top Selling Items Chart
    top_items = db.session.query(
        MenuItem.name,
        func.sum(OrderItem.quantity).label('total_quantity')
    ).join(OrderItem).group_by(MenuItem.name).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()
    item_labels = [item.name for item in top_items]
    item_data = [int(item.total_quantity) for item in top_items]

    # Data for Stat Cards
    total_sales = db.session.query(func.sum(Order.total_price)).filter(Order.status == 'Paid').scalar() or 0.0
    total_orders = Order.query.count()
    
    return render_template('dashboard.html', 
                           total_sales=total_sales, total_orders=total_orders,
                           labels=json.dumps(labels), data=json.dumps(data),
                           item_labels=json.dumps(item_labels), item_data=json.dumps(item_data))

@app.route('/pos')
@login_required
def pos():
    """Renders the main Point-of-Sale interface."""
    tables = Table.query.order_by(Table.name).all()
    employees = Employee.query.all()
    return render_template('pos.html', tables=tables, employees=employees)

# --- API Endpoints for the POS Interface ---
@app.route('/api/menu')
@login_required
def api_menu():
    """Provides the entire menu, structured by category, as JSON for the POS JavaScript."""
    categories = MenuCategory.query.order_by(MenuCategory.name).all()
    menu_data = []
    for category in categories:
        cat_dict = {'id': category.id, 'name': category.name, 'items': []}
        for item in category.items:
            cat_dict['items'].append({'id': item.id, 'name': item.name, 'price': float(item.price), 'image_file': url_for('static', filename='images/' + item.image_file)})
        menu_data.append(cat_dict)
    return jsonify(menu_data)

@app.route('/api/create-order', methods=['POST'])
@login_required
def api_create_order():
    """Receives order data from the POS JavaScript, validates it, and saves it to the database."""
    data = request.get_json()
    if not all(k in data for k in ['table_ids', 'employee_id', 'items']):
        return jsonify({'error': 'Missing required order data'}), 400
    try:
        selected_tables = Table.query.filter(Table.id.in_(data['table_ids'])).all()
        for table in selected_tables:
            if table.status != 'Available':
                return jsonify({'error': f'Table {table.name} is not available'}), 409
        
        new_order = Order(employee_id=data['employee_id'], customer_name=f"Table(s): {', '.join([t.name for t in selected_tables])}")
        
        for table in selected_tables:
            new_order.tables.append(table)
            table.status = 'Occupied'
        
        db.session.add(new_order)
        db.session.flush()

        total_price = Decimal('0.0')
        for item_data in data['items']:
            menu_item = MenuItem.query.get(item_data['id'])
            quantity = int(item_data['quantity'])
            total_price += menu_item.price * quantity
            order_item = OrderItem(order_id=new_order.id, menu_item_id=menu_item.id, quantity=quantity)
            db.session.add(order_item)
            
        new_order.total_price = total_price
        db.session.commit()
        return jsonify({'success': True, 'order_id': new_order.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# --- Management Routes ---
@app.route('/order-list')
@login_required
def order_list():
    orders = Order.query.order_by(Order.order_time.desc()).all()
    return render_template('order_list.html', orders=orders)

@app.route('/orders/update_status/<int:order_id>', methods=['POST'])
@login_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.form['status']
    if new_status:
        # If order is paid or cancelled, free up the associated tables
        if new_status in ['Paid', 'Cancelled']:
            for table in order.tables:
                table.status = 'Available'
        order.status = new_status
        db.session.commit()
        flash(f'Order #{order.id} status updated to {new_status}.', 'info')
    return redirect(url_for('order_list'))

@app.route('/tables', methods=['GET', 'POST'])
@login_required
def manage_tables():
    if request.method == 'POST':
        name, shape = request.form.get('name'), request.form.get('shape')
        pos_x, pos_y = request.form.get('pos_x'), request.form.get('pos_y')
        if all([name, shape, pos_x, pos_y]):
            new_table = Table(name=name, shape=shape, pos_x=int(pos_x), pos_y=int(pos_y), 
                              span_x=int(request.form.get('span_x', 1)), 
                              span_y=int(request.form.get('span_y', 1)))
            db.session.add(new_table)
            db.session.commit()
            flash(f"Table '{name}' was added successfully.", 'success')
        else:
            flash('All fields are required to add a table.', 'danger')
        return redirect(url_for('manage_tables'))
    tables = Table.query.order_by(Table.id).all()
    return render_template('tables.html', tables=tables)

@app.route('/tables/delete/<int:table_id>', methods=['POST'])
@login_required
def delete_table(table_id):
    table = Table.query.get_or_404(table_id)
    if table.status != 'Available':
        flash(f"Cannot delete table {table.name} because it is currently occupied.", 'danger')
    else:
        db.session.delete(table)
        db.session.commit()
        flash(f'Table {table.name} was deleted.', 'success')
    return redirect(url_for('manage_tables'))

@app.route('/employees', methods=['GET', 'POST'])
@login_required
def manage_employees():
    if request.method == 'POST':
        name, role = request.form.get('name'), request.form.get('role')
        if name and role:
            db.session.add(Employee(name=name, role=role))
            db.session.commit()
            flash('Employee added successfully.', 'success')
        else:
            flash('Name and role are required.', 'danger')
        return redirect(url_for('manage_employees'))
    employees = Employee.query.all()
    return render_template('employees.html', employees=employees)

@app.route('/inventory', methods=['GET', 'POST'])
@login_required
def manage_inventory():
    if request.method == 'POST':
        name, quantity = request.form.get('name'), request.form.get('quantity')
        unit, low_stock = request.form.get('unit'), request.form.get('low_stock_threshold')
        if all([name, quantity, unit, low_stock]):
            db.session.add(InventoryItem(name=name, quantity=float(quantity), unit=unit, low_stock_threshold=float(low_stock)))
            db.session.commit()
            flash('Inventory item added.', 'success')
        else:
            flash('All fields are required.', 'danger')
        return redirect(url_for('manage_inventory'))
    inventory = InventoryItem.query.all()
    return render_template('inventory.html', inventory=inventory)

@app.route('/menu', methods=['GET', 'POST'])
@login_required
def manage_menu():
    if request.method == 'POST':
        name, price, category_id = request.form.get('name'), request.form.get('price'), request.form.get('category_id')
        if all([name, price, category_id]):
            db.session.add(MenuItem(name=name, price=Decimal(price), category_id=int(category_id)))
            db.session.commit()
            flash('Menu item added successfully.', 'success')
        else:
            flash('Name, price, and category are required.', 'danger')
        return redirect(url_for('manage_menu'))
    menu_items = MenuItem.query.all()
    categories = MenuCategory.query.all()
    return render_template('menu.html', menu_items=menu_items, categories=categories)

@app.route('/menu/category', methods=['POST'])
@login_required
def add_menu_category():
    name = request.form.get('category_name')
    if name:
        db.session.add(MenuCategory(name=name))
        db.session.commit()
        flash('Menu category added successfully.', 'success')
    else:
        flash('Category name cannot be empty.', 'danger')
    return redirect(url_for('manage_menu'))

@app.route('/reports')
@login_required
def reports():
    employee_performance = db.session.query(
        Employee.name, 
        func.count(Order.id).label('total_orders'), 
        func.sum(Order.total_price).label('total_sales')
    ).join(Order, Employee.id == Order.employee_id).group_by(Employee.name).order_by(func.sum(Order.total_price).desc()).all()
    return render_template('reports.html', employee_performance=employee_performance)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')