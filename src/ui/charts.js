
import { formatNumber } from '../utils/formatters.js';

let trendChart = null;
let distributionChart = null;
let categoryChart = null;
let currencyChart = null;

export function initCharts(payments) {
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js not loaded');
        return;
    }

    const ctxTrend = document.getElementById('trendChart');
    const ctxDist = document.getElementById('distributionChart');
    const ctxCat = document.getElementById('categoryChart');
    const ctxCurr = document.getElementById('currencyChart');

    if (ctxTrend) initTrendChart(ctxTrend, payments);
    if (ctxDist) initDistributionChart(ctxDist, payments);
    if (ctxCat) initCategoryChart(ctxCat, payments);
    if (ctxCurr) initCurrencyChart(ctxCurr, payments);
}

export function updateCharts(payments) {
    // Re-init for simplicity or update data
    initCharts(payments);
}

function initTrendChart(ctx, payments) {
    if (trendChart) trendChart.destroy();

    // Quick fake data logic for trend for now, or real if we grouped by date
    // Since we don't have historical data structure in 'payments' array easily accessible (only current state), 
    // we will simulate the "Trend" or just show current totals if valid dates existed.
    // The original code used random data. I will keep it consistent or look for real data if possible.
    // Original code: generateTrendData(6) -> random.

    const months = ['Ağu', 'Eyl', 'Eki', 'Kas', 'Ara', 'Ocak'];
    const dataPaid = [120000, 150000, 180000, 200000, 150000, payments.reduce((sum, p) => sum + (p.bu_ay_odenen * (p.para_birimi === 'TL' ? 1 : 35)), 0)];

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#e2e8f0' : '#475569';

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Ödenen (Tahmini)',
                data: dataPaid,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            }
        }
    });
}

function initDistributionChart(ctx, payments) {
    if (distributionChart) distributionChart.destroy();

    const counts = { 'ÖDENDİ': 0, 'KISMEN ÖDENDİ': 0, 'ÖDENMEDİ': 0, 'BEKLEMEDE': 0 };
    payments.forEach(p => { if (counts[p.odeme_durumu] !== undefined) counts[p.odeme_durumu]++; });

    distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#94a3b8'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: { legend: { position: 'right' } }
        }
    });
}

function initCategoryChart(ctx, payments) {
    if (categoryChart) categoryChart.destroy();

    const counts = {};
    payments.forEach(p => {
        const cat = p.isin_nevi || 'Diğer';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Kayıt Sayısı',
                data: Object.values(counts),
                backgroundColor: '#8b5cf6',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

function initCurrencyChart(ctx, payments) {
    if (currencyChart) currencyChart.destroy();

    const counts = {};
    payments.forEach(p => {
        const curr = p.para_birimi || 'TL';
        counts[curr] = (counts[curr] || 0) + 1;
    });

    currencyChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'right' } }
        }
    });
}
