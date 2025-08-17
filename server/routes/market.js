const express = require("express");
const axios = require("axios");
const router = express.Router();

// GET /api/market?state=...&district=...&market=...&commodity=...
router.get("/", async (req, res) => {
  const { state, district, market, commodity } = req.query;
  if (!state || !district || !market || !commodity) {
    return res
      .status(400)
      .json({
        message:
          "All parameters are required: state, district, market, commodity",
      });
  }
  try {
    const url =
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=100";
    const response = await axios.get(url);
    // Filter records by query params (case-insensitive)
    const filtered = response.data.records.filter(
      (item) =>
        item.state.toLowerCase() === state.toLowerCase() &&
        item.district.toLowerCase() === district.toLowerCase() &&
        item.market.toLowerCase() === market.toLowerCase() &&
        item.commodity.toLowerCase() === commodity.toLowerCase()
    );
    if (filtered.length === 0) {
      return res
        .status(404)
        .json({ message: "No market data found for the given parameters." });
    }
    res.json(filtered);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch market data", error: err.message });
  }
});

module.exports = router;
