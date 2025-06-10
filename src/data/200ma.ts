// Frontend-compatible Bitcoin DCA calculator using 200-day Moving Average model

const CSV_URL = 'https://raw.githubusercontent.com/coinmetrics/data/master/csv/btc.csv';
const ROLL_N = 200;
const ALPHA = 1.25;
const MIN_W = 1e-5;

export interface PriceData {
  date: string;
  close: number | null;
  ma200: number | null;
  std200: number | null;
}

export interface WeightedData extends PriceData {
  weight: number;
}

// Simple CSV parser for browser use
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    return row;
  });
}

// Fetch and process Bitcoin price data
export async function fetchBitcoinPriceData(): Promise<PriceData[]> {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch price data: ${response.status}`);
    }

    const csvText = await response.text();
    const rawData = parseCSV(csvText);

    // Convert CSV data to our format
    const prices = rawData
      .map((row) => ({
        time: new Date(row.time),
        close: parseFloat(row.PriceUSD),
      }))
      .filter((p) => !isNaN(p.close) && !isNaN(p.time.getTime()))
      .sort((a, b) => a.time.getTime() - b.time.getTime());

    if (prices.length === 0) {
      throw new Error('No valid price data found in CSV');
    }

    // Build features with 200-day moving average and standard deviation
    const features: PriceData[] = prices.map((price, i) => {
      if (i < ROLL_N - 1) {
        return {
          date: price.time.toISOString().split('T')[0],
          close: price.close,
          ma200: null,
          std200: null,
        };
      }

      const window = prices.slice(i - ROLL_N + 1, i + 1).map((p) => p.close);
      const mean = window.reduce((sum, value) => sum + value, 0) / window.length;
      const variance =
        window.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / window.length;

      return {
        date: price.time.toISOString().split('T')[0],
        close: price.close,
        ma200: mean,
        std200: Math.sqrt(variance),
      };
    });

    return features;
  } catch (error) {
    console.error('Error fetching Bitcoin price data:', error);
    throw error;
  }
}

// Generate sample data as fallback
export function generateSamplePriceData(): PriceData[] {
  const data: PriceData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365); // Start from 1 year ago

  let currentPrice = 45000; // Starting BTC price
  const prices: number[] = [];

  // Generate price data for the past year
  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Simulate price movement with some randomness
    const volatility = 0.03; // 3% daily volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    currentPrice *= 1 + randomChange;

    // Add some trend (slight upward bias)
    currentPrice *= 1.0002;

    prices.push(currentPrice);

    // Calculate 200-day moving average and standard deviation
    let ma200: number | null = null;
    let std200: number | null = null;

    if (i >= ROLL_N - 1) {
      const window = prices.slice(i - ROLL_N + 1, i + 1);
      const mean = window.reduce((sum, price) => sum + price, 0) / window.length;
      const variance =
        window.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / window.length;
      ma200 = mean;
      std200 = Math.sqrt(variance);
    }

    data.push({
      date: date.toISOString().split('T')[0],
      close: currentPrice,
      ma200,
      std200,
    });
  }

  return data;
}

export function computeMonthlyWeights(priceData: PriceData[]): WeightedData[] {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const baseW = 1 / days.length;
  const weights = days.map(() => baseW);

  days.forEach((d, i) => {
    if (d > today) return;

    const dateStr = d.toISOString().split('T')[0];
    const pricePoint = priceData.find((p) => p.date === dateStr);

    if (
      !pricePoint ||
      pricePoint.ma200 === null ||
      pricePoint.std200 === null ||
      pricePoint.close === null ||
      !isFinite(pricePoint.ma200) ||
      !isFinite(pricePoint.std200) ||
      pricePoint.std200 <= 0 ||
      pricePoint.close >= pricePoint.ma200
    ) {
      return;
    }

    const z = (pricePoint.ma200 - pricePoint.close) / pricePoint.std200;
    const boosted = weights[i] * (1 + ALPHA * z);
    const excess = boosted - weights[i];

    if (excess <= 0) return;

    const futureCount = days.length - i - 1;
    if (futureCount === 0) return;

    const reduction = excess / futureCount;

    // Check if reduction would violate MIN_W constraint
    if (weights.slice(i + 1).some((w) => w - reduction < MIN_W)) {
      console.info(`Boost ${dateStr} skipped – MIN_W constraint.`);
      return;
    }

    weights[i] = boosted;
    for (let j = i + 1; j < weights.length; j++) {
      weights[j] -= reduction;
    }
  });

  // Sanity check
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (Math.abs(total - 1) > 1e-8 || weights.some((w) => w < MIN_W)) {
    throw new Error('Weight sanity check failed.');
  }

  return days.map((d, i) => {
    const dateStr = d.toISOString().split('T')[0];
    const pricePoint = priceData.find((p) => p.date === dateStr);

    return {
      date: dateStr,
      close: pricePoint?.close || null,
      ma200: pricePoint?.ma200 || null,
      std200: pricePoint?.std200 || null,
      weight: weights[i],
    };
  });
}
