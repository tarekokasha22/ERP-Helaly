import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Country = 'egypt' | 'libya';

type CountryContextType = {
  country: Country | null;
  setCountry: (country: Country) => void;
  selectedCountry: Country | null; // For backward compatibility
  setSelectedCountry: (country: Country) => void; // For backward compatibility
  isLoading: boolean;
  getCountryName: (country: Country) => string;
  getCountriesOptions: () => { value: Country; label: string; flag: string }[];
};

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

const countryMap = {
  egypt: { name: 'مصر (Egypt)', flag: '🇪🇬', nameEn: 'Egypt', nameAr: 'مصر' },
  libya: { name: 'ليبيا (Libya)', flag: '🇱🇾', nameEn: 'Libya', nameAr: 'ليبيا' },
};

export const CountryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load country from authenticated user data in localStorage
    const loadCountryFromUser = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.country && (user.country === 'egypt' || user.country === 'libya')) {
            setCountryState(user.country);
          }
        }
      } catch (error) {
        console.error('Error parsing user data for country:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountryFromUser();

    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadCountryFromUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);
    
    // Update user data in localStorage if user is logged in
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.country = newCountry;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error updating user country in localStorage:', error);
    }
  };

  const getCountryName = (countryCode: Country): string => {
    return countryMap[countryCode]?.name || countryCode;
  };

  const getCountriesOptions = () => [
    { 
      value: 'egypt' as Country, 
      label: countryMap.egypt.name, 
      flag: countryMap.egypt.flag 
    },
    { 
      value: 'libya' as Country, 
      label: countryMap.libya.name, 
      flag: countryMap.libya.flag 
    },
  ];

  const value = {
    country,
    setCountry,
    selectedCountry: country, // For backward compatibility
    setSelectedCountry: setCountry, // For backward compatibility
    isLoading,
    getCountryName,
    getCountriesOptions,
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}; 