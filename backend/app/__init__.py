# backend/app/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(dotenv_path='../../.env') # Load .env from root

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__, static_folder='../../frontend/static', template_folder='../../frontend/templates')
    
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app) # Allow requests from any origin

    db.init_app(app)
    migrate.init_app(app, db)

    from .api.employees import employees_bp
    from .api.orders import orders_bp
    from .api.inventory import inventory_bp
    from .api.analytics import analytics_bp
    
    app.register_blueprint(employees_bp, url_prefix='/api/employees')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    # This part is for serving the frontend pages
    from . import routes
    app.register_blueprint(routes.main_bp)

    return app