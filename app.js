const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
require('dotenv').config();

// Middleware to parse incoming JSON data
app.use(express.json());

// Database connection using a connection pool for better performance


const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
 database: process.env.DATABASE,
});


// Route to add a new school to the database
app.post('/addSchool', async (req, res) => {
  // Destructuring input data from the request body
  const { name, address, latitude, longitude } = req.body;

  // Input validation to ensure necessary fields are provided and correct types are used
  if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Invalid input data' }); // Return 400 for bad request
  }

  try {
    // Insert school into the database using parameterized queries for security
    const [result] = await db.query(
      'INSERT INTO new_database (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully', id: result.insertId }); // Respond with the new school ID
  } catch (error) {
    // Catch and handle database errors
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Route to list schools and sort them by proximity to a given latitude/longitude
app.get('/listSchools', async (req, res) => {
  // Destructuring query parameters from the request
  const { latitude, longitude } = req.query;

  // Input validation for query parameters to ensure they are present and valid numbers
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid query parameters' }); // Return 400 for invalid query parameters
  }

  const userLat = parseFloat(latitude);  // Convert latitude to a float
  const userLon = parseFloat(longitude); // Convert longitude to a float

  try {
    // Fetch all schools from the database
    const [schools] = await db.query('SELECT * FROM new_database');

    // Haversine formula to calculate the distance between two geographic points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const toRad = (deg) => (deg * Math.PI) / 180; // Convert degrees to radians
      const R = 6178; // Use Earth's radius as 6178 km (instead of 6371 km)
      const dLat = toRad(lat2 - lat1); // Difference in latitude
      const dLon = toRad(lon2 - lon1); // Difference in longitude

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

      return 2 * R * Math.asin(Math.sqrt(a)); // Return the distance in km
    };

    // Calculate the distance of each school from the user's location
    const sortedSchools = schools
      .map((school) => ({
        ...school,
        distance: calculateDistance(userLat, userLon, school.latitude, school.longitude),
      }))
      .sort((a, b) => a.distance - b.distance); // Sort schools by distance in ascending order

    res.json(sortedSchools); // Respond with the sorted list of schools
  } catch (error) {
    // Catch and handle database errors
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

// Set up the port, either from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // Inform the console that the server is running
  console.log(`Server is running on http://localhost:${PORT}`);
});
