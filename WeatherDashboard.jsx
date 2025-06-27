import React, { useState, useEffect } from 'react';
import { getWeather, saveWeather, getReport } from '../utils/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function WeatherDashboard() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [ws, setWs] = useState(null);
  const [report, setReport] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:4000');
    socket.onopen = () => console.log('WebSocket connected');
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'weather') {
        setWeather(msg.data);
        saveWeather(msg.data);
      }
    };
    setWs(socket);
    return () => socket.close();
  }, []);

  const handleSubscribe = () => {
    if (ws && city) {
      ws.send(JSON.stringify({ type: 'subscribe', city }));
    }
  };

  const handleGetWeather = async () => {
    const data = await getWeather(city);
    setWeather(data);
    saveWeather(data);
  };

  const handleDownloadReport = async (hours) => {
    const data = await getReport(hours);
    setReport(data);
  };

  // Chart Data
  const chartData = {
    labels: report.map((entry) =>
      new Date(entry.timestamp).toLocaleTimeString()
    ),
    datasets: [
      {
        label: 'Temperature °C',
        data: report.map((entry) => entry.temperature),
        fill: true,
        backgroundColor: 'rgba(34,211,238,0.2)',
        borderColor: 'rgba(34,211,238,1)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: 'white' },
      },
      title: {
        display: true,
        text: 'Temperature Trend',
        color: 'cyan',
      },
    },
    scales: {
      x: {
        ticks: { color: 'white' },
        grid: { color: '#444' },
      },
      y: {
        ticks: { color: 'white' },
        grid: { color: '#444' },
      },
    },
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-center text-cyan-400 mb-6">WeatherLive Dashboard</h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          className="form-control w-full sm:w-1/2 px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-cyan-400 bg-gray-700 placeholder-gray-400"
        />
        <button
          onClick={handleSubscribe}
          className="btn btn-info text-black font-semibold rounded-lg shadow hover:bg-cyan-300 transition"
        >
          Subscribe (WebSocket)
        </button>
        <button
          onClick={handleGetWeather}
          className="btn btn-outline-light font-semibold rounded-lg shadow hover:bg-cyan-500 hover:text-black transition"
        >
          Fetch Once
        </button>
      </div>

      {weather && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-8">
          <h3 className="text-2xl font-semibold text-cyan-300 mb-4">{weather.city}</h3>
          <div className="grid grid-cols-2 gap-4">
            <p className="bg-gray-700 rounded-md p-3">🌡️ Temperature: {weather.temperature} °C</p>
            <p className="bg-gray-700 rounded-md p-3">💧 Humidity: {weather.humidity} %</p>
            <p className="bg-gray-700 rounded-md p-3">💨 Wind Speed: {weather.windSpeed} m/s</p>
            <p className="bg-gray-700 rounded-md p-3">📜 Forecast: {weather.forecast}</p>
          </div>
        </div>
      )}

      <h2 className="text-3xl text-center text-cyan-400 mb-4">Download Report</h2>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => handleDownloadReport(1)}
          className="btn btn-success rounded-lg shadow hover:bg-green-400 transition"
        >
          Past 1 hour
        </button>
        <button
          onClick={() => handleDownloadReport(5)}
          className="btn btn-warning rounded-lg shadow hover:bg-yellow-400 transition"
        >
          Past 5 hours
        </button>
        <button
          onClick={() => handleDownloadReport(24)}
          className="btn btn-danger rounded-lg shadow hover:bg-red-400 transition"
        >
          Past 24 hours
        </button>
      </div>

      {report.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 shadow-lg mb-6">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-2xl text-cyan-300 mb-2">Report Data:</h3>
        {report.map((entry, idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg p-4 shadow-md">
            <div className="font-bold text-lg text-cyan-200 mb-2">
              {entry.city} @ {new Date(entry.timestamp).toLocaleString()}
            </div>
            <ul className="space-y-2">
              <li className="bg-gray-700 rounded-md p-2">🌡️ Temperature: {entry.temperature} °C</li>
              <li className="bg-gray-700 rounded-md p-2">💧 Humidity: {entry.humidity} %</li>
              <li className="bg-gray-700 rounded-md p-2">💨 Wind Speed: {entry.windSpeed} m/s</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
