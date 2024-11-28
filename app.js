const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
require('dotenv').config();

app.use(express.json());

// Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ||"new_password",
  database: process.env.DB_NAME,
});

app.post('/addSchool', async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Database error', error: error.message });
  }
});

app.get('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.query;
  
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid query parameters' });
    }
  
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
  
    try {
      const [schools] = await db.query('SELECT * FROM schools');
  
      // Haversine formula for distance calculation
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
  
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
        return 2 * R * Math.asin(Math.sqrt(a));
      };
  
      const sortedSchools = schools
        .map((school) => ({
          ...school,
          distance: calculateDistance(userLat, userLon, school.latitude, school.longitude),
        }))
        .sort((a, b) => a.distance - b.distance);
  
      res.json(sortedSchools);
    } catch (error) {
      res.status(500).json({ message: 'Database error', error: error.message });
    }
  });
  const PORT = process.env.PORT; // Use an environment variable or default to 3000

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

  
