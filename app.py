import json
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from config import Config
from models import db, User, Employee, InventoryItem, MenuItem, MenuCategory, Order, OrderItem, Table
from flask_migrate import Migrate
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from decimal import Decimal
from flask_login import LoginManager, login_user, logout_user, login_required, current_user

# App Initialization
app = Flask(__name__)
app.config.from_object(Config)

# Database & Login Manager Initialization
db.init_app(app)
migrate = Migrate(app, db)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # Redirect to /login if user is not authenticated

@login_manager.user_loader
def load_user(user_id):
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
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
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

# --- Interactive POS Route ---
@app.route('/pos')
@login_required
def pos():
    tables = Table.query.order_by(Table.name).all()
    employees = Employee.query.all()
    return render_template('pos.html', tables=tables, employees=employees)

# --- API Endpoints for POS ---
@app.route('/api/menu')
@login_required
def api_menu():
    categories = MenuCategory.query.order_by(MenuCategory.name).all()
    menu_data = []
    for category in categories:
        cat_dict = {'id': category.id, 'name': category.name, 'items': []}
        for item in category.items:
            cat_dict['items'].append({
                'id': item.id,
                'name': item.name,
                'price': float(item.price),
                'image_file': url_for('static', filename='images/' + item.image_file)
            })
        menu_data.append(cat_dict)
    return jsonify(menu_data)

@app.route('/api/create-order', methods=['POST'])
@login_required
def api_create_order():
    data = request.get_json()
    if not all(k in data for k in ['table_ids', 'employee_id', 'items']):
        return jsonify({'error': 'Missing required order data'}), 400

    table_ids = data.get('table_ids')
    items = data.get('items')
    
    if not table_ids or not items:
        return jsonify({'error': 'Order must include tables and items'}), 400

    try:
        selected_tables = Table.query.filter(Table.id.in_(table_ids)).all()
        for table in selected_tables:
            if table.status != 'Available':
                return jsonify({'error': f'Table {table.name} is not available'}), 409
        
        table_names = ', '.join([t.name for t in selected_tables])
        new_order = Order(
            employee_id=data['employee_id'],
            customer_name=f"Table(s): {table_names}"
        )

        for table in selected_tables:
            new_order.tables.append(table)
            table.status = 'Occupied'

        db.session.add(new_order)
        db.session.flush()

        total_price = Decimal('0.0')
        for item_data in items:
            menu_item = MenuItem.query.get(item_data['id'])
            if not menu_item:
                raise ValueError(f"Menu item with id {item_data['id']} not found")
            
            quantity = int(item_data['quantity'])
            total_price += menu_item.price * quantity
            
            order_item = OrderItem(
                order_id=new_order.id,
                menu_item_id=menu_item.id,
                quantity=quantity
            )
            db.session.add(order_item)
            
        new_order.total_price = total_price
        db.session.commit()
        
        return jsonify({'success': True, 'order_id': new_order.id, 'message': 'Order created successfully!'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# --- Management Routes (All protected) ---

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
        # (Add your logic for adding a table here)
        flash('Table added successfully!', 'success')
        return redirect(url_for('manage_tables'))
    tables = Table.query.order_by(Table.id).all()
    return render_template('tables.html', tables=tables)

@app.route('/tables/delete/<int:table_id>', methods=['POST'])
@login_required
def delete_table(table_id):
    # (Add your logic for deleting a table here)
    flash(f'Table deleted successfully.', 'success')
    return redirect(url_for('manage_tables'))

# Add the remaining management routes here, each with the @login_required decorator
@app.route('/employees', methods=['GET', 'POST'])
@login_required
def manage_employees():
    # (Your previous code for managing employees)
    pass

@app.route('/inventory', methods=['GET', 'POST'])
@login_required
def manage_inventory():
    # (Your previous code for managing inventory)
    pass

@app.route('/menu', methods=['GET', 'POST'])
@login_required
def manage_menu():
    # (Your previous code for managing menu items and categories)
    pass

@app.route('/reports')
@login_required
def reports():
    # (Your previous code for reports)
    pass

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')