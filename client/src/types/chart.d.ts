import { ChartOptions } from 'chart.js';

// Extend Chart.js scale options for custom formatter callbacks
declare module 'chart.js' {
  interface ScaleTypeRegistry {
    linear: {
      options: {
        ticks: {
          callback: (value: number) => string;
        }
      }
    }
  }
} 