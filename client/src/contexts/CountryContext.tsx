import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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

  const { user } = useAuth();

  useEffect(() => {
    if (user?.country) {
      setCountryState(user.country);
      setIsLoading(false);
    } else {
      // Fallback to storage if user not yet loaded in context but exists in storage (edge case)
      const loadCountryFromStorage = () => {
        try {
          const userData = sessionStorage.getItem('user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.country) {
              setCountryState(parsedUser.country);
            }
          }
        } catch (e) {
          console.error('Error loading country from storage:', e);
        } finally {
          setIsLoading(false);
        }
      };
      loadCountryFromStorage();
    }
  }, [user]);

  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);

    // Update user data in sessionStorage if user is logged in
    try {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        user.country = newCountry;
        sessionStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error updating user country in sessionStorage:', error);
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