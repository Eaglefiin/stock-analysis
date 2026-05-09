// ============================================================
// API LAYER — Đọc data từ Google Sheets
// Mỗi hàm nhận vào Spreadsheet ID + tên sheet, trả về raw data
// ============================================================

const SHEET_BASE = 'https://docs.google.com/spreadsheets/d';

// Hàm core — fetch 1 sheet, trả về mảng rows
export async function fetchSheet(spreadsheetId, sheetName) {
  const url = `${SHEET_BASE}/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const res = await fetch(url);
    const text = await res.text();
    
    // Google trả về JSON bọc trong callback — cần strip
    const json = JSON.parse(text.substring(47, text.length - 2));
    return json.table;
  } catch (err) {
    console.error(`Lỗi fetch sheet "${sheetName}":`, err);
    return null;
  }
}

// Lấy giá trị 1 ô theo hàng/cột (0-based index)
export function getCell(table, row, col) {
  try {
    const cell = table.rows[row].c[col];
    if (!cell || cell.v === null) return null;
    return cell.v;
  } catch {
    return null;
  }
}

// Lấy toàn bộ 1 hàng
export function getRow(table, rowIndex) {
  try {
    return table.rows[rowIndex].c.map(cell => cell ? cell.v : null);
  } catch {
    return [];
  }
}

// ============================================================
// MASTER INDEX — đọc danh sách mã CK
// ============================================================
const MASTER_INDEX_ID = '1LKQbEyWLR_gVynMbokLQ2FNFzVxyQEytNwLqEDxdco0';

export async function fetchStockList() {
  const table = await fetchSheet(MASTER_INDEX_ID, '_INDEX');
  if (!table) return [];

  const stocks = [];
  // Data bắt đầu từ hàng index 4 (hàng 5 trong Sheets = index 4)
for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    if (!row || !row.c[0] || !row.c[0].v) break;

    stocks.push({
      ticker:    row.c[0]?.v || '',
      name:      row.c[1]?.v || '',
      exchange:  row.c[2]?.v || '',
      sector:    row.c[3]?.v || '',
      period:    row.c[4]?.v || '',
      updated:   row.c[5]?.v || '',
      price:     row.c[6]?.v || 0,
      marketCap: row.c[7]?.v || 0,
      urlTab1:   row.c[8]?.v || '',
      urlTab2:   row.c[9]?.v || '',
      urlTab3:   row.c[10]?.v || '',
    });
  }
  return stocks;
}

// Lấy Spreadsheet ID từ URL Google Sheets
export function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}