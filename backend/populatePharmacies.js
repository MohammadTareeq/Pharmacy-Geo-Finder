const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/pharmacydb";

const pharmacySchema = new mongoose.Schema({
  name: String,
  city: String,
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  medicines: [String],
});
pharmacySchema.index({ location: "2dsphere" });
const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    populatePharmacies();
  })
  .catch(console.error);

// Sample medicine pool (injections, lotions, antibiotics, etc)
const medicinesPool = [
  "Amoxicillin", "Paracetamol", "Ceftriaxone Injection", "Ibuprofen", "Metformin",
  "Cetirizine", "Lotion A", "Lotion B", "Insulin Injection", "Azithromycin",
  "Diclofenac Gel", "Saline Injection", "Vitamin D", "Omeprazole", "Aspirin",
  "Hydrocortisone Cream", "Salbutamol Inhaler", "Clindamycin", "Gentamicin Injection",
];

// Realistic Mumbai coordinates (latitude, longitude)
// These are commercial/residential locations inside Mumbai city area - no water
const mumbaiLocations = [
  [19.0760, 72.8777], // Mumbai Central
  [19.0911, 72.8656], // Dadar West
  [19.0451, 72.8285], // Andheri East
  [19.0176, 72.8562], // Vile Parle East
  [19.0790, 72.8891], // Lower Parel
  [19.1150, 72.9100], // Ghatkopar East
  [19.0330, 72.8490], // Santacruz East
  [19.1243, 72.8405], // Kurla West
];

// Realistic Navi Mumbai coordinates (no water)
const naviMumbaiLocations = [
  [19.0330, 73.0297], // Vashi
  [19.0596, 73.0229], // Nerul
  [19.0901, 73.0133], // Kharghar
  [19.0424, 73.0152], // Belapur
  [19.1038, 73.0223], // Airoli
];

// Pharmacy names pool
const pharmacyNames = [
  "Apollo Pharmacy",
  "MedPlus",
  "HealthCare Pharmacy",
  "CityCare Pharmacy",
  "CarePoint Pharmacy",
  "Wellness Pharmacy",
  "QuickMed Pharmacy",
  "LifeLine Pharmacy",
  "Healing Touch Pharmacy",
];

// Helper to pick random element from array
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate pharmacies for a city with realistic locations
async function generatePharmacies(city, locations, count) {
  const pharmacies = [];
  for (let i = 0; i < count; i++) {
    const name = randomChoice(pharmacyNames) + " " + (i + 1);
    const location = randomChoice(locations);
    // Randomly assign 3-5 medicines
    const medicineCount = 3 + Math.floor(Math.random() * 3);
    const medicines = [];
    while (medicines.length < medicineCount) {
      const med = randomChoice(medicinesPool);
      if (!medicines.includes(med)) medicines.push(med);
    }

    pharmacies.push({
      name,
      city,
      location: {
        type: "Point",
        coordinates: [location[1], location[0]], // GeoJSON uses [lng, lat]
      },
      medicines,
    });
  }

  await Pharmacy.insertMany(pharmacies);
  console.log(`${count} pharmacies added in ${city}`);
}

async function populatePharmacies() {
  await Pharmacy.deleteMany({}); // Clear existing

  await generatePharmacies("Mumbai", mumbaiLocations, 20);
  await generatePharmacies("Navi Mumbai", naviMumbaiLocations, 15);

  mongoose.connection.close();
}
