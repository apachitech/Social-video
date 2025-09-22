import React, { createContext, useContext } from 'react';

// The function signature for our currency formatter
type CurrencyFormatter = (amount: number) => string;

// A default formatter that does nothing special, to avoid errors if context is used without a provider
const defaultFormatter: CurrencyFormatter = (amount) => `$${amount.toFixed(2)}`;

export const CurrencyContext = createContext<CurrencyFormatter>(defaultFormatter);

export const useCurrency = (): CurrencyFormatter => {
  return useContext(CurrencyContext);
};
