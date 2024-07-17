import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

const ChartComponent = ({ averageRatingsData }) => {
  const { t } = useTranslation(); // Utilisation de useTranslation pour accéder aux traductions

  const chartData = {
    labels: averageRatingsData.map(item => item.song_title),
    datasets: [
      {
        label: t('Average Rating'), // Utilisation de t() pour traduire le label
        data: averageRatingsData.map(item => item.average_rating),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: 'category', // Utilisation de la catégorie comme échelle de l'axe x
      },
      y: {
        beginAtZero: true, // Commencer l'axe y à zéro
      },
    },
  };

  return (
    <div>
      <h2>{t('Average Rating Evolution')}</h2> {/* Utilisation de t() pour traduire le titre */}
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default ChartComponent;
