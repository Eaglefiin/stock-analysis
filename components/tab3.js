import { fetchSheet } from '../js/api.js';

export async function renderTab3(sheetId) {
  const content = document.getElementById('tab3-content');
  const loading = document.getElementById('tab3-loading');

  loading.style.display = 'block';
  content.innerHTML = '';

  const table = await fetchSheet(sheetId, 'Sheet1');
  if (!table) {
    loading.style.display = 'none';
    content.innerHTML = '<div class="error-msg">Không thể tải dữ liệu.</div>';
    return;
  }

  // Kỳ nằm trong cols, bắt đầu từ index 2
  const periods = [];
  for (let i = 2; i < table.cols.length; i++) {
    if (table.cols[i] && table.cols[i].label) {
      periods.push(table.cols[i].label);
    }
  }

  // Data nằm trong rows, cột bắt đầu từ index 2
  const laptops   = getRowData(table, 0, periods.length);
  const phone     = getRowData(table, 1, periods.length);
  const office    = getRowData(table, 2, periods.length);
  const homeApp   = getRowData(table, 3, periods.length);
  const consumer  = getRowData(table, 4, periods.length);
  const revenue   = getRowData(table, 5, periods.length);
  const netProfit = getRowData(table, 6, periods.length);

  // Lấy 12 kỳ gần nhất
  const N = Math.min(12, periods.length);
  const labels = periods.slice(-N);
  const s = arr => arr.slice(-N);

  // Tính biên LN
  const margin = s(revenue).map((rev, i) => {
    const profit = s(netProfit)[i];
    if (!rev || !profit) return null;
    return parseFloat(((profit / rev) * 100).toFixed(2));
  });

  loading.style.display = 'none';

  content.innerHTML = `
    <div class="section-header">
      <span class="section-title">Doanh thu thuần & Lợi nhuận sau thuế</span>
    </div>
    <div class="chart-container">
      <canvas id="chartRevenue" height="100"></canvas>
    </div>

    <div class="section-header">
      <span class="section-title">Cơ cấu doanh thu theo mảng sản phẩm</span>
    </div>
    <div class="chart-container">
      <canvas id="chartSegment" height="110"></canvas>
    </div>

    <div class="section-header">
      <span class="section-title">Biên lợi nhuận ròng (%)</span>
    </div>
    <div class="chart-container">
      <canvas id="chartMargin" height="80"></canvas>
    </div>
  `;

  renderRevenueChart(labels, s(revenue), s(netProfit));
  renderSegmentChart(labels, {
    laptops:  s(laptops),
    phone:    s(phone),
    office:   s(office),
    homeApp:  s(homeApp),
    consumer: s(consumer),
  });
  renderMarginChart(labels, margin);
}

function getRowData(table, rowIndex, length) {
  try {
    const row = table.rows[rowIndex].c;
    const data = [];
    // Bắt đầu từ col index 2
    for (let i = 2; i < 2 + length; i++) {
      data.push(row[i] ? (row[i].v || 0) : 0);
    }
    return data;
  } catch { return []; }
}

function renderRevenueChart(labels, revenue, profit) {
  new Chart(document.getElementById('chartRevenue'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Doanh thu thuần (tỷ)',
          data: revenue,
          backgroundColor: 'rgba(16,185,129,0.15)',
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 4,
          order: 2,
        },
        {
          label: 'Lợi nhuận sau thuế (tỷ)',
          data: profit,
          type: 'line',
          borderColor: '#1a1a2e',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#1a1a2e',
          tension: 0.3,
          order: 1,
        }
      ]
    },
    options: chartOptions('tỷ VNĐ'),
  });
}

function renderSegmentChart(labels, segments) {
  new Chart(document.getElementById('chartSegment'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Laptops & Tablets',   data: segments.laptops,  backgroundColor: '#10b981', borderRadius: 3 },
        { label: 'Điện thoại di động',  data: segments.phone,    backgroundColor: '#3b82f6', borderRadius: 3 },
        { label: 'Office Equipment',    data: segments.office,   backgroundColor: '#f59e0b', borderRadius: 3 },
        { label: 'Home Appliances',     data: segments.homeApp,  backgroundColor: '#8b5cf6', borderRadius: 3 },
        { label: 'Consumer Goods',      data: segments.consumer, backgroundColor: '#ec4899', borderRadius: 3 },
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ` ${Number(ctx.raw).toLocaleString('vi-VN')} tỷ VNĐ` } }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
        y: { stacked: true, grid: { color: '#f1f3f4' }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

function renderMarginChart(labels, margin) {
  new Chart(document.getElementById('chartMargin'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Biên LN ròng (%)',
        data: margin,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#10b981',
        fill: true,
        tension: 0.3,
      }]
    },
    options: chartOptions('%'),
  });
}

function chartOptions(unit) {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${Number(ctx.raw).toLocaleString('vi-VN')} ${unit}` } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f3f4' }, ticks: { font: { size: 11 } } }
    }
  };
}