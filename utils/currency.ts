// Mock exchange rates relative to USD
const MOCK_RATES: { [key: string]: number } = {
    'EUR': 0.93,
    'JPY': 157.2,
    'GBP': 0.79,
    'CAD': 1.37,
    'AUD': 1.51,
    'INR': 83.4
};

// Mapping from locale prefixes to currency codes
const LOCALE_CURRENCY_MAP: { [key: string]: string } = {
    'en-gb': 'GBP',
    'en-au': 'AUD',
    'en-ca': 'CAD',
    'en-in': 'INR',
    'de': 'EUR',
    'fr': 'EUR',
    'es': 'EUR',
    'it': 'EUR',
    'nl': 'EUR',
    'pt': 'EUR',
    'fi': 'EUR',
    'ja': 'JPY',
};

export interface CurrencyInfo {
    locale: string;
    currency: string;
    rate: number;
}

export const getCurrencyInfoForLocale = (locale: string): CurrencyInfo => {
    const defaultInfo = { locale: 'en-US', currency: 'USD', rate: 1 };
    const lowerCaseLocale = locale.toLowerCase();

    // Check for specific locale matches first (e.g., 'en-gb')
    if (LOCALE_CURRENCY_MAP[lowerCaseLocale]) {
        const currency = LOCALE_CURRENCY_MAP[lowerCaseLocale];
        return { locale, currency, rate: MOCK_RATES[currency] };
    }

    // Check for language prefix matches (e.g., 'de' for 'de-DE')
    const lang = lowerCaseLocale.split('-')[0];
    if (LOCALE_CURRENCY_MAP[lang]) {
        const currency = LOCALE_CURRENCY_MAP[lang];
        return { locale, currency, rate: MOCK_RATES[currency] };
    }

    return defaultInfo;
};
