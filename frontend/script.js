let map;
let userMarker;
let pharmacyMarkers = [];
let userLocation = null;

const medicineInput = document.getElementById("medicineInput");
const cityFilter = document.getElementById("cityFilter");
const pharmacyList = document.getElementById("pharmacy-list");

// Initialize map
function initMap() {
  map = L.map("map").setView([19.076, 72.8777], 12); // Mumbai

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocation = [pos.coords.latitude, pos.coords.longitude];
        map.setView(userLocation, 13);

        userMarker = L.marker(userLocation, {
          title: "Your Location",
          icon: L.icon({
            iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        }).addTo(map);

        fetchAndDisplayPharmacies();
      },
      () => {
        alert("Geolocation permission denied or unavailable.");
        fetchAndDisplayPharmacies();
      }
    );
  } else {
    alert("Geolocation not supported.");
    fetchAndDisplayPharmacies();
  }
}

function clearPharmacyMarkers() {
  pharmacyMarkers.forEach((m) => map.removeLayer(m));
  pharmacyMarkers = [];
}

function fetchAndDisplayPharmacies() {
  clearPharmacyMarkers();
  pharmacyList.innerHTML = "";

  const medicine = medicineInput.value.trim();
  if (!medicine) return;

  const city = cityFilter.value;

  const params = new URLSearchParams({
    medicine,
    lat: userLocation ? userLocation[0] : 19.076,
    lng: userLocation ? userLocation[1] : 72.8777,
  });
  if (city) params.append("city", city);

  fetch(`http://localhost:5000/api/pharmacies?${params.toString()}`)
    .then((res) => res.json())
    .then((pharmacies) => {
      pharmacies.forEach((pharm) => {
        const position = [
          pharm.location.coordinates[1],
          pharm.location.coordinates[0],
        ];

        const marker = L.marker(position).addTo(map);

        // Check if searched medicine is in stock at this pharmacy
        const searchedMedicine = medicine.toLowerCase();
        const inStock = pharm.medicines.some(
          (med) => med.toLowerCase() === searchedMedicine
        );

        marker.bindPopup(`
          <b>${pharm.name}</b><br/>
          ${pharm.city}<br/>
          Medicine: <b>${medicine}</b> - 
          <span style="color: ${inStock ? "green" : "red"};">
            ${inStock ? "In Stock" : "Out of Stock"}
          </span>
        `);

        pharmacyMarkers.push(marker);

        const dist = getDistance(
          userLocation ? userLocation[0] : 19.076,
          userLocation ? userLocation[1] : 72.8777,
          position[0],
          position[1]
        );

        const li = document.createElement("li");
        li.innerHTML = `<b>${pharm.name}</b> (${pharm.city}) - Distance: ${dist.toFixed(
          2
        )} km<br/>Medicines: ${pharm.medicines.join(", ")}`;
        pharmacyList.appendChild(li);
      });
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to fetch pharmacies");
    });
}

// Haversine formula to calculate distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Auto-suggestion for medicine input
medicineInput.addEventListener("input", () => {
  const val = medicineInput.value.trim();
  if (val.length < 2) return;

  fetch(`http://localhost:5000/api/medicines?q=${val}`)
    .then((res) => res.json())
    .then((data) => {
      let dataList = document.getElementById("medicines-list");
      if (!dataList) {
        dataList = document.createElement("datalist");
        dataList.id = "medicines-list";
        document.body.appendChild(dataList);
        medicineInput.setAttribute("list", "medicines-list");
      }
      dataList.innerHTML = "";
      data.forEach((med) => {
        const option = document.createElement("option");
        option.value = med;
        dataList.appendChild(option);
      });
    });
});

// Refetch pharmacies on input or filter change
medicineInput.addEventListener("change", fetchAndDisplayPharmacies);
cityFilter.addEventListener("change", fetchAndDisplayPharmacies);

window.onload = initMap;
