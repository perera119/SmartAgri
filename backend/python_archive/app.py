from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "smart_agri_db")

db_connected = False
sensor_collection = None
alert_collection = None

try:
    client = MongoClient(
        MONGO_URI,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000
    )
    # Check if connection is successful
    client.admin.command('ismaster')
    db = client[DB_NAME]
    sensor_collection = db["sensor_readings"]
    alert_collection = db["alerts"]
    users_collection = db["users"]
    db_connected = True
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    print("Running in Mock Data mode.")

from werkzeug.security import generate_password_hash, check_password_hash

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    role = data.get("role", "User")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if db_connected:
        try:
            if users_collection.find_one({"email": email}):
                return jsonify({"error": "Email already exists"}), 409
            
            hashed_password = generate_password_hash(password)
            user_doc = {
                "email": email,
                "password": hashed_password,
                "firstName": first_name,
                "lastName": last_name,
                "role": role,
                "createdAt": datetime.now().isoformat()
            }
            users_collection.insert_one(user_doc)
            return jsonify({"message": "User registered successfully"}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # Mock registration if DB is offline
    return jsonify({"message": "User registered successfully (Mock Mode)"}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if db_connected:
        try:
            user = users_collection.find_one({"email": email})
            if user and check_password_hash(user["password"], password):
                return jsonify({
                    "message": "Login successful",
                    "user": {
                        "email": user["email"],
                        "firstName": user["firstName"],
                        "lastName": user["lastName"],
                        "role": user["role"]
                    }
                }), 200
            return jsonify({"error": "Invalid email or password"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Mock login if DB is offline
    if email == "sanjula@agriwatch.com" and password == "password123":
        return jsonify({
            "message": "Login successful (Mock Mode)",
            "user": {
                "email": email,
                "firstName": "Sanjula",
                "lastName": "Perera",
                "role": "Admin"
            }
        }), 200
    
    return jsonify({"error": "Invalid credentials (Mock Mode)"}), 401


def generate_prediction(reading):
    soil_moisture = reading.get("soilMoisture", 0)
    rainfall = reading.get("rainfall", 0)
    humidity = reading.get("humidity", 0)
    temperature = reading.get("temperature", 0)

    drought_risk = 65 if soil_moisture < 45 else 20
    flood_risk = 35 if rainfall > 20 else 10
    pest_risk = 25 if humidity > 70 else 15

    overall_status = "warning" if drought_risk >= 60 else "normal"

    if soil_moisture < 40:
        ai_prediction = "Irrigation Needed"
    elif temperature > 32:
        ai_prediction = "Heat Stress Risk"
    else:
        ai_prediction = "Normal Conditions"

    recommendation = (
        "Start irrigation and monitor soil daily."
        if drought_risk >= 60
        else "Conditions are stable."
    )

    return {
        "droughtRisk": drought_risk,
        "floodRisk": flood_risk,
        "pestRisk": pest_risk,
        "overallStatus": overall_status,
        "recommendation": recommendation,
        "prediction": ai_prediction,
    }


def serialize_doc(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


@app.route("/")
def home():
    return jsonify({"message": "Smart Agriculture Backend Running with MongoDB Atlas"})


@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    latest = None
    if db_connected:
        try:
            latest = sensor_collection.find_one(sort=[("timestamp", -1)])
        except:
            latest = None

    if not latest:
        return jsonify({
            "lastUpdated": datetime.now().isoformat(),
            "farmStatus": "Mock Data (DB Offline)" if not db_connected else "No sensor data available",
            "metrics": {
                "temperature": 28.5,
                "humidity": 65,
                "soilMoisture": 42,
                "rainfall": 12.4
            },
            "prediction": {
                "droughtRisk": 65,
                "floodRisk": 10,
                "pestRisk": 15,
                "overallStatus": "warning",
                "recommendation": "Mock recommendation: Start irrigation.",
                "prediction": "Irrigation Needed"
            }
        })

    prediction = generate_prediction(latest)

    farm_status = (
        "Low soil moisture detected"
        if latest.get("soilMoisture", 0) < 45
        else "All conditions normal"
    )

    return jsonify({
        "lastUpdated": latest.get("timestamp"),
        "farmStatus": farm_status,
        "metrics": {
            "temperature": latest.get("temperature", 0),
            "humidity": latest.get("humidity", 0),
            "soilMoisture": latest.get("soilMoisture", 0),
            "rainfall": latest.get("rainfall", 0),
        },
        "prediction": prediction
    })


@app.route("/api/predictions", methods=["GET"])
def predictions():
    latest = None
    if db_connected:
        try:
            latest = sensor_collection.find_one(sort=[("timestamp", -1)])
        except:
            latest = None

    if not latest:
        return jsonify({
            "droughtRisk": 65,
            "floodRisk": 10,
            "pestRisk": 15,
            "overallStatus": "warning",
            "recommendation": "Mock recommendation: Start irrigation.",
            "prediction": "Irrigation Needed"
        })

    return jsonify(generate_prediction(latest))


@app.route("/api/predict", methods=["GET"])
def predict():
    latest = None
    if db_connected:
        try:
            latest = sensor_collection.find_one(sort=[("timestamp", -1)])
        except:
            latest = None

    if not latest:
        return jsonify({"prediction": "Mock Prediction: Normal"})

    result = generate_prediction(latest)
    return jsonify({"prediction": result["prediction"]})


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    if db_connected:
        try:
            alerts = list(alert_collection.find().sort("createdAt", -1))
            alerts = [serialize_doc(alert) for alert in alerts]
            return jsonify(alerts)
        except:
            pass
    
    return jsonify([
        {
            "type": "Mock Drought Risk",
            "severity": "Medium",
            "message": "Soil moisture level is low (Mock).",
            "recommendedAction": "Start irrigation.",
            "status": "active",
            "time": "Just now",
            "createdAt": datetime.now().isoformat()
        }
    ])


@app.route("/api/history", methods=["GET"])
def history():
    readings = []
    if db_connected:
        try:
            readings = list(
                sensor_collection.find(
                    {},
                    {
                        "_id": 0,
                        "day": 1,
                        "temperature": 1,
                        "soilMoisture": 1
                    }
                ).sort("timestamp", 1)
            )
        except:
            readings = []

    if readings:
        return jsonify(readings)

    return jsonify([
        {"day": "Mon", "temperature": 27, "soilMoisture": 50},
        {"day": "Tue", "temperature": 28, "soilMoisture": 48},
        {"day": "Wed", "temperature": 29, "soilMoisture": 46},
        {"day": "Thu", "temperature": 30, "soilMoisture": 44},
        {"day": "Fri", "temperature": 28, "soilMoisture": 42},
    ])


@app.route("/api/sensors", methods=["POST"])
def add_sensor_data():
    if not db_connected:
        return jsonify({"error": "Database not connected. Sensor data cannot be saved."}), 503
    
    data = request.json or {}

    required_fields = ["fieldId", "temperature", "humidity", "soilMoisture", "rainfall"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    timestamp = datetime.now().isoformat()
    day = datetime.now().strftime("%a")

    sensor_doc = {
        "fieldId": data["fieldId"],
        "temperature": data["temperature"],
        "humidity": data["humidity"],
        "soilMoisture": data["soilMoisture"],
        "rainfall": data["rainfall"],
        "timestamp": timestamp,
        "day": day
    }

    sensor_collection.insert_one(sensor_doc)

    prediction = generate_prediction(sensor_doc)

    if prediction["droughtRisk"] >= 60:
        alert_doc = {
            "type": "Drought Risk",
            "severity": "Medium",
            "message": "Soil moisture level has dropped below 45%.",
            "recommendedAction": "Start irrigation within 48 hours.",
            "status": "active",
            "time": "Just now",
            "createdAt": timestamp
        }
        alert_collection.insert_one(alert_doc)

    if prediction["floodRisk"] >= 35:
        alert_doc = {
            "type": "Flood Risk",
            "severity": "Medium",
            "message": "Rainfall levels indicate a potential flooding risk.",
            "recommendedAction": "Inspect drainage channels and monitor rainfall closely.",
            "status": "active",
            "time": "Just now",
            "createdAt": timestamp
        }
        alert_collection.insert_one(alert_doc)

    sensor_doc["_id"] = str(sensor_doc["_id"])

    return jsonify({
        "message": "Sensor data added successfully",
        "data": sensor_doc,
        "prediction": prediction
    }), 201


@app.route("/api/seed", methods=["GET", "POST"])
def seed_data():
    if not db_connected:
        return jsonify({"error": "Database not connected. Cannot seed data."}), 503
    
    sensor_collection.delete_many({})
    alert_collection.delete_many({})

    sensor_docs = [
        {
            "fieldId": "north-field",
            "temperature": 27,
            "humidity": 63,
            "soilMoisture": 50,
            "rainfall": 10,
            "timestamp": "2026-03-31T09:00:00",
            "day": "Mon"
        },
        {
            "fieldId": "north-field",
            "temperature": 28,
            "humidity": 64,
            "soilMoisture": 48,
            "rainfall": 12,
            "timestamp": "2026-04-01T09:00:00",
            "day": "Tue"
        },
        {
            "fieldId": "north-field",
            "temperature": 29,
            "humidity": 66,
            "soilMoisture": 46,
            "rainfall": 8,
            "timestamp": "2026-04-02T09:00:00",
            "day": "Wed"
        },
        {
            "fieldId": "north-field",
            "temperature": 30,
            "humidity": 67,
            "soilMoisture": 44,
            "rainfall": 14,
            "timestamp": "2026-04-03T09:00:00",
            "day": "Thu"
        },
        {
            "fieldId": "north-field",
            "temperature": 28,
            "humidity": 65,
            "soilMoisture": 42,
            "rainfall": 15,
            "timestamp": "2026-04-03T19:15:00",
            "day": "Fri"
        }
    ]

    alert_docs = [
        {
            "type": "Drought Risk",
            "severity": "Medium",
            "message": "Soil moisture level has dropped below 45%. Irrigation recommended within 48 hours.",
            "recommendedAction": "Start irrigation system in Field A and B. Monitor moisture levels daily.",
            "status": "active",
            "time": "2 hours ago",
            "createdAt": "2026-04-03T17:00:00"
        }
    ]

    sensor_collection.insert_many(sensor_docs)
    alert_collection.insert_many(alert_docs)

    return jsonify({"message": "Sample data inserted successfully"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)