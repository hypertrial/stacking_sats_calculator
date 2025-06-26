import React, { useState, useEffect, useRef } from 'react';
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
import {
  loadChartData,
  prepareChartData,
  getResponsiveChartOptions,
  ChartDataPoint,
} from '../data/strategy';
import '../styles/main.scss';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Sub-components
const Disclaimer: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  const handleClick = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className="page-disclaimer">
      <div
        className="disclaimer-banner clickable"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <h3>Disclaimer</h3>
        <p>
          {isHovered
            ? 'I understand and accept these terms'
            : 'Stacking Sats is provided for informational and educational purposes only. It does not constitute financial advice. Do your own research.'}
        </p>
      </div>
    </div>
  );
};

const PerformanceMetric: React.FC = () => (
  <div className="performance-metric-compact">
    <div className="performance-box-small">
      <div className="metric-value-compact">
        <span className="percentage-small">52.57%</span>
        <p className="metric-description-small">More BTC accumulated vs standard DCA (2020–2024)</p>
      </div>
    </div>
  </div>
);

const ChartSection: React.FC<{
  data: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
}> = ({ data, isLoading, error }) => {
  const { screenWidth } = useResponsive();
  const chartRef = useRef<any>(null);
  const [chartKey, setChartKey] = useState(0);

  // Force chart refresh when screen size changes significantly
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;

      // Force chart to resize and redraw
      setTimeout(() => {
        chart.resize();
        chart.update('none');
      }, 150); // Small delay to ensure CSS transitions complete
    }

    // Update chart key for breakpoint changes to force re-render
    setChartKey((prev) => prev + 1);
  }, [screenWidth]);

  // Debounced resize effect for better performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [screenWidth]);

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
  const responsiveOptions = getResponsiveChartOptions(screenWidth);

  return (
    <div style={{ background: 'transparent' }}>
      {/* Video removed from here - moved to main component */}
    </div>
  );
};

// Main Calculator component
const Calculator: React.FC = () => {
  const { isTinyMobile, isSmallMobile, isMobile, isTablet, isDesktopSmall } = useResponsive();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState<boolean>(true);

  // Dynamic container class based on screen size
  const getContainerClass = () => {
    const disclaimerClass = isDisclaimerVisible ? ' has-page-disclaimer' : '';

    if (isTinyMobile) return `home-container home-container-tiny${disclaimerClass}`;
    if (isSmallMobile) return `home-container home-container-small${disclaimerClass}`;
    if (isMobile) return `home-container home-container-mobile${disclaimerClass}`;
    if (isTablet) return `home-container home-container-tablet${disclaimerClass}`;
    if (isDesktopSmall) return `home-container home-container-desktop-small${disclaimerClass}`;
    return `home-container${disclaimerClass}`;
  };

  const containerClass = getContainerClass();

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
      <Disclaimer onDismiss={() => setIsDisclaimerVisible(false)} />

      <div className="resources-title">
        <a
          href="https://hypertrial.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hypertrial-logo-link"
        >
          <img src="./hypertrial_logo.png" alt="Hypertrial Logo" className="hypertrial-logo" />
        </a>
        <h1>Stacking Sats</h1>
        <p>Optimizing Bitcoin Accumulation for Institutional Investors</p>
        <PerformanceMetric />

        {/* Video moved here - above the action buttons */}
        <div className="video-section">
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              background: 'transparent',
              border: '2px solid white',
              borderRadius: '8px',
            }}
          >
            <source src="./spiral_Jun_25_17_37.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="action-buttons">
          <a
            href="https://github.com/hypertrial/stacking_sats_pipeline"
            target="_blank"
            rel="noopener noreferrer"
            className="action-button contribute-button"
          >
            For Talent: Contribute
          </a>
          <a href="mailto:mohammad@trilemmacapital.com" className="action-button contact-button">
            For Investors: Contact
          </a>
        </div>
      </div>

      <div className="calculator-container-wrapper">
        <div className="calculator-container">
          <div className="calculator-content">
            <ChartSection data={chartData} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>

      {/* Footer with Hypertrial logo - same style as header */}
      <footer className="footer-section">
        <a
          href="https://hypertrial.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hypertrial-logo-link"
        >
          <img src="./hypertrial_logo.png" alt="Hypertrial Logo" className="hypertrial-logo" />
        </a>
      </footer>
    </div>
  );
};

export default Calculator;
