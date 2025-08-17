const express = require("express");
const authenticateToken = require("../middlewares/auth");
const Farm = require("../models/Farm");
const { getGeminiRecommendation } = require("../services/gemini");

const router = express.Router();

// Helper: Format prompt for LLM
function buildPrompt(farm) {
  return `Given the following farm data:
- Location: ${
    farm.location.address ||
    `${farm.location.coordinates[1]}, ${farm.location.coordinates[0]}`
  }
- Soil Type: ${farm.soilType || "N/A"}
- Size: ${farm.size || "N/A"} acres
- Irrigation: ${farm.irrigationType || "N/A"}
- Crop History: ${
    farm.cropHistory.length > 0 ? farm.cropHistory.join(", ") : "N/A"
  }

You must respond with ONLY a valid JSON array containing 3-5 crop recommendations. No other text before or after the JSON.

Example format:
[
  {
    "crop": "Maize",
    "suitabilityScore": 85,
    "explanation": "Well-suited for chalky soil and surface irrigation",
    "plantingTime": "Kharif Season",
    "expectedYield": "8-12 tons/acre",
    "profitability": "High",
    "difficulty": "Easy",
    "confidence": 0.85,
    "reason": "Adapts well to semi-arid climate with good market demand",
    "season": "Summer"
  }
]

Keep all text fields short (1-2 sentences max). Focus on practical recommendations.`;
}

// Helper: Parse Gemini response to extract JSON
function parseGeminiResponse(response) {
  console.log("Raw Gemini response:", response);

  try {
    // Try to find JSON array in the response
    const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("Parsed JSON:", parsed);
      return parsed;
    }

    // Try to find individual JSON objects
    const objectMatches = response.match(/\{[^{}]*"crop"[^{}]*\}/g);
    if (objectMatches && objectMatches.length > 0) {
      const recommendations = objectMatches
        .map((match) => {
          try {
            return JSON.parse(match);
          } catch (e) {
            console.warn("Failed to parse individual object:", match);
            return null;
          }
        })
        .filter(Boolean);

      if (recommendations.length > 0) {
        console.log("Parsed from individual objects:", recommendations);
        return recommendations;
      }
    }

    // If no JSON found, create a fallback recommendation
    console.warn("No valid JSON found in response, creating fallback");
    return [
      {
        crop: "General Recommendation",
        suitabilityScore: 70,
        explanation: "Based on your farm conditions",
        plantingTime: "Next Season",
        expectedYield: "Variable",
        profitability: "Medium",
        difficulty: "Moderate",
        confidence: 0.7,
        reason:
          "AI analysis suggests this crop is suitable for your soil and climate.",
        season: "Year-round",
      },
    ];
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Return fallback recommendation
    return [
      {
        crop: "General Recommendation",
        suitabilityScore: 70,
        explanation: "AI recommendation based on your farm conditions",
        plantingTime: "Next Season",
        expectedYield: "Variable",
        profitability: "Medium",
        difficulty: "Moderate",
        confidence: 0.7,
        reason:
          "AI analysis suggests this crop is suitable for your soil and climate.",
        season: "Year-round",
      },
    ];
  }
}

// POST /api/recommendations/crop
router.post("/crop", authenticateToken, async (req, res) => {
  try {
    let farm;
    if (req.body.farmId) {
      farm = await Farm.findOne({ _id: req.body.farmId, owner: req.user._id });
      if (!farm) return res.status(404).json({ message: "Farm not found." });
    } else if (req.body.farm) {
      farm = req.body.farm;
    } else {
      return res.status(400).json({ message: "Provide farmId or farm data." });
    }

    const prompt = buildPrompt(farm);
    

    const geminiResponse = await getGeminiRecommendation(prompt);
    

    const recommendations = parseGeminiResponse(geminiResponse);
    console.log("Final recommendations:", recommendations);

    res.json(recommendations);
  } catch (err) {
    console.error("Error in recommendations route:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
