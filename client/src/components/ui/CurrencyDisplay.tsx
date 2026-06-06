import React from 'react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface CurrencyDisplayProps {
  amount: number;
  originalCurrency: 'USD' | 'EGP';
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ amount, originalCurrency }) => {
  const { currency, convertCurrency, formatMoney } = useCurrency();
  const { t } = useLanguage();
  
  // Convert the amount to the currently selected currency
  const convertedAmount = convertCurrency(amount, originalCurrency, currency);
  
  // Format the amount according to the selected currency
  const formattedAmount = formatMoney(convertedAmount);
  
  return (
    <span className="currency-display">
      {formattedAmount}
    </span>
  );
};

export default CurrencyDisplay; 