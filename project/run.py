from app import create_app, db
from app.models import Table, MenuItem
from flask_migrate import upgrade

app = create_app()

@app.cli.command("init-db")
def init_db_command():
    """Initializes the database with some seed data."""
    upgrade() # Apply migrations
    
    # Check if tables are already seeded
    if Table.query.first() is None:
        print("Seeding tables...")
        for i in range(1, 21):
            db.session.add(Table(table_number=i, capacity=random.choice([2, 4, 6])))
    
    # Check if menu items are already seeded
    if MenuItem.query.first() is None:
        print("Seeding menu items...")
        menu_items = [
            MenuItem(name="Seabass", price=28.50, category="Main Course"),
            MenuItem(name="Classic Burger", price=15.00, category="Main Course"),
            MenuItem(name="Tomahawk Steak", price=75.00, category="Specials"),
            MenuItem(name="Caesar Salad", price=12.00, category="Appetizer"),
        ]
        db.session.add_all(menu_items)

    db.session.commit()
    print("Database initialized and seeded.")

if __name__ == '__main__':
    app.run(host='0.0.0.0')