// backend/server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { initWebSocket } = require('./websocket');
const { fetchWeather } = require('./weatherService');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;
const server = http.createServer(app);

// REST endpoint for manual weather request
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City is required' });
    const data = await fetchWeather(city);
    res.json(data);
  } catch (e) {
  console.error('Weather API error:', e);   // add this line
  res.status(500).json({ error: 'Error fetching weather' });
}
});

// Endpoint for report download
const weatherHistory = [];

app.post('/api/saveWeather', (req, res) => {
  weatherHistory.push(req.body);
  res.json({ status: 'Saved' });
});

app.get('/api/report', (req, res) => {
  const hours = parseInt(req.query.hours);
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const filtered = weatherHistory.filter(entry => new Date(entry.timestamp) >= cutoff);
  res.json(filtered);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initWebSocket(server);
