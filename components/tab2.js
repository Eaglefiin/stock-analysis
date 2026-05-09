// ============================================================
// TAB 2 — Tổng quan doanh nghiệp (Infographic)
// Đọc từ DGW_TAB2, sheet "IMAGES" + "META"
// ============================================================

import { fetchSheet, getCell } from '../js/api.js';

export async function renderTab2(sheetId) {
  const content = document.getElementById('tab2-content');
  const loading = document.getElementById('tab2-loading');

  loading.style.display = 'block';
  content.innerHTML = '';

  // Đọc 2 sheet song song
  const [imagesTable, metaTable] = await Promise.all([
    fetchSheet(sheetId, 'IMAGES'),
    fetchSheet(sheetId, 'META'),
  ]);

  if (!imagesTable) {
    loading.style.display = 'none';
    content.innerHTML = '<div class="error-msg">Không thể tải dữ liệu. Vui lòng thử lại.</div>';
    return;
  }

  // Đọc META
  let pageTitle = 'Tổng quan doanh nghiệp';
  let pageSubtitle = '';
  if (metaTable) {
    for (let i = 1; i < metaTable.rows.length; i++) {
      const key = getCell(metaTable, i, 0);
      const val = getCell(metaTable, i, 1);
      if (key === 'page_title') pageTitle = val || pageTitle;
      if (key === 'page_subtitle') pageSubtitle = val || '';
    }
  }

  // Đọc IMAGES — bắt đầu từ hàng index 1 (bỏ header)
  const images = [];
  for (let i = 1; i < imagesTable.rows.length; i++) {
    const row = imagesTable.rows[i];
    if (!row || !row.c[0] || !row.c[0].v) continue;

    const url = getCell(imagesTable, i, 4);
    if (!url) continue; // Bỏ qua nếu chưa có URL

    images.push({
      stt:     getCell(imagesTable, i, 0),
      section: getCell(imagesTable, i, 1),
      title:   getCell(imagesTable, i, 2),
      caption: getCell(imagesTable, i, 3),
      url:     url,
      order:   getCell(imagesTable, i, 5) || 99,
    });
  }

  // Sắp xếp theo THỨ TỰ
  images.sort((a, b) => a.order - b.order);

  loading.style.display = 'none';

  if (images.length === 0) {
    content.innerHTML = `
      <div style="text-align:center; padding: var(--spacing-2xl); color: var(--color-text-muted);">
        <div style="font-size:32px; margin-bottom:var(--spacing-md);">🖼️</div>
        <div>Chưa có ảnh nào. Thêm URL ảnh vào sheet IMAGES trong DGW_TAB2.</div>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div style="margin-bottom: var(--spacing-xl);">
      <div style="font-size:20px; font-weight:700; margin-bottom:4px;">${pageTitle}</div>
      ${pageSubtitle ? `<div style="font-size:14px; color:var(--color-text-secondary);">${pageSubtitle}</div>` : ''}
    </div>
    <div class="infographic-grid">
      ${images.map(img => imageCard(img)).join('')}
    </div>
  `;
}

function imageCard(img) {
  return `
    <div class="infographic-card">
      <img
        src="${img.url}"
        alt="${img.title || ''}"
        loading="lazy"
        onerror="this.parentElement.style.display='none'"
      />
      ${img.caption ? `<div class="infographic-caption">${img.caption}</div>` : ''}
    </div>
  `;
}