
/**
 * Formats a value as currency
 * @param {number|string} value - The value to format
 * @param {string} currency - The currency code (TL, USD, EUR, STG)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'TL') {
    if (value == null) return '-';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '-';
    
    const formatted = numValue.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    return `${currency} ${formatted}`;
}

/**
 * Formats a number with Turkish locale
 * @param {number|string} value - The value to format
 * @returns {string} Formatted number string
 */
export function formatNumber(value) {
    if (value == null) return '0';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';

    return numValue.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
