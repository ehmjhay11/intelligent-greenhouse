const express = require('express');
const cors = require('cors');
const sensorRoutes = require('./routes/sensors');
const plantRoutes = require('./routes/plants');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/plants', plantRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Greenhouse Backend API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;