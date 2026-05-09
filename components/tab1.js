import { fetchSheet, getCell } from '../js/api.js';

export async function renderTab1(sheetId) {
  const content = document.getElementById('tab1-content');
  const loading = document.getElementById('tab1-loading');

  loading.style.display = 'block';
  content.innerHTML = '';

  const table = await fetchSheet(sheetId, 'DGW');
  if (!table) {
    loading.style.display = 'none';
    content.innerHTML = '<div class="error-msg">Không thể tải dữ liệu. Vui lòng thử lại.</div>';
    return;
  }

  // Index đã xác nhận từ data thực tế
  const gia        = getCell(table, 3, 2);
  const vonHoaCard = getCell(table, 12, 2);
  const bvps       = getCell(table, 13, 2);
  const pe         = getCell(table, 14, 2);
  const pb         = getCell(table, 15, 2);
  const eps        = getCell(table, 17, 2);
  const roe        = getCell(table, 18, 2);
  const roa        = getCell(table, 19, 2);
  const ebit       = getCell(table, 21, 2);
  const ebitda     = getCell(table, 22, 2);

  // Lấy thông tin mã từ MASTER_INDEX đã có trên header
  const stockSelect = document.getElementById('stockSelect');
  const selectedText = stockSelect.options[stockSelect.selectedIndex]?.text || '';

  const fmt = (v, decimals = 1) => v !== null ? Number(v).toFixed(decimals) : '--';
  const fmtPct = (v) => v !== null ? (Number(v) * 100).toFixed(1) + '%' : '--';
  const fmtBillion = (v) => v !== null ? Number(v).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : '--';
  const fmtPrice = (v) => v !== null ? Number(v).toLocaleString('vi-VN') : '--';

  loading.style.display = 'none';

  content.innerHTML = `
    <div class="section-header">
      <span class="section-title">Định giá thị trường</span>
    </div>
    <div class="metrics-grid" style="margin-bottom: var(--spacing-xl);">
      ${metricCard('Vốn hóa', fmtBillion(vonHoaCard) + ' tỷ', 'VNĐ')}
      ${metricCard('Giá cổ phiếu', fmtPrice(gia), 'VNĐ')}
      ${metricCard('P/E (TTM)', fmt(pe) + 'x', 'Giá / EPS')}
      ${metricCard('P/B', fmt(pb) + 'x', 'Giá / BVPS')}
     ${metricCard('BVPS', fmtBillion(bvps), 'VNĐ/CP')}
    </div>

    <div class="section-header">
      <span class="section-title">Lợi nhuận & Hiệu quả (TTM)</span>
    </div>
    <div class="metrics-grid" style="margin-bottom: var(--spacing-xl);">
      ${metricCard('EPS', fmtPrice(eps), 'VNĐ/CP')}
      ${metricCard('ROE', fmtPct(roe), 'LNST / Vốn CSH bình quân', true)}
      ${metricCard('ROA', fmtPct(roa), 'LNST / Tổng TS bình quân')}
    </div>

    <div class="section-header">
      <span class="section-title">EBIT / EBITDA (TTM)</span>
    </div>
    <div class="metrics-grid">
      ${metricCard('EBIT', fmtBillion(ebit) + ' tỷ', 'VNĐ')}
      ${metricCard('EBITDA', fmtBillion(ebitda) + ' tỷ', 'VNĐ')}
    </div>
  `;
}

function metricCard(label, value, note = '', accent = false) {
  return `
    <div class="metric-card">
      <div class="metric-label">${label}</div>
      <div class="metric-value ${accent ? 'accent' : ''}">${value}</div>
      <div class="metric-note">${note}</div>
    </div>
  `;
}