import React, { useState } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/main.scss';

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

// Main Calculator component
const Calculator: React.FC = () => {
  const { isTinyMobile, isSmallMobile, isMobile, isTablet, isDesktopSmall } = useResponsive();
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

        {/* Video animation */}
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
