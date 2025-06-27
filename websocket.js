// backend/websocket.js
const WebSocket = require('ws');
const { fetchWeather } = require('./weatherService');

let clients = [];
let citySubscriptions = {};

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.push(ws);

    ws.on('message', (msg) => {
      const { type, city } = JSON.parse(msg);
      if (type === 'subscribe' && city) {
        if (!citySubscriptions[city]) citySubscriptions[city] = [];
        citySubscriptions[city].push(ws);
        console.log(`Client subscribed to ${city}`);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients = clients.filter(c => c !== ws);
      Object.keys(citySubscriptions).forEach(city => {
        citySubscriptions[city] = citySubscriptions[city].filter(c => c !== ws);
      });
    });
  });

  setInterval(async () => {
    for (const city of Object.keys(citySubscriptions)) {
      try {
        const weatherData = await fetchWeather(city);
        const payload = JSON.stringify({ type: 'weather', city, data: weatherData });
        citySubscriptions[city].forEach(ws => {
          if (ws.readyState === WebSocket.OPEN) ws.send(payload);
        });
      } catch (e) {
        console.error('Error fetching weather:', e);
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

module.exports = { initWebSocket };
