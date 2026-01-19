import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define all supported currencies
export type CurrencyCode = 'USD' | 'EGP';

interface ExchangeRates {
  [key: string]: number;
}

// Create the currency context
type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  exchangeRate: number;
  formatMoney: (amount: number) => string;
  convertCurrency: (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => number;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    // Try to get currency from localStorage or default to EGP
    const savedCurrency = localStorage.getItem('currency') as CurrencyCode;
    return savedCurrency || 'EGP';
  });

  // Exchange rates with USD as base (to be updated with real API)
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USD: 1,
    EGP: 30.90, // Default fallback rate
  });

  // Save currency preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Fetch exchange rates from API
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // Using ExchangeRate API (replace with your preferred API)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (data && data.rates) {
          setExchangeRates({
            USD: 1,
            EGP: data.rates.EGP || 30.90, // Use API rate or fallback
          });
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        // Keep using the fallback rates
      }
    };

    fetchExchangeRates();
    
    // Set up interval to refresh rates (every hour)
    const intervalId = setInterval(fetchExchangeRates, 3600000);
    
    // Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Current exchange rate for the selected currency (relative to USD)
  const exchangeRate = exchangeRates[currency] || 1;

  // Format money value based on current currency
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
    }).format(amount);
  };

  // Convert between currencies
  const convertCurrency = (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
    // Convert to USD first (as base currency), then to target currency
    const amountInUSD = fromCurrency === 'USD' ? amount : amount / exchangeRates[fromCurrency];
    return toCurrency === 'USD' ? amountInUSD : amountInUSD * exchangeRates[toCurrency];
  };

  const value = {
    currency,
    setCurrency,
    exchangeRate,
    formatMoney,
    convertCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 