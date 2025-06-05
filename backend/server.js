const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// MongoDB connection string (adjust if needed)
const MONGO_URI = "mongodb://localhost:27017/pharmacydb";

// Pharmacy schema
const pharmacySchema = new mongoose.Schema({
  name: String,
  city: String,
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  medicines: [String],
});
pharmacySchema.index({ location: "2dsphere" });

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(console.error);

// API: medicine suggestions (auto-suggest)
app.get("/api/medicines", async (req, res) => {
  const q = req.query.q || "";
  if (q.length < 2) return res.json([]);

  try {
    const meds = await Pharmacy.aggregate([
      { $unwind: "$medicines" },
      { $match: { medicines: { $regex: q, $options: "i" } } },
      { $group: { _id: "$medicines" } },
      { $limit: 10 },
    ]);
    res.json(meds.map((m) => m._id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// API: pharmacies filtered by medicine, city, near user location
app.get("/api/pharmacies", async (req, res) => {
  const { medicine, city, lat, lng } = req.query;
  if (!medicine || !lat || !lng)
    return res.status(400).json({ error: "Missing required query parameters" });

  const query = {
    medicines: { $regex: medicine, $options: "i" },
  };
  if (city) query.city = city;

  try {
    const pharmacies = await Pharmacy.find({
      ...query,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 50000, // max 50 km radius
        },
      },
    }).limit(20);
    res.json(pharmacies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve frontend static files from ../frontend folder
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Serve index.html on root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Pharmacy Geo Finder API is running on port ${PORT}`);
});
