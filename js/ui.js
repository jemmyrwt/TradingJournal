/* ============================================================
   ui.js — UI helpers, formatting, theme, toast, modal
   ============================================================ */

const THEME_KEY = 'tradevault.theme.v1';

/* ---------- DOM helpers ---------- */
const $ = (id) => document.getElementById(id);

/* ---------- Formatters ---------- */
function fmtMoney(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? '-' : '';
  return sign + '₹' + Math.abs(v).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function fmtShort(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? '-' : '';
  const a = Math.abs(v);
  if (a >= 100000) return sign + '₹' + (a / 100000).toFixed(2) + 'L';
  if (a >= 1000) return sign + '₹' + (a / 1000).toFixed(2) + 'k';
  return sign + '₹' + a.toFixed(2);
}

function uid() {
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- Toast ---------- */
function toast(msg) {
  const el = $('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- Theme ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const sel = $('themeSelect');
  if (sel) sel.value = theme;
  const icon = $('themeIcon');
  if (icon) {
    icon.innerHTML = theme === 'dark'
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>'
      : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

/* ---------- Modal ---------- */
function openTradeModal(trade) {
  window.editingId = trade ? trade.id : null;
  $('tradeModalTitle').textContent = trade ? 'Edit Trade' : 'Add Trade';
  $('tradeId').value = trade ? trade.id : '';
  $('tSymbol').value = trade ? trade.symbol : '';
  $('tSide').value = trade ? trade.side : 'BUY';
  $('tEntry').value = trade ? trade.entry : '';
  $('tExit').value = trade ? trade.exit : '';
  $('tQty').value = trade ? trade.qty : '';
  $('tDate').value = trade ? trade.date : new Date().toISOString().slice(0, 10);
  $('tNotes').value = trade ? (trade.notes || '') : '';
  $('saveTradeBtn').textContent = trade ? 'Update Trade' : 'Save Trade';
  $('tradeModal').classList.add('show');
}

function closeTradeModal() {
  $('tradeModal').classList.remove('show');
  window.editingId = null;
  $('tradeForm').reset();
}
