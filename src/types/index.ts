export interface StackingSatsData {
  date: string;
  weight: number;
  close?: number | null;
  ma200?: number | null;
  std200?: number | null;
}

export interface CalculatedRow extends StackingSatsData {
  usdAmount: number;
  btcAmount?: number;
  isPast: boolean;
}

export interface DCAWeightConfig {
  rollN: number;
  alpha: number;
  minWeight: number;
}

export interface PriceData {
  date: string;
  price: number;
}
