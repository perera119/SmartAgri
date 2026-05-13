import datetime

def calculate_risks(data):
    """
    Simple rule-based AI logic for agricultural risk prediction.
    Suitable for prototypes and final year projects.
    """
    temp = data.get('temperature', 0)
    humidity = data.get('humidity', 0)
    moisture = data.get('soilMoisture', 0)
    rainfall = data.get('rainfall', 0)

    # 1. Drought Risk Calculation
    drought_risk = "Low"
    if temp > 35 and moisture < 20:
        drought_risk = "High"
    elif temp > 30 or moisture < 30:
        drought_risk = "Medium"

    # 2. Flood Risk Calculation
    flood_risk = "Low"
    if rainfall > 100 or (rainfall > 50 and moisture > 85):
        flood_risk = "High"
    elif rainfall > 30 or moisture > 70:
        flood_risk = "Medium"

    # 3. Pest Risk Calculation
    # Many pests thrive in high humidity and warm temperatures
    pest_risk = "Low"
    if humidity > 80 and 20 <= temp <= 30:
        pest_risk = "High"
    elif humidity > 60:
        pest_risk = "Medium"

    # Generate Recommendation
    recommendation = "All systems stable. Continue regular monitoring."
    
    if drought_risk == "High":
        recommendation = "Critical: High drought risk. Activate irrigation systems immediately."
    elif flood_risk == "High":
        recommendation = "Warning: Potential flooding. Check drainage systems and protect sensitive crops."
    elif pest_risk == "High":
        recommendation = "Alert: High pest risk detected. Consider preventative organic pest control."
    elif drought_risk == "Medium":
        recommendation = "Slightly low soil moisture. Scheduled irrigation recommended."
    elif pest_risk == "Medium":
        recommendation = "Humidity is rising. Monitor crops for signs of fungal growth."

    return {
        "sensorData": data,
        "droughtRisk": drought_risk,
        "floodRisk": flood_risk,
        "pestRisk": pest_risk,
        "recommendation": recommendation,
        "timestamp": datetime.datetime.now().isoformat()
    }
