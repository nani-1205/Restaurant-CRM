from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import redis
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
redis_client = None

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    
    global redis_client
    redis_client = redis.StrictRedis(host=app.config['REDIS_HOST'], port=app.config['REDIS_PORT'], db=0, decode_responses=True)

    # Register Blueprints
    from .api.tables import tables_bp
    from .api.orders import orders_bp
    from .api.dashboard import dashboard_bp
    
    app.register_blueprint(tables_bp, url_prefix='/api/tables')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # Main Routes for Frontend
    @app.route('/')
    def index():
        return render_template('dashboard.html', title='Dashboard')
        
    @app.route('/tables')
    def tables_page():
        return render_template('tables.html', title='Table Management')

    # Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('404.html'), 404

    return app