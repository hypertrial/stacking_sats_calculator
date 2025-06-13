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
    const response = await fetch('./strategytemplate_weights.csv');
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

  // Calculate 75th percentile weight
  const weights = data.map((item) => item.modelWeight).sort((a, b) => a - b);
  const percentile75Index = Math.floor(weights.length * 0.75);
  const percentile75Weight = weights[percentile75Index];

  return {
    labels,
    datasets: [
      {
        label: 'Bitcoin Price',
        data: data.map((item) => item.bitcoinPrice),
        borderColor: function (context: any) {
          // Color line segments based on model weight
          if (context.type === 'data') {
            const index = context.dataIndex;
            if (index < data.length) {
              return data[index].modelWeight > percentile75Weight
                ? 'rgb(255, 102, 0)' // Orange for higher allocation (color-blind friendly)
                : 'rgb(0, 102, 204)'; // Blue for standard allocation (color-blind friendly)
            }
          }
          return 'rgba(128, 128, 128, 1)'; // Default gray
        },
        segment: {
          borderColor: function (ctx: any) {
            // Color each line segment based on the starting point's weight
            const startIndex = ctx.p0DataIndex;
            if (startIndex < data.length) {
              return data[startIndex].modelWeight > percentile75Weight
                ? 'rgb(255, 102, 0)' // Orange for higher allocation (color-blind friendly)
                : 'rgb(0, 102, 204)'; // Blue for standard allocation (color-blind friendly)
            }
            return 'rgba(128, 128, 128, 1)';
          },
        },
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
        pointRadius: 0, // Remove points to emphasize colored line
        yAxisID: 'y-price',
        tension: 0.1,
        borderWidth: 3, // Thicker line to show colors better
      },
    ],
  };
}

// Chart.js options for Bitcoin price time series
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    title: {
      display: true,
      text: 'BTC-USD (2020-2024)',
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
        text: 'BTC-USD',
      },
      ticks: {
        callback: function (value: any) {
          return '$' + value.toLocaleString();
        },
      },
    },
  },
  // Enhanced responsive behavior
  onResize: function (chart: any, _size: any) {
    // Force chart to redraw on resize
    chart.update('none');
  },
};

// Generate responsive chart options based on screen size
export function getResponsiveChartOptions(screenWidth: number) {
  const isTinyMobile = screenWidth <= 480;
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth <= 968;

  return {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'BTC-USD (2020-2024)',
        font: {
          size: isTinyMobile ? 12 : isMobile ? 14 : 16,
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: isTinyMobile ? 10 : isMobile ? 12 : 14,
          },
        },
        ticks: {
          maxTicksLimit: isTinyMobile ? 8 : isMobile ? 12 : isTablet ? 16 : 20,
          font: {
            size: isTinyMobile ? 9 : isMobile ? 10 : 12,
          },
        },
      },
      'y-price': {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'BTC-USD',
          font: {
            size: isTinyMobile ? 10 : isMobile ? 12 : 14,
          },
        },
        ticks: {
          callback: function (value: any) {
            const formattedValue = '$' + value.toLocaleString();
            // Shorter format for mobile
            if (isTinyMobile && value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'k';
            }
            return formattedValue;
          },
          font: {
            size: isTinyMobile ? 9 : isMobile ? 10 : 12,
          },
        },
      },
    },
    // Enhanced responsive behavior
    onResize: function (chart: any, _size: any) {
      // Force chart to redraw on resize
      setTimeout(() => {
        chart.update('none');
      }, 100);
    },
  };
}
