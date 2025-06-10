import React, { useState, useEffect } from 'react';
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
import { useResponsive } from '../hooks/useResponsive';
import { loadChartData, prepareChartData, chartOptions, ChartDataPoint } from '../data/200ma';
import '../styles/main.scss';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Sub-components
const Disclaimer: React.FC = () => (
  <div className="calculator-disclaimer-section">
    <div className="disclaimer">
      <h3>Important Disclaimer</h3>
      <p>
        The Stacking Sats visualizations are provided for informational and educational purposes
        only. They do not constitute financial advice. Do your own research.
      </p>
    </div>
  </div>
);

const ChartSection: React.FC<{
  data: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
}> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h3>Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="error-message">
        <h3>No Data Available</h3>
        <p>Unable to load chart data. Please try again later.</p>
      </div>
    );
  }

  const chartData = prepareChartData(data);

  return (
    <div className="calculator-results-section">
      <div className="chart-with-legend">
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="chart-info">
          <ul>
            <li>
              <span style={{ color: 'green' }}>●</span> High weight periods
            </li>
            <li>
              <span style={{ color: 'red' }}>●</span> Low weight periods
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main Calculator component
const Calculator: React.FC = () => {
  const { isSmallMobile, isTinyMobile } = useResponsive();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const containerClass = isTinyMobile
    ? 'home-container home-container-tiny'
    : isSmallMobile
    ? 'home-container home-container-small'
    : 'home-container';

  // Load chart data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await loadChartData();
        setChartData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
        console.error('Error loading chart data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className={containerClass} data-testid="calculator-container">
      <div className="resources-title">
        <img src="/hypertrial_logo.png" alt="Hypertrial Logo" className="hypertrial-logo" />
        <h1>Stacking Sats</h1>
        <p>Optimizing Bitcoin Dollar Cost Averaging</p>
      </div>

      <div className="calculator-container-wrapper">
        <div className="calculator-container">
          <h2>Beta Version 0.1</h2>
          <p className="calculator-description">
            Visualizing the relationship between Bitcoin price and model weights using our{' '}
            <a
              href="https://github.com/hypertrial/stacking_sats_pipeline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>200-day Moving Average model</strong>
            </a>
            . The chart shows how the model adjusts weights based on market conditions.
          </p>

          <div className="calculator-content">
            <Disclaimer />

            <ChartSection data={chartData} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
