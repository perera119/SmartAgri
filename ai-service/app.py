from flask import Flask, request, jsonify
from flask_cors import CORS
from services.prediction import calculate_risks, generate_broadcast_message

app = Flask(__name__)
# Enable CORS so the Node.js backend or React frontend can call this service
CORS(app)

@app.route('/api/ai/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request
        data = request.get_json()
        
        # Validate input
        required_fields = ['temperature', 'humidity', 'soilMoisture', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        # Process data using our service
        result = calculate_risks(data)
        
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/generate-broadcast', methods=['POST'])
def generate_broadcast():
    try:
        data = request.get_json()
        keyword = data.get('keyword', '')
        region = data.get('region', 'National')
        
        if not keyword:
            return jsonify({"error": "Keyword required"}), 400
            
        message = generate_broadcast_message(keyword, region)
        return jsonify({"message": message}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 8000 as requested
    print("AI Microservice starting on http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
