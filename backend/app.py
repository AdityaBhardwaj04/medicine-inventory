from datetime import datetime, timedelta
from bson import ObjectId
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import logging
import json

# JSONEncoder subclass to handle MongoDB ObjectId and datetime serialization
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

app = Flask(__name__)
app.json_encoder = JSONEncoder
CORS(app)
app.secret_key = 'your_secret_key'  # Change this to a random secret key

# MongoDB Atlas connection
uri = "mongodb+srv://abdaditya10github:vrWls3ksMWhy5Csl@medicine-stock.fa4ulu1.mongodb.net/?retryWrites=true&w=majority&appName=Medicine-Stock"

client = MongoClient(uri, server_api=ServerApi('1'), tls=True, tlsAllowInvalidCertificates=True)

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client['medicine_inventory']
users = db['users']
users.create_index('username', unique=True)

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
    medicines = data.get('medicines')
    total_discount = data.get('discount', 0)  # Overall discount in percentage
    amount_accepted = data.get('amountAccepted', 0)
    payment_mode = data.get('payment_mode', 'cash')  # Default payment mode is cash

    if not (patient_id and medicines):
        return jsonify({"error": "Missing required data: patient_id and medicines are required."}), 400

    bill_items = []
    total_amount = 0

    for item in medicines:
        medicine_name = item.get('medicine_name')
        qty_sold = item.get('qty_sold')

        if not (medicine_name and qty_sold):
            return jsonify({"error": "Missing required data in medicines: medicine_name and qty_sold are required."}), 400

        try:
            qty_sold = int(qty_sold)
        except ValueError:
            return jsonify({"error": f"Invalid quantity sold for {medicine_name}. It must be an integer."}), 400

        medicine = db['stock'].find_one({"product_name": medicine_name})
        if not medicine:
            return jsonify({"error": f"Medicine '{medicine_name}' not found in stock."}), 400
        if int(medicine.get('qty', 0)) < qty_sold:
            return jsonify({"error": f"Not enough stock for {medicine_name}"}), 400

        new_qty = int(medicine['qty']) - qty_sold
        db['stock'].update_one({"product_name": medicine_name}, {"$set": {"qty": new_qty}})

        amount = int(medicine['mrp']) * qty_sold
        bill_amount = amount - (int(total_discount)/100)*amount
        total_amount += bill_amount

        bill_items.append({
            "medicine_name": medicine_name,
            "qty_sold": qty_sold,
            "qty_remaining": new_qty,
            "mrp": int(medicine['mrp']),
            "bill_amount": bill_amount,
        })

    # Convert total_discount to a float to ensure arithmetic operation is valid
    try:
        total_discount = float(total_discount)
        amount_accepted = float(amount_accepted)
    except ValueError:
        return jsonify({"error": "Invalid discount. It must be a number."}), 400

    # Calculate the total discounted amount
    total_discounted_amount = total_amount - (total_amount * total_discount / 100)
    change = amount_accepted - total_discounted_amount

    # Generate a unique Bill Number
    last_bill = db['transactions'].find_one(sort=[("bill_number", -1)])
    if last_bill:
        last_bill_number = int(last_bill['bill_number'].split('-')[1])
        new_bill_number = f"BILL-{last_bill_number + 1}"
    else:
        new_bill_number = "BILL-1"

    transaction = {
        "bill_number": new_bill_number,
        "patient_id": patient_id,
        "medicines": bill_items,
        "total_amount": total_amount,
        "total_discounted_amount": total_discounted_amount,
        "amount_accepted": amount_accepted,
        "change": change,
        "payment_mode": payment_mode,  # Include payment mode in transaction document
        "transaction_time": datetime.utcnow()
    }
    db['transactions'].insert_one(transaction)

    return jsonify({
        "message": "Bill generated successfully!",
        "bill_number": new_bill_number,
        "total_amount": total_amount,
        "total_discounted_amount": total_discounted_amount,
        "amount_accepted": amount_accepted,
        "change": change,
        "bill_items": bill_items
    })


@app.route('/sales', methods=['GET'])
def sales():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not start_date or not end_date:
            return jsonify({"message": "Start date and end date are required"}), 400

        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)

        sales = list(db['transactions'].find({
            "transaction_time": {"$gte": start_date, "$lt": end_date}
        }, {'_id': 0}))

        total_cash = sum(float(sale['total_amount']) for sale in sales if sale.get('payment_mode') == 'cash')
        total_online = sum(float(sale['total_amount']) for sale in sales if sale.get('payment_mode') == 'online')
        total_earnings = total_cash + total_online

        amountInHand_cash = sum(float(sale['amount_accepted']) for sale in sales if sale.get('payment_mode') == 'cash')
        amountInHand_online = sum(float(sale['amount_accepted']) for sale in sales if sale.get('payment_mode') == 'online')

        response = {
            "sales": sales,
            "total_earnings": total_earnings,
            "amountInHand_cash": amountInHand_cash,
            "amountInHand_online": amountInHand_online
        }
        return jsonify(response)
    except Exception as e:
        app.logger.error(f"Error fetching sales data: {e}")
        return jsonify({"message": "An error occurred", "error": str(e)}), 500


@app.route('/medicines', methods=['GET'])
def get_medicines():
    try:
        medicines = db['stock'].distinct("product_name")
        return jsonify({"medicines": medicines})
    except Exception as e:
        app.logger.error(f"Error fetching medicines: {e}")
        return jsonify({"message": "An error occurred while fetching medicines", "error": str(e)}), 500


@app.route('/users', methods=['GET'])
def get_users():
    try:
        user_list = list(users.find({}, {'_id': 0}))  # Fetch all users from the 'users' collection
        return jsonify(users=user_list)
    except Exception as e:
        app.logger.error(f"Error fetching users: {e}")
        return jsonify({"error": "An error occurred while fetching users"}), 500


@app.route('/medicine_details', methods=['GET'])
def get_medicine_mrp():
    medicine_name = request.args.get('name')
    if not medicine_name:
        return jsonify({"error": "Medicine name is required"}), 400

    medicine = db['stock'].find_one({"product_name": medicine_name.upper()})
    if not medicine:
        return jsonify({"error": "Medicine not found"}), 404

    response = {
        "mrp": medicine.get("mrp"),
        "batch_no": medicine.get("batch"),
        "expiry_date": medicine.get("exp")
    }
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)

