//========Composant charJS pour visualiser la variation des prix d'une crypto=======

'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function NegativeBarChart() {
  const labels = ['BTC', 'ETH', 'BNB', 'XRP', 'SOL'];
  const values = [4, -3, 1, -6, 2]; // Exemple avec des négatifs

  const data = {
    labels,
    datasets: [
      {
        label: 'Variation (%)',
        data: values,
        backgroundColor: values.map((val) => (val < 0 ? '#ef4444' : '#22c55e')), // rouge si < 0, vert sinon
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="w-[40em] bg-[#212c44] rounded-xl">
      <Bar data={data} options={options} />
    </div>
  );
}
