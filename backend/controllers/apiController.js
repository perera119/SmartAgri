const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const { generatePrediction } = require('../utils/prediction');
const { fetchSriLankaFarms } = require('../services/farmService');

// @desc    Get dashboard data
// @route   GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });

    if (!latest) {
      return res.json({
        lastUpdated: new Date().toISOString(),
        farmStatus: "Mock Data (DB Offline)",
        metrics: {
          temperature: 28.5,
          humidity: 65,
          soilMoisture: 42,
          rainfall: 12.4
        },
        prediction: {
          droughtRisk: 10,
          floodRisk: 65,
          pestRisk: 15,
          overallStatus: "critical",
          recommendation: "Activate drainage systems.",
          prediction: "Flood Warning"
        }
      });
    }

    const prediction = await generatePrediction(latest);
    const farmStatus = latest.rainfall > 50 ? "Heavy rainfall detected (Flood Risk)" : "All conditions normal";

    res.json({
      lastUpdated: latest.timestamp,
      farmStatus,
      metrics: {
        temperature: latest.temperature,
        humidity: latest.humidity,
        soilMoisture: latest.soilMoisture,
        rainfall: latest.rainfall,
      },
      prediction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all alerts
// @route   GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    if (alerts.length === 0) {
       return res.json([{
          type: "Flood Risk Detected",
          severity: "Critical",
          message: "Excessive rainfall and poor field drainage detected. Imminent risk of crop flooding.",
          recommendedAction: "Activate drainage pumps immediately and evacuate equipment from low-lying areas.",
          status: "active",
          time: "Just now",
          createdAt: new Date().toISOString()
       }]);
    }
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get history
// @route   GET /api/history
const getHistory = async (req, res) => {
  try {
    const readings = await SensorData.find({}, { _id: 0, day: 1, temperature: 1, soilMoisture: 1 }).sort({ timestamp: 1 });
    if (readings.length === 0) {
      return res.json([
        { day: "Mon", temperature: 27, soilMoisture: 50 },
        { day: "Tue", temperature: 28, soilMoisture: 48 },
        { day: "Wed", temperature: 29, soilMoisture: 46 },
        { day: "Thu", temperature: 30, soilMoisture: 44 },
        { day: "Fri", temperature: 28, soilMoisture: 42 },
      ]);
    }
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add sensor data
// @route   POST /api/sensors
const addSensorData = async (req, res) => {
  const { fieldId, temperature, humidity, soilMoisture, rainfall } = req.body;

  if (!fieldId || temperature === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const timestamp = new Date().toISOString();
  const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  try {
    const sensorDoc = await SensorData.create({
      fieldId,
      temperature,
      humidity,
      soilMoisture,
      rainfall,
      timestamp,
      day
    });

    const prediction = await generatePrediction(sensorDoc);

    if (prediction.floodRisk >= 60) {
      await Alert.create({
        type: "Flood Risk Detected",
        severity: "Critical",
        message: "Excessive rainfall and poor field drainage detected.",
        recommendedAction: "Activate drainage pumps immediately.",
        status: "active",
        time: "Just now",
        createdAt: timestamp
      });
    }

    res.status(201).json({
      message: "Sensor data added successfully",
      data: sensorDoc,
      prediction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Seed data
// @route   POST /api/seed
const seedData = async (req, res) => {
  try {
    await SensorData.deleteMany({});
    await Alert.deleteMany({});

    const sensorDocs = [
      { fieldId: "north-field", temperature: 27, humidity: 63, soilMoisture: 50, rainfall: 10, timestamp: "2026-03-31T09:00:00", day: "Mon" },
      { fieldId: "north-field", temperature: 28, humidity: 64, soilMoisture: 48, rainfall: 12, timestamp: "2026-04-01T09:00:00", day: "Tue" },
      { fieldId: "north-field", temperature: 29, humidity: 66, soilMoisture: 46, rainfall: 8, timestamp: "2026-04-02T09:00:00", day: "Wed" },
      { fieldId: "north-field", temperature: 30, humidity: 67, soilMoisture: 44, rainfall: 14, timestamp: "2026-04-03T09:00:00", day: "Thu" },
      { fieldId: "north-field", temperature: 28, humidity: 65, soilMoisture: 42, rainfall: 15, timestamp: "2026-04-03T19:15:00", day: "Fri" }
    ];

    await SensorData.insertMany(sensorDocs);
    res.json({ message: "Sample data inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get predictions
// @route   GET /api/predictions
const getPredictions = async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.json({
        droughtRisk: 65,
        floodRisk: 10,
        pestRisk: 15,
        overallStatus: "warning",
        recommendation: "Mock recommendation: Start irrigation.",
        prediction: "Irrigation Needed"
      });
    }
    res.json(await generatePrediction(latest));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Simple predict
// @route   GET /api/predict
const predict = async (req, res) => {
  try {
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    if (!latest) {
      return res.json({ prediction: "Mock Prediction: Normal" });
    }
    const result = await generatePrediction(latest);
    res.json({ prediction: result.prediction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get publicly mapped farms in Sri Lanka
// @route   GET /api/farms/sri-lanka
const getSriLankaFarms = async (req, res) => {
  try {
    const result = await fetchSriLankaFarms();
    res.json(result);
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: error.message || "Farm location data is temporarily unavailable. Please try again later." 
    });
  }
};

// @desc    Handle AI Chat Assistant (Multi-Provider with failover)
// @route   POST /api/chat
const handleChat = async (req, res) => {
  try {
    const { message, farmData } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    // 1. COLLECT ALL AVAILABLE KEYS
    const geminiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_BACKUP
    ].filter(k => k && k !== "your_gemini_api_key_here");

    const openaiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here" 
      ? process.env.OPENAI_API_KEY : null;

    // Build common farm context
    let farmContext = "";
    if (farmData && Object.keys(farmData).length > 0) {
      const m = farmData.metrics || farmData;
      const p = farmData.prediction || farmData;
      farmContext = `\n\nCurrent farm sensor data:\n` +
        `- Temperature: ${m.temperature ?? "N/A"}°C\n` +
        `- Humidity: ${m.humidity ?? "N/A"}%\n` +
        `- Soil Moisture: ${m.soilMoisture ?? "N/A"}%\n` +
        `- Rainfall: ${m.rainfall ?? "N/A"}mm\n` +
        `- Drought Risk: ${p.droughtRisk ?? "N/A"}%\n` +
        `- Flood Risk: ${p.floodRisk ?? "N/A"}%\n` +
        `- Pest Risk: ${p.pestRisk ?? "N/A"}%\n` +
        `- Location: ${farmData.location || farmData.district || "Sri Lanka"}\n`;
    }

    const systemPrompt =
      `You are AgriGuide AI, a smart farming assistant for a Smart Agricultural Disaster Early Warning System in Sri Lanka. ` +
      `Help users understand farm sensor readings, disaster risks, alerts, and recommended actions. ` +
      `Use simple, clear, practical language suitable for farmers. ` +
      `Base your answers on the provided farm data when available. ` +
      `Explain drought, flood, pest, rainfall, temperature, humidity, and soil moisture risks clearly. ` +
      `Always remind users that this is a prototype advisory system and critical decisions should be confirmed with an agricultural officer.` +
      farmContext +
      `\n\nUser: ${message}`;

    // ── TRY PROVIDER 1: GEMINI ───────────────────────────────────────────────
    if (geminiKeys.length > 0) {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      for (const key of geminiKeys) {
        try {
          const genAI = new GoogleGenerativeAI(key);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const result = await model.generateContent(systemPrompt);
          const text = (await result.response).text();
          if (text) {
            console.log("Response generated via Gemini");
            return res.json({ reply: text });
          }
        } catch (err) {
          console.warn("Gemini attempt failed:", err.message);
        }
      }
    }

    // ── TRY PROVIDER 2: OPENAI (Failover) ──────────────────────────────────
    if (openaiKey) {
      try {
        const OpenAI = require("openai");
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Very fast and cheap
          messages: [{ role: "system", content: systemPrompt }],
          max_tokens: 300,
        });
        const text = completion.choices[0]?.message?.content;
        if (text) {
          console.log("Response generated via OpenAI (Backup)");
          return res.json({ reply: text });
        }
      } catch (err) {
        console.warn("OpenAI attempt failed:", err.message);
      }
    }

    // ── TRY PROVIDER 3: SMART LOGIC (Last Resort Fallback) ──────────────────
    console.log("All AI Providers failed. Using Smart Fallback Logic...");
    
    const m = farmData?.metrics || farmData || {};
    const p = farmData?.prediction || farmData || {};
    const temp = m.temperature || 28;
    const humidity = m.humidity || 75;
    const rain = m.rainfall || 0;
    const dRisk = p.droughtRisk || 0;
    const fRisk = p.floodRisk || 0;
    const pRisk = p.pestRisk || 0;

    let fallbackReply = `⚠️ **Note:** I am currently running in *Smart Offline Mode* because both Gemini and OpenAI are busy, but I can still help! \n\n`;
    
    if (fRisk > 50 || rain > 20) {
      fallbackReply += `🌊 **Flood Alert:** High flood risk of ${fRisk}% in your area. With rainfall at ${rain}mm, please check your drainage channels immediately.`;
    } else if (dRisk > 50 || temp > 35) {
      fallbackReply += `🔥 **Drought Alert:** High heat (${temp}°C) and drought risk (${dRisk}%). We recommend increasing irrigation cycles today.`;
    } else if (pRisk > 50 || humidity > 85) {
      fallbackReply += `🐛 **Pest Alert:** High humidity (${humidity}%) increases pest risk to ${pRisk}%. Inspect your crops for early signs of infestation.`;
    } else {
      fallbackReply += `✅ **Farm Status:** Conditions are stable (${temp}°C, ${humidity}% humidity). No immediate disaster risks detected.`;
    }

    fallbackReply += `\n\n*Please confirm critical decisions with an agricultural officer.*`;
    return res.json({ reply: fallbackReply });

  } catch (error) {
    console.error("Chat Controller Error:", error.message);
    res.json({ reply: "AgriGuide AI is temporarily unavailable. Please try again later." });
  }
};

module.exports = { getDashboard, getAlerts, getHistory, addSensorData, seedData, getPredictions, predict, getSriLankaFarms, handleChat };
