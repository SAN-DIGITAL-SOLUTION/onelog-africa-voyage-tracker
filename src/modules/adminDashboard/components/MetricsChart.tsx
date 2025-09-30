import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

export default function MetricsChart({ data, labels, title }: { data: number[]; labels: string[]; title?: string }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title || 'Métriques',
        data,
        fill: false,
        borderColor: '#2563eb',
        tension: 0.1,
      },
    ],
  };
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #eee' }}>
      <Line data={chartData} />
    </div>
  );
}
