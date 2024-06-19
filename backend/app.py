from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import logging

app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017')
db = client['medicine_inventory']  # Define the database
logging.basicConfig(level=logging.DEBUG)


@app.route('/', methods=['GET', 'POST'])
def home():
    return jsonify("Welcome to MedAPI")


@app.route('/stock', methods=['GET', 'POST'])
def stock():
    if request.method == 'GET':
        stockcomplete = list(db['stock'].find({}, {'_id': 0}))
        return jsonify(stockcomplete)
    elif request.method == 'POST':
        data = request.json
        db['stock'].insert_one(data)
        return jsonify({"message": "Stock added successfully!"})


@app.route('/billing', methods=['POST'])
def billing():
    data = request.json
    patient_id = data.get('patient_id')
    cart = data.get('cart')

    if not (patient_id and cart):
        return jsonify({"message": "Missing required data in the request: patient_id and cart are required."}), 400

    try:
        # Iterate over each item in the cart
        for item in cart:
            medicine_name = item.get('medicine_name')
            qty_sold = item.get('qty_sold')

            if not (medicine_name and qty_sold):
                return jsonify({"message": "Each item in the cart must have medicine_name and qty_sold."}), 400

            try:
                qty_sold = int(qty_sold)
            except ValueError:
                return jsonify({"message": "Invalid quantity sold. It must be an integer."}), 400

            medicine = db['stock'].find_one({"product_name": medicine_name})
            if not medicine:
                return jsonify({"message": f"Medicine '{medicine_name}' not found in stock."}), 400
            if int(medicine.get('qty', 0)) < qty_sold:
                return jsonify({"message": f"Insufficient stock for {medicine_name}"}), 400

            new_qty = int(medicine['qty']) - qty_sold
            db['stock'].update_one({"product_name": medicine_name}, {"$set": {"qty": new_qty}})

            transaction = {
                "patient_id": patient_id,
                "medicine_name": medicine_name,
                "qty_sold": qty_sold,
                "qty_remaining": new_qty,
                "mrp": int(medicine['mrp']),
                "bill_amount": int(medicine['mrp']) * qty_sold,
                "transaction_time": datetime.utcnow()
            }
            db['transactions'].insert_one(transaction)

        return jsonify({"message": "Cart items billed successfully!"})
    except Exception as e:
        app.logger.error(f"Error billing cart items: {e}")
        return jsonify({"message": "An error occurred while billing cart items", "error": str(e)}), 500


@app.route('/sales', methods=['GET'])
def sales():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not start_date or not end_date:
            return jsonify({"message": "Start date and end date are required"}), 400

        # Parse the dates
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)

        # Fetch sales data from the database
        sales = list(db['transactions'].find({
            "transaction_time": {"$gte": start_date, "$lt": end_date}
        }, {'_id': 0}))

        # Ensure bill_amount is numeric before summing
        total_earnings = sum(float(sale['bill_amount']) for sale in sales)

        return jsonify({"sales": sales, "total_earnings": total_earnings})
    except Exception as e:
        app.logger.error(f"Error fetching sales data: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/medicines', methods=['GET'])
def medicines():
    try:
        medicines_list = list(db['stock'].find({}, {'_id': 0, 'product_name': 1, 'qty': 1, 'mrp': 1}))
        return jsonify({"medicines": medicines_list})
    except Exception as e:
        app.logger.error(f"Error fetching medicines: {e}")
        return jsonify({"message": "An error occurred while fetching medicines", "error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
