
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path
from datetime import datetime, timezone
import time

app = Flask(__name__)

# Local development configuration
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Store the database inside the backend folder
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "cloudcart.db"

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH.as_posix()}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# Database tables
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image = db.Column(db.String(50), nullable=False)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(30), unique=True, nullable=False)
    status = db.Column(db.String(30), default="PENDING", nullable=False)
    total = db.Column(db.Float, nullable=False)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    items = db.relationship(
        "OrderItem",
        backref="order",
        cascade="all, delete-orphan"
    )


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(
        db.Integer,
        db.ForeignKey("order.id"),
        nullable=False
    )
    product_id = db.Column(
        db.Integer,
        db.ForeignKey("product.id"),
        nullable=False
    )
    product_name = db.Column(db.String(100), nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)


# Initial product catalog
INITIAL_PRODUCTS = [
    {"id": 1, "name": "Wireless Headphones", "price": 1499.00, "image": "headphones"},
    {"id": 2, "name": "Smart Watch", "price": 2499.00, "image": "watch"},
    {"id": 3, "name": "Running Shoes", "price": 1999.00, "image": "shoes"},
    {"id": 4, "name": "Backpack", "price": 999.00, "image": "backpack"},
]


def initialize_database():
    with app.app_context():
        db.create_all()

        # Add sample products only when the catalog is empty
        if Product.query.count() == 0:
            for item in INITIAL_PRODUCTS:
                db.session.add(Product(**item))
            db.session.commit()


@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to CloudCart API!",
        "status": "running"
    })


@app.route("/health")
def health():
    return jsonify({"status": "healthy"})


@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.order_by(Product.id).all()

    return jsonify([
        {
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "image": product.image
        }
        for product in products
    ])


@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not isinstance(data.get("items"), list) or not data["items"]:
        return jsonify({"error": "Your cart is empty"}), 400

    # Validate requested items and calculate prices on the server
    order_lines = []
    total = 0.0

    for item in data["items"]:
        if not isinstance(item, dict):
            return jsonify({"error": "Invalid order item"}), 400

        product_id = item.get("product_id")
        quantity = item.get("quantity")

        # Reject booleans, non-integers and unreasonable quantities
        if (
            type(product_id) is not int
            or type(quantity) is not int
            or quantity < 1
            or quantity > 100
        ):
            return jsonify({"error": "Invalid product or quantity"}), 400

        product = db.session.get(Product, product_id)

        if product is None:
            return jsonify({"error": f"Product {product_id} not found"}), 400

        line_total = round(product.price * quantity, 2)
        total = round(total + line_total, 2)

        order_lines.append({
            "product": product,
            "quantity": quantity
        })

    order_number = "CC" + str(time.time_ns())[-8:]

    try:
        order = Order(
            order_number=order_number,
            status="PENDING",
            total=total
        )
        db.session.add(order)
        db.session.flush()

        for line in order_lines:
            product = line["product"]

            db.session.add(OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                unit_price=product.price,
                quantity=line["quantity"]
            ))

        db.session.commit()

    except Exception:
        db.session.rollback()
        app.logger.exception("Could not save order")
        return jsonify({"error": "Could not save your order"}), 500

    return jsonify({
        "message": "Order saved successfully!",
        "order_id": order.order_number,
        "total": order.total,
        "status": order.status
    }), 201


@app.route("/api/orders", methods=["GET"])
def get_orders():
    orders = Order.query.order_by(Order.id.desc()).all()

    return jsonify([
        {
            "order_id": order.order_number,
            "status": order.status,
            "total": order.total,
            "created_at": order.created_at.isoformat(),
            "items": [
                {
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "unit_price": item.unit_price,
                    "quantity": item.quantity
                }
                for item in order.items
            ]
        }
        for order in orders
    ])


# Create tables and insert initial products before starting Flask
initialize_database()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
