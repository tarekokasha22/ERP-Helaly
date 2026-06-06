/// <reference types="react-scripts" />

declare module 'react-query' {
  export function useQuery<TData = unknown, TError = unknown>(
    queryKey: string | readonly unknown[],
    queryFn: () => Promise<TData>,
    options?: any
  ): {
    data: TData | undefined;
    isLoading: boolean;
    error: TError | null;
    refetch: () => Promise<any>;
  };
}

declare module 'chart.js' {
  export const Chart: any;
  export const ArcElement: any;
  export const Tooltip: any;
  export const Legend: any;
  export const CategoryScale: any;
  export const LinearScale: any;
  export const BarElement: any;
  export const Title: any;
  export const PointElement: any;
  export const LineElement: any;

  export function register(...components: any[]): void;
}

declare module 'react-chartjs-2' {
  export const Pie: React.FC<any>;
  export const Bar: React.FC<any>;
  export const Line: React.FC<any>;
}

declare module 'react-toastify' {
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
  export const ToastContainer: React.FC<any>;
} 