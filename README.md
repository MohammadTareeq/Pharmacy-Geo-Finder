# Pharmacy Geo Finder

## Introduction

Pharmacy Geo Finder is a location-based web application that helps users find nearby pharmacies stocking specific medicines within Mumbai and Navi Mumbai. The app uses geospatial queries on MongoDB to provide real-time search results based on the user's current location and selected filters.

## Features

- **Geospatial search:** Locate pharmacies within a 50 km radius of the user's location.  
- **Medicine auto-suggestion:** Search input offers real-time medicine name suggestions.  
- **City filter:** Narrow down pharmacies to Mumbai or Navi Mumbai.  
- **Interactive map:** Visual markers display pharmacy locations with availability status.  
- **Pharmacy details:** View pharmacy name, city, distance from the user, and stocked medicines.

## Technologies Used

- **Backend:** Node.js, Express.js, Mongoose (MongoDB)  
- **Database:** MongoDB with geospatial indexing (2dsphere)  
- **Frontend:** HTML, CSS, JavaScript, Leaflet.js for map rendering  
- **APIs:** RESTful endpoints to fetch pharmacies and medicine suggestions  
- **Geolocation:** Browser Geolocation API to detect user's current position  
- **CORS:** Cross-origin resource sharing enabled for frontend-backend communication

## Installation & Setup

1. Clone the repository to your local machine.  
2. Install dependencies using `npm install` or `yarn install`.  
3. Set up MongoDB:  
   - Ensure MongoDB is running locally or adjust the connection string to your MongoDB instance.  
   - Populate the database with sample pharmacy data for Mumbai and Navi Mumbai.  
4. Start the backend server using `npm start` or equivalent.  
5. Open the frontend in a browser to use the application.

## Usage

1. Enter at least two characters of a medicine name in the search input to get auto-suggestions.  
2. Optionally select a city filter to narrow the search.  
3. The map centers on your current location (if permission is granted).  
4. Nearby pharmacies stocking the searched medicine appear as markers on the map.  
5. Click markers to see pharmacy details and medicine availability.  
6. A list below the map displays pharmacies sorted by proximity.

## Project Structure

### Backend

- Schema definition and geospatial indexing for pharmacies.  
- REST API endpoints to query pharmacies by medicine, location, and city.  
- Auto-suggest endpoint for medicines.  
- Database seeding scripts for realistic Mumbai and Navi Mumbai locations.

### Frontend

- Responsive interface with search input and city filter.  
- Leaflet map integration to visualize pharmacies.  
- JavaScript logic for geolocation, fetching data, and rendering results.

## Notes

- Geolocation permission is requested to center the map and fetch nearby pharmacies.  
- The application uses a maximum search radius of 50 kilometers.  
- Medicine names are matched using case-insensitive regular expressions.  
- The pharmacy dataset includes a variety of common medicines such as antibiotics, injections, and lotions.


