
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const Joi = require('joi');

require('dotenv').config();
const db = require('./db'); // Import database setup

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// Validation functions
const validateAddSchool = (data) => Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
}).validate(data);

// Swagger documentation setup



app.post('/addSchool', async (req, res) => {
  const { error } = validateAddSchool(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { name, address, latitude, longitude } = req.body;

    // Check if the school already exists
    const [existingSchool] = await db.query('SELECT * FROM new_database WHERE name = ? AND address = ?', [name, address]);
    if (existingSchool.length > 0) {
      return res.status(409).json({ message: 'School already exists' }); // Conflict status code
    }

    // Insert new school
    const [result] = await db.query('INSERT INTO new_database (name, address, latitude, longitude) VALUES (?, ?, ?, ?)', [name, address, latitude, longitude]);
    res.status(201).json({ message: 'School added successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});


// List Schools API
app.get('/listSchools', async (req, res) => {
  const { latitude, longitude, limit = 10, offset = 0 } = req.query;
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid query parameters' });
  }

  try {
    const [new_database] = await db.query('SELECT * FROM new_database LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
    const toRad = (deg) => (deg * Math.PI) / 180;
    const calcDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(a));
    };

    const userLat = parseFloat(latitude), userLon = parseFloat(longitude);
    const sortedSchools = new_database.map((school) => ({
      ...school,
      distance: calcDistance(userLat, userLon, school.latitude, school.longitude),
    })).sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (err) {
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
