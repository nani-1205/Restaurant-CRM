from flask import Flask, render_template, request, redirect, url_for, flash
from config import Config
from models import db, Employee, InventoryItem, MenuItem, Order, OrderItem, Table
from flask_migrate import Migrate
from sqlalchemy import func
from decimal import Decimal

# App Initialization
app = Flask(__name__)
app.config.from_object(Config)

# Database Initialization
db.init_app(app)
migrate = Migrate(app, db)

# Helper function (no changes)
def calculate_order_total(order_id):
    order_items = OrderItem.query.filter_by(order_id=order_id).all()
    total = sum(item.menu_item.price * item.quantity for item in order_items)
    return total

# --- Routes ---

@app.route('/')
def dashboard():
    # ... (no changes to this route)
    total_sales = db.session.query(func.sum(Order.total_price)).filter(Order.status == 'Paid').scalar() or 0.0
    total_orders = Order.query.count()
    employee_count = Employee.query.count()
    low_stock_items = InventoryItem.query.filter(InventoryItem.quantity <= InventoryItem.low_stock_threshold).all()
    recent_orders = Order.query.order_by(Order.order_time.desc()).limit(5).all()
    return render_template('dashboard.html', total_sales=total_sales, total_orders=total_orders, employee_count=employee_count, low_stock_items=low_stock_items, recent_orders=recent_orders)

# --- NEW: Add Order Visual Layout Route ---
@app.route('/add-order')
def add_order_layout():
    tables = Table.query.order_by(Table.name).all()
    return render_template('add_order.html', tables=tables)

# --- NEW: Table Management Route ---
@app.route('/tables', methods=['GET', 'POST'])
def manage_tables():
    if request.method == 'POST':
        name = request.form['name']
        shape = request.form['shape']
        pos_x = request.form['pos_x']
        pos_y = request.form['pos_y']
        span_x = request.form.get('span_x', 1)
        span_y = request.form.get('span_y', 1)

        if not all([name, shape, pos_x, pos_y]):
            flash('Name, Shape, X Position, and Y Position are required.', 'danger')
        else:
            new_table = Table(
                name=name,
                shape=shape,
                pos_x=int(pos_x),
                pos_y=int(pos_y),
                span_x=int(span_x) if span_x else 1,
                span_y=int(span_y) if span_y else 1
            )
            db.session.add(new_table)
            db.session.commit()
            flash(f'Table {name} added successfully!', 'success')
        return redirect(url_for('manage_tables'))
    
    tables = Table.query.order_by(Table.id).all()
    return render_template('tables.html', tables=tables)


# --- UPDATED: The old /orders is now /order-list ---
@app.route('/order-list')
def order_list():
    orders = Order.query.order_by(Order.order_time.desc()).all()
    return render_template('order_list.html', orders=orders)


# --- UPDATED: Combined order creation logic ---
@app.route('/create-order', methods=['GET', 'POST'])
def create_order():
    if request.method == 'POST':
        employee_id = request.form.get('employee_id')
        table_ids_str = request.form.get('table_ids', '')
        table_ids = [int(tid) for tid in table_ids_str.split(',') if tid]
        
        menu_item_ids = request.form.getlist('menu_item_id[]')
        quantities = request.form.getlist('quantity[]')
        
        if not employee_id or not table_ids or not any(q.isdigit() and int(q) > 0 for q in quantities):
            flash('Employee, at least one table, and at least one menu item are required.', 'danger')
            return redirect(url_for('add_order_layout'))

        # Create order and link tables
        new_order = Order(employee_id=employee_id, customer_name=f"Table(s): {', '.join(t.name for t in Table.query.filter(Table.id.in_(table_ids)).all())}")
        
        selected_tables = Table.query.filter(Table.id.in_(table_ids)).all()
        for table in selected_tables:
            if table.status != 'Available':
                flash(f"Error: Table {table.name} is not available!", 'danger')
                return redirect(url_for('add_order_layout'))
            new_order.tables.append(table)
            table.status = 'Occupied'
        
        db.session.add(new_order)
        db.session.flush()

        total_price = 0
        for item_id, qty_str in zip(menu_item_ids, quantities):
            if qty_str.isdigit() and int(qty_str) > 0:
                quantity = int(qty_str)
                menu_item = MenuItem.query.get(item_id)
                if menu_item:
                    order_item = OrderItem(order_id=new_order.id, menu_item_id=item_id, quantity=quantity)
                    db.session.add(order_item)
                    total_price += menu_item.price * quantity
        
        new_order.total_price = total_price
        db.session.commit()
        
        flash('Order created successfully!', 'success')
        return redirect(url_for('order_list'))

    # GET request part
    table_ids_str = request.args.get('tables', '')
    if not table_ids_str:
        flash('Please select one or more tables from the layout first.', 'warning')
        return redirect(url_for('add_order_layout'))
        
    table_ids = [int(tid) for tid in table_ids_str.split(',')]
    tables = Table.query.filter(Table.id.in_(table_ids)).all()
    employees = Employee.query.all()
    menu_items = MenuItem.query.all()
    
    return render_template('create_order.html', 
                            tables=tables, 
                            table_ids_str=table_ids_str,
                            employees=employees,
                            menu_items=menu_items)


@app.route('/orders/update_status/<int:order_id>', methods=['POST'])
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.form['status']
    if new_status:
        # --- LOGIC TO FREE UP TABLES ---
        if new_status in ['Paid', 'Cancelled']:
            for table in order.tables:
                table.status = 'Available'
        
        order.status = new_status
        db.session.commit()
        flash(f'Order #{order.id} status updated to {new_status}.', 'info')
    return redirect(url_for('order_list'))


# --- Other routes (employees, inventory, menu, reports) remain unchanged ---
# ...
@app.route('/employees', methods=['GET', 'POST'])
def manage_employees():
    if request.method == 'POST':
        name = request.form['name']
        role = request.form['role']
        if name and role:
            new_employee = Employee(name=name, role=role)
            db.session.add(new_employee)
            db.session.commit()
            flash('Employee added successfully!', 'success')
        else:
            flash('Name and role are required.', 'danger')
        return redirect(url_for('manage_employees'))
        
    employees = Employee.query.all()
    return render_template('employees.html', employees=employees)

@app.route('/inventory', methods=['GET', 'POST'])
def manage_inventory():
    if request.method == 'POST':
        name = request.form['name']
        quantity = request.form['quantity']
        unit = request.form['unit']
        low_stock_threshold = request.form['low_stock_threshold']

        if not all([name, quantity, unit, low_stock_threshold]):
            flash('All fields are required.', 'danger')
        else:
            new_item = InventoryItem(name=name, quantity=float(quantity), unit=unit, low_stock_threshold=float(low_stock_threshold))
            db.session.add(new_item)
            db.session.commit()
            flash('Inventory item added successfully!', 'success')
        return redirect(url_for('manage_inventory'))
        
    inventory = InventoryItem.query.all()
    return render_template('inventory.html', inventory=inventory)

@app.route('/menu', methods=['GET', 'POST'])
def manage_menu():
    if request.method == 'POST':
        name = request.form['name']
        price = request.form['price']
        description = request.form['description']
        if name and price:
            new_menu_item = MenuItem(name=name, price=Decimal(price), description=description)
            db.session.add(new_menu_item)
            db.session.commit()
            flash('Menu item added successfully!', 'success')
        else:
            flash('Name and Price are required.', 'danger')
        return redirect(url_for('manage_menu'))
        
    menu_items = MenuItem.query.all()
    return render_template('menu.html', menu_items=menu_items)

@app.route('/reports')
def reports():
    # Employee Performance Report
    employee_performance = db.session.query(
        Employee.name,
        func.count(Order.id).label('total_orders'),
        func.sum(Order.total_price).label('total_sales')
    ).join(Order, Employee.id == Order.employee_id).group_by(Employee.name).order_by(func.sum(Order.total_price).desc()).all()

    return render_template('reports.html', employee_performance=employee_performance)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')