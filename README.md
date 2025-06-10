# Stacking Sats Calculator

A React TypeScript web application for optimizing Bitcoin Dollar-Cost Averaging (DCA) strategy using a 200-day moving average model.

**Stacking Sats - A [Hypertrial.ai](https://www.hypertrial.ai) Open-Source Initiative**

For the underlying backtesting framework and strategy development, see: [stacking_sats_pipeline](https://github.com/hypertrial/stacking_sats_pipeline)

## Features

- **Smart DCA Strategy**: Uses 200-day moving average to optimize Bitcoin purchase timing
- **Weight Allocation**: Calculates optimal daily purchase amounts for current month
- **Responsive Design**: Works across all devices
- **TypeScript**: Fully typed development experience

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## How It Works

1. **Price Analysis**: Compares Bitcoin price to 200-day moving average
2. **Z-Score Calculation**: Measures price deviation from average
3. **Weight Adjustment**: Increases purchases when price is undervalued
4. **Budget Maintenance**: Respects total monthly budget while optimizing timing

## Usage

1. Enter your monthly DCA amount (up to $999,999)
2. Click "Calculate" to generate optimized daily purchase schedule
3. Review results showing dates, weights, amounts, and simulated prices

## Build

```bash
npm run build
```

## Disclaimer

Educational purposes only. Not financial advice. Cryptocurrency investments carry significant risk.

## License

Licensed under the terms in the LICENSE file.