
import { showToast } from './notifications.js';

// Reports Module
// Handles data aggregation, filtering, and chart rendering for the Reports view.

let reportsChartInstances = {};

export function initReports(payments, currencyRates) {
    if (!payments || payments.length === 0) return;

    // Listeners
    const elPeriod = document.getElementById('reportPeriod');
    const elCurrency = document.getElementById('reportCurrency');

    if (elPeriod) elPeriod.addEventListener('change', () => updateReportView(payments, currencyRates));
    if (elCurrency) elCurrency.addEventListener('change', () => updateReportView(payments, currencyRates));

    // Initial Load
    updateReportView(payments, currencyRates);
}

export function updateReportView(allPayments, rates) {
    const period = document.getElementById('reportPeriod')?.value || 'all';
    const targetCurrency = document.getElementById('reportCurrency')?.value || 'TL';

    // 1. Filter Data by Period
    const filtered = filterByPeriod(allPayments, period);

    // 2. Normalize Amounts to Target Currency
    const normalizedData = filtered.map(p => {
        const pCurrency = p.para_birimi || 'TL';
        const rate = getCrossRate(pCurrency, targetCurrency, rates);

        return {
            ...p,
            _kalan: (p.kalan || 0) * rate,
            _toplam: (p.toplam_borc || 0) * rate,
            _odenen: (p.bu_ay_odenen || 0) * rate
        };
    });

    // 3. Update Text KPIs
    updateKPIs(normalizedData, targetCurrency);

    // 4. Render Charts
    renderCashFlowChart(normalizedData, targetCurrency);
    renderCurrencyRiskChart(normalizedData); // Based on count or raw volume? Volume better.
    renderTopProjects(normalizedData, targetCurrency);

    // Update Print Header
    document.getElementById('reportDateRange').innerText = `Rapor Dönemi: ${period.toUpperCase()} - Baz Kur: ${targetCurrency}`;
}

// --- Helpers ---

function getCrossRate(from, to, ratesMap) {
    if (from === to) return 1;
    // Map is relative to TL usually: { USD: 34, EUR: 37, ... }
    // If our map is base TL (1 USD = 34 TL)

    const validMap = {
        'TL': 1,
        'USD': ratesMap.USD || 34.50,
        'EUR': ratesMap.EUR || 37.20,
        'STG': ratesMap.STG || 43.80
    };

    const fromRate = validMap[from] || 1;
    const toRate = validMap[to] || 1;

    // Convert From -> TL -> To
    return fromRate / toRate;
}

function filterByPeriod(data, period) {
    if (period === 'all') return data;

    const now = new Date();
    // Simplified filtering based on creation date or assigned period
    // Since data has 'donem' text 'OCAK 2026', we might need robust parsing.
    // tailored for the provided 'FERİT ABİ' data which is mostly static or has 'donem' column.

    return data; // Placeholder until Date parsing is robust
}

function updateKPIs(data, currency) {
    const totalDebt = data.reduce((acc, curr) => acc + curr._kalan, 0);
    const totalPaid = data.reduce((acc, curr) => acc + curr._odenen, 0);
    const avgCost = data.length ? (totalDebt + totalPaid) / data.length : 0;

    const fmt = (v) => `${currency === 'TL' ? '₺' : currency + ' '}${v.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;

    document.getElementById('kpiTotalDebt').innerText = fmt(totalDebt);
    document.getElementById('kpiMonthlyPaid').innerText = fmt(totalPaid);
    document.getElementById('kpiAvgCost').innerText = fmt(avgCost);
}

// --- Charts ---

function renderCashFlowChart(data, currency) {
    const ctx = document.getElementById('cashFlowChart');
    if (!ctx) return;

    // Aggregate by Category or Status? Let's do By Category for Waterfall
    // Or Income vs Expense? We only have Expense.
    // Let's show: Top 7 Categories (Nevi) 

    const grouped = {};
    data.forEach(p => {
        const key = p.isin_nevi || 'Diğer';
        grouped[key] = (grouped[key] || 0) + p._toplam;
    });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    if (reportsChartInstances.cashFlow) reportsChartInstances.cashFlow.destroy();

    reportsChartInstances.cashFlow = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Toplam Maliyet (${currency})`,
                data: values,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function renderCurrencyRiskChart(data) {
    const ctx = document.getElementById('currencyRiskChart');
    if (!ctx) return;

    // Group by Original Currency
    const grouped = {};
    data.forEach(p => {
        const c = p.para_birimi || 'TL';
        // We calculate value in TL to show Magnitude of risk
        const valueInTL = p.toplam_borc * (p.para_birimi === 'USD' ? 34 : p.para_birimi === 'EUR' ? 37 : 1);
        // Note: Using hardcoded estimate for purely relative pie visualization or pass rates.
        // Better to use Normalized _toplam * Rate(To->TL) if we saved it.
        // Simplified: Count or Raw Sum?
        // Let's count items for simplicity or sum totals.
        grouped[c] = (grouped[c] || 0) + 1; // Count of invoices
    });

    if (reportsChartInstances.risk) reportsChartInstances.risk.destroy();

    reportsChartInstances.risk = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(grouped),
            datasets: [{
                data: Object.values(grouped),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

function renderTopProjects(data, currency) {
    const tbody = document.getElementById('topProjectsBody');
    if (!tbody) return;

    // Group By Project (isin_adi)
    const grouped = {};
    data.forEach(p => {
        const key = p.isin_adi || 'Genel';
        grouped[key] = (grouped[key] || 0) + p._toplam;
    });

    // Sort and Take Top 5
    const sorted = Object.entries(grouped)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    tbody.innerHTML = sorted.map(([name, val]) => `
        <tr>
            <td>
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-primary"></div>
                    ${name}
                </div>
            </td>
            <td class="text-right font-medium">
                ${val.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </td>
        </tr>
    `).join('');
}
