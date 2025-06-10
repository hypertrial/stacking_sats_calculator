// Data loading and processing for plotting model weights and Bitcoin price time series

export interface ChartDataPoint {
  date: string;
  modelWeight: number;
  weightPercent: number;
  bitcoinPrice: number;
}

// Load data from the CSV file
export async function loadChartData(): Promise<ChartDataPoint[]> {
  try {
    const response = await fetch('/strategytemplate_weights.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV data: ${response.status}`);
    }

    const csvText = await response.text();
    return parseCSVData(csvText);
  } catch (error) {
    console.error('Error loading chart data:', error);
    throw error;
  }
}

// Parse CSV data into chart format
function parseCSVData(csvText: string): ChartDataPoint[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  // Skip header row
  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(',');

      return {
        date: values[0].trim(),
        modelWeight: parseFloat(values[1]),
        weightPercent: parseFloat(values[2]),
        bitcoinPrice: parseFloat(values[3]),
      };
    })
    .filter(
      (item) => !isNaN(item.modelWeight) && !isNaN(item.weightPercent) && !isNaN(item.bitcoinPrice)
    );
}

// Get color for weight based on value (red for low, green for high)
export function getWeightColor(weight: number, alpha: number = 1): string {
  // Normalize weight to 0-1 range for color interpolation
  // Assuming weights typically range from 0.001 to 0.02 based on CSV data
  const minWeight = 0.001;
  const maxWeight = 0.02;
  const normalizedWeight = Math.max(0, Math.min(1, (weight - minWeight) / (maxWeight - minWeight)));

  // Interpolate between red (low) and green (high)
  const red = Math.round(255 * (1 - normalizedWeight));
  const green = Math.round(255 * normalizedWeight);
  const blue = 0;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

// Prepare data for Chart.js
export function prepareChartData(data: ChartDataPoint[]) {
  const labels = data.map((item) => item.date);

  // Calculate median weight
  const weights = data.map((item) => item.modelWeight).sort((a, b) => a - b);
  const medianWeight = weights[Math.floor(weights.length / 2)];

  // Create point colors based on whether weight is above median
  const pointColors = data.map((item) =>
    item.modelWeight > medianWeight ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)'
  );

  return {
    labels,
    datasets: [
      {
        label: 'Bitcoin Price',
        data: data.map((item) => item.bitcoinPrice),
        borderColor: 'rgba(128, 128, 128, 1)', // Gray border for the line
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 3,
        yAxisID: 'y-price',
        tension: 0.1,
        borderWidth: 1,
      },
    ],
  };
}

// Chart.js options for Bitcoin price time series
export const chartOptions = {
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    title: {
      display: true,
      text: 'Bitcoin Price Over Time (Green = High Model Weight, Red = Low Model Weight)',
    },
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date',
      },
      ticks: {
        maxTicksLimit: 20, // Limit number of date labels
      },
    },
    'y-price': {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Bitcoin Price (USD)',
      },
      ticks: {
        callback: function (value: any) {
          return '$' + value.toLocaleString();
        },
      },
    },
  },
};
