import datetime

def calculate_risks(data):
    """
    Enhanced AI logic for disaster forecasting.
    Calculates probability percentages and impact metrics.
    """
    temp = data.get('temperature', 0)
    humidity = data.get('humidity', 0)
    moisture = data.get('soilMoisture', 0)
    rainfall = data.get('rainfall', 0)

    # 1. Drought Probability (%)
    drought_prob = 0
    if temp > 35: drought_prob += 40
    elif temp > 30: drought_prob += 20
    if moisture < 15: drought_prob += 50
    elif moisture < 30: drought_prob += 30
    if rainfall == 0: drought_prob += 10
    drought_prob = min(drought_prob, 100)

    # 2. Flood Probability (%)
    flood_prob = 0
    if rainfall > 80: flood_prob += 70
    elif rainfall > 40: flood_prob += 40
    if moisture > 85: flood_prob += 30
    elif moisture > 70: flood_prob += 15
    flood_prob = min(flood_prob, 100)

    # 3. Pest Outbreak Probability (%)
    pest_prob = 0
    if humidity > 85 and 22 <= temp <= 29: pest_prob += 60
    elif humidity > 70: pest_prob += 30
    if temp > 32: pest_prob -= 10 # Some pests die in extreme heat
    pest_prob = max(0, min(pest_prob, 100))

    # Determine Overall Disaster Forecast
    forecasts = [
        {"type": "Drought", "prob": drought_prob, "intensity": "High" if drought_prob > 70 else "Medium" if drought_prob > 30 else "Low"},
        {"type": "Flood", "prob": flood_prob, "intensity": "High" if flood_prob > 70 else "Medium" if flood_prob > 30 else "Low"},
        {"type": "Pest Outbreak", "prob": pest_prob, "intensity": "High" if pest_prob > 70 else "Medium" if pest_prob > 30 else "Low"}
    ]

    # Generate Strategic Recommendation
    recommendation = "Normal conditions. Continue monitoring."
    if drought_prob > 60:
        recommendation = "CRITICAL: Severe moisture deficit predicted. Implement aggressive water conservation and night irrigation."
    elif flood_prob > 60:
        recommendation = "CRITICAL: High saturation and rainfall levels. Clear all perimeter drains and prepare for harvest extraction."
    elif pest_prob > 60:
        recommendation = "ALERT: Biological threat index high. Execute preventative bio-pesticide application immediately."

    return {
        "sensorData": data,
        "droughtRisk": "High" if drought_prob > 70 else "Medium" if drought_prob > 30 else "Low",
        "floodRisk": "High" if flood_prob > 70 else "Medium" if flood_prob > 30 else "Low",
        "pestRisk": "High" if pest_prob > 70 else "Medium" if pest_prob > 30 else "Low",
        "probabilities": {
            "drought": drought_prob,
            "flood": flood_prob,
            "pest": pest_prob
        },
        "forecasts": forecasts,
        "recommendation": recommendation,
        "predictionWindow": "48h - 72h",
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_broadcast_message(keyword, region):
    """
    Simulates AI generation of a formal disaster warning based on a keyword.
    In a production app, this would call an LLM (OpenAI, Gemini, etc.).
    """
    k = keyword.lower()
    r = region if region and region != "National" else "the National Agriculture Grid"
    
    if "flood" in k:
        return f"OFFICIAL WARNING: Severe precipitation telemetry indicates imminent flood risk across {r}. All agricultural stakeholders are advised to clear perimeter drainage systems and relocate mobile machinery to high-elevation zones immediately. This is a level-3 priority alert."
    elif "drought" in k or "heat" in k:
        return f"OFFICIAL ADVISORY: Prolonged thermal escalation and moisture deficit detected in {r}. Moisture retention protocols (mulching) should be implemented immediately. Irrigation cycles must be shifted to nocturnal hours to minimize evaporative loss. Monitor soil integrity closely."
    elif "pest" in k or "bug" in k:
        return f"BIO-SECURITY ALERT: AI surveillance identifies a high probability of pest infestation outbreaks in {r}. Farmers are directed to initiate visual field inspections and prepare bio-pesticide containment measures. Report any significant crop variance to regional offices."
    else:
        return f"REGIONAL INTELLIGENCE UPDATE: The Ministry of Agriculture is monitoring environmental vectors in {r}. Current status: {keyword}. Please maintain standard operational vigilance and stay tuned to the AgriWatch Command Center for live telemetry updates."
