
// Currency Service
// Fetches daily exchange rates for USD, EUR, GBP against TRY

const FALLBACK_RATES = {
    'USD': 34.50,
    'EUR': 37.20,
    'STG': 43.80,
    'TL': 1
};

export async function fetchLiveRates() {
    try {
        console.log('Fetching live currency rates...');

        // Using Frankfurter API (Free, no key required)
        // We fetch EUR base, then convert others if needed, or just fetch each against TRY?
        // Frankfurter 'from' is limited. Let's try fetching base EUR.
        const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY,USD,GBP');

        if (!res.ok) throw new Error('API request failed');

        const data = await res.json();

        // Rates from EUR
        const eurToTry = data.rates.TRY;
        const eurToUsd = data.rates.USD;
        // GBP (STG)
        const eurToGbp = data.rates.GBP;

        // Calculate Cross Rates to TRY
        const usdToTry = eurToTry / eurToUsd;
        const gbpToTry = eurToTry / eurToGbp;

        const rates = {
            'TL': 1,
            'EUR': parseFloat(eurToTry.toFixed(4)),
            'USD': parseFloat(usdToTry.toFixed(4)),
            'STG': parseFloat(gbpToTry.toFixed(4)) // GBP is often called STG locally
        };

        console.log('✅ Live rates fetched:', rates);
        return rates;

    } catch (error) {
        console.warn('⚠️ Currency fetch failed, using fallbacks:', error);
        return FALLBACK_RATES;
    }
}
