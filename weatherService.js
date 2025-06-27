// backend/weatherService.js
const axios = require('axios');

const API_KEY = '9936e29b72ae6b9ca7f4ded198c5a147';

async function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const res = await axios.get(url);
  return {
    city: res.data.name,
    temperature: res.data.main.temp,
    humidity: res.data.main.humidity,
    windSpeed: res.data.wind.speed,
    forecast: res.data.weather[0].description,
    timestamp: new Date()
  };
}

module.exports = { fetchWeather };
