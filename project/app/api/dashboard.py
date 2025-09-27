from flask import Blueprint, jsonify
import random
import json
from app import redis_client

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
def get_summary():
    # Try to get data from Redis cache first
    cached_data = redis_client.get('dashboard_summary')
    if cached_data:
        return jsonify(json.loads(cached_data))

    # If not in cache, generate mock data
    data = {
        "summary_stats": {
            "sales": { "value": random.randint(5000, 8000), "change": round(random.uniform(-5, 15), 2) },
            "covers": { "value": random.randint(400, 600), "change": round(random.uniform(-2, 5), 2) },
            "avg_check": { "value": random.randint(60, 95), "change": round(random.uniform(-1, 3), 2) },
        },
        "biggest_food_item_sales": [
            {"name": "Seabass", "value": random.randint(700, 800)},
            {"name": "Burger", "value": random.randint(1000, 1400)},
            {"name": "Tomahawk", "value": random.randint(100, 200)},
            {"name": "Spartacus", "value": random.randint(1600, 1700)},
            {"name": "Viper", "value": random.randint(2000, 2300)},
        ],
        "actual_vs_planned_profit": {
            "labels": ["10 am", "11 am", "12 pm", "1 pm", "2 pm", "3 pm", "4 pm"],
            "actual": [random.randint(1000, 1500) for _ in range(7)],
            "planned": [random.randint(1200, 1600) for _ in range(7)]
        }
    }
    
    # Cache the result in Redis for 60 seconds
    redis_client.set('dashboard_summary', json.dumps(data), ex=60)

    return jsonify(data)