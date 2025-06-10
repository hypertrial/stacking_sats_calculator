import React, { useState, ChangeEvent } from 'react';
import { useResponsive } from '../hooks/useResponsive';
import { CalculatedRow } from '../types';
import {
  computeMonthlyWeights,
  fetchBitcoinPriceData,
  generateSamplePriceData,
  WeightedData,
} from '../data/200ma';
import '../styles/main.scss';

// Utility functions
const formatCurrency = (amount: number, includeCents = true) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeCents ? 2 : 0,
    maximumFractionDigits: includeCents ? 2 : 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
};

const getCurrentMonthName = () => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months[new Date().getMonth()];
};

const formatInputValue = (value: string) => {
  const rawValue = value.replace(/[^0-9]/g, '');
  return rawValue ? parseInt(rawValue, 10).toLocaleString('en-US') : '';
};

// Sub-components
const Disclaimer: React.FC = () => (
  <div className="calculator-disclaimer-section">
    <div className="disclaimer">
      <h3>Important Disclaimer</h3>
      <p>
        The Stacking Sats Calculator is provided for informational and educational purposes only. It
        does not constitute financial advice. Do your own research.
      </p>
    </div>
  </div>
);

const InputSection: React.FC<{
  displayAmount: string;
  inputError: string | null;
  isLoading: boolean;
  onAmountChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}> = ({ displayAmount, inputError, isLoading, onAmountChange, onSubmit }) => (
  <div className="calculator-input-section">
    <form className="calculator-form" onSubmit={onSubmit}>
      <div className="input-group">
        <label htmlFor="usd-amount">USD Amount:</label>
        <div className="formatted-input-wrapper">
          <input
            id="usd-amount"
            type="text"
            value={displayAmount}
            onChange={onAmountChange}
            placeholder="Enter amount"
            className="formatted-input"
            required
          />
          {displayAmount && <div className="dollar-sign">$</div>}
        </div>
      </div>

      {inputError && (
        <div className="input-error-message">
          <span className="warning-icon">⚠️</span>
          <div>
            <strong>Input Limit Reached</strong>
            <p>{inputError}</p>
          </div>
        </div>
      )}

      <button type="submit" disabled={isLoading || !displayAmount.trim()}>
        {isLoading ? 'Calculating...' : 'Calculate'}
      </button>
    </form>
  </div>
);

const ResultsTable: React.FC<{ data: CalculatedRow[] }> = ({ data }) => (
  <div className="table-container">
    <table className="results-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Weight</th>
          <th>USD Amount</th>
          <th>Status</th>
          {data.some((row) => row.close !== null) && <th>BTC Price</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className={row.isPast ? 'past-date' : 'future-date'}>
            <td>{formatDate(row.date)}</td>
            <td>{(row.weight * 100).toFixed(2)}%</td>
            <td>{formatCurrency(row.usdAmount)}</td>
            <td>{row.isPast ? 'Past' : 'Future'}</td>
            {data.some((row) => row.close !== null) && (
              <td>{row.close ? formatCurrency(row.close) : '-'}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Main Calculator component
const Calculator: React.FC = () => {
  const { isSmallMobile, isTinyMobile } = useResponsive();
  const [usdAmount, setUsdAmount] = useState<string>('');
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [calculatedData, setCalculatedData] = useState<CalculatedRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const containerClass = isTinyMobile
    ? 'home-container home-container-tiny'
    : isSmallMobile
    ? 'home-container home-container-small'
    : 'home-container';

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    setInputError(null);

    if (rawValue.length > 6) {
      setInputError(
        'Maximum input amount is $999,999. Our models are designed for retail budgets under $1 million.'
      );
      const limitedValue = rawValue.substring(0, 6);
      setUsdAmount(limitedValue);
      setDisplayAmount(formatInputValue(limitedValue));
    } else {
      setUsdAmount(rawValue);
      setDisplayAmount(formatInputValue(rawValue));
    }
  };

  const calculateStackingSats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let priceData;
      try {
        priceData = await fetchBitcoinPriceData();
      } catch (fetchError) {
        console.warn('Failed to fetch real price data, using sample data:', fetchError);
        priceData = generateSamplePriceData();
      }

      const monthlyWeights = computeMonthlyWeights(priceData);
      const parsedAmount = parseFloat(usdAmount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Please enter a valid USD amount');
      }

      const calculatedRows: CalculatedRow[] = monthlyWeights.map((item: WeightedData) => {
        const dailyUsdAmount = parsedAmount * item.weight;
        const btcAmount = item.close ? dailyUsdAmount / item.close : undefined;
        const isPast = item.close !== null;

        return {
          date: item.date,
          weight: item.weight,
          close: item.close,
          ma200: item.ma200,
          std200: item.std200,
          usdAmount: dailyUsdAmount,
          btcAmount,
          isPast,
        };
      });

      setCalculatedData(calculatedRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateStackingSats();
  };

  return (
    <div className={containerClass} data-testid="calculator-container">
      <div className="resources-title">
        <img src="/hypertrial_logo.png" alt="Hypertrial Logo" className="hypertrial-logo" />
        <h1>Stacking Sats Calculator</h1>
        <p>Optimizing Bitcoin Dollar Cost Averaging</p>
      </div>

      <div className="calculator-container-wrapper">
        <div className="calculator-container">
          <h2>Beta Version 0.1</h2>
          <p className="calculator-description">
            Calculate how to stack sats optimally across {getCurrentMonthName()} using a simple{' '}
            <a
              href="https://github.com/hypertrial/stacking_sats_pipeline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>200-day Moving Average model</strong>
            </a>
            .
          </p>

          <div className="calculator-content">
            <Disclaimer />

            <InputSection
              displayAmount={displayAmount}
              inputError={inputError}
              isLoading={isLoading}
              onAmountChange={handleAmountChange}
              onSubmit={handleSubmit}
            />

            {error && <div className="error-message">{error}</div>}

            {isLoading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
              </div>
            )}

            {!isLoading && calculatedData.length > 0 && (
              <div className="calculator-results-section">
                <p className="summary-text">
                  Your {formatCurrency(parseFloat(usdAmount), false)} investment for{' '}
                  {getCurrentMonthName()} divided across {calculatedData.length} days:
                </p>
                <ResultsTable data={calculatedData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
