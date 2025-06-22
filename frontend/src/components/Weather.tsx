import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { WeatherData } from '../services/weatherApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherChartProps {
  weatherData: WeatherData[];
}

const WeatherChart: React.FC<WeatherChartProps> = ({ weatherData }) => {
  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="weather-chart-loading">
        <p>Loading weather data...</p>
      </div>
    );
  }

  const data = {
    labels: weatherData.map(item => item.time),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: weatherData.map(item => item.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Pressure (hPa)',
        data: weatherData.map(item => item.pressure),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Weather Forecast',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Pressure (hPa)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="weather-chart">
      <Line data={data} options={options} />
    </div>
  );
};

export default WeatherChart;