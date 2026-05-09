// ============================================================
// APP.JS — Điều phối toàn bộ ứng dụng
// ============================================================

import { fetchStockList, extractSheetId } from './api.js';
import { renderTab1 } from '../components/tab1.js';
import { renderTab2 } from '../components/tab2.js';
import { renderTab3 } from '../components/tab3.js';

// State
let currentStock = null;
let tab1Loaded = false;
let tab2Loaded = false;
let tab3Loaded = false;

// ---- Khởi động ----
async function init() {
  const stocks = await fetchStockList();

  if (!stocks || stocks.length === 0) {
    document.getElementById('stockSelect').innerHTML =
      '<option>Không tải được danh sách mã</option>';
    return;
  }

  // Render dropdown
  const select = document.getElementById('stockSelect');
  select.innerHTML = stocks.map(s =>
    `<option value="${s.ticker}">${s.ticker} — ${s.name}</option>`
  ).join('');

  // Load mã đầu tiên
  await loadStock(stocks[0], stocks);

  // Lắng nghe thay đổi mã
  select.addEventListener('change', async (e) => {
    const stock = stocks.find(s => s.ticker === e.target.value);
    if (stock) await loadStock(stock, stocks);
  });
}

// ---- Load 1 mã ----
async function loadStock(stock, stocks) {
  currentStock = stock;
  tab1Loaded = false;
  tab2Loaded = false;
  tab3Loaded = false;

  // Cập nhật header info
  updateStockMeta(stock);

  // Reset tất cả tab về loading
  ['tab1', 'tab2', 'tab3'].forEach(t => {
    document.getElementById(`${t}-content`).innerHTML = '';
    document.getElementById(`${t}-loading`).style.display = 'block';
  });

  // Load tab đang active
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'tab1';
  await loadTab(activeTab, stock);
}

// ---- Load 1 tab ----
async function loadTab(tabId, stock) {
  stock = stock || currentStock;
  if (!stock) return;

  if (tabId === 'tab1' && !tab1Loaded) {
    const id = extractSheetId(stock.urlTab1);
    if (id) { await renderTab1(id); tab1Loaded = true; }
    else showTabError('tab1');
  }

  if (tabId === 'tab2' && !tab2Loaded) {
    const id = extractSheetId(stock.urlTab2);
    if (id) { await renderTab2(id); tab2Loaded = true; }
    else showTabError('tab2');
  }

  if (tabId === 'tab3' && !tab3Loaded) {
    const id = extractSheetId(stock.urlTab3);
    if (id) { await renderTab3(id); tab3Loaded = true; }
    else showTabError('tab3');
  }
}

// ---- Cập nhật thông tin mã trên header ----
function updateStockMeta(stock) {
  document.getElementById('stockMeta').innerHTML =
    `<strong>${stock.name}</strong> &nbsp;·&nbsp; ${stock.exchange} &nbsp;·&nbsp; ${stock.sector}`;

  document.getElementById('stockPrice').textContent =
    stock.price ? Number(stock.price).toLocaleString('vi-VN') + ' đ' : '';

document.getElementById('stockUpdated').textContent =
    stock.updated ? `Cập nhật: ${formatDate(stock.updated)}` : '';
}

// ---- Tab navigation ----
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const tabId = e.currentTarget.dataset.tab;

    // Cập nhật active button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');

    // Cập nhật active panel
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    // Load tab nếu chưa load
    await loadTab(tabId);
  });
});

// ---- Hiển thị lỗi khi không có URL ----
function showTabError(tabId) {
  document.getElementById(`${tabId}-loading`).style.display = 'none';
  document.getElementById(`${tabId}-content`).innerHTML =
    '<div class="error-msg">Chưa có URL cho tab này trong MASTER_INDEX.</div>';
}

// ---- Start ----
function formatDate(raw) {
  if (!raw) return '';
  // Google Sheets trả về dạng Date(2026,8,5) — tháng 0-based
  const match = String(raw).match(/Date\((\d+),(\d+),(\d+)\)/);
  if (match) {
    const y = match[1];
    const m = String(Number(match[2]) + 1).padStart(2, '0');
    const d = String(match[3]).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }
  return raw;
}
init();