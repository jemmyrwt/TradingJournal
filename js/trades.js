/* ============================================================
   trades.js — Trade CRUD, storage, calculations
   ============================================================ */

const STORAGE_KEY = 'tradevault.trades.v1';

let trades = [];
let editingId = null;

/* ---------- Calc ---------- */
function calcPnl(t) {
  const entry = Number(t.entry) || 0;
  const exit = Number(t.exit) || 0;
  const qty = Number(t.qty) || 0;
  const diff = t.side === 'BUY' ? (exit - entry) : (entry - exit);
  return diff * qty;
}

/* ---------- Storage ---------- */
function loadTrades() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    trades = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(trades)) trades = [];
  } catch (e) {
    console.error('Load error', e);
    trades = [];
  }
}

function saveTrades() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error('Save error', e);
    toast('Save failed!');
  }
}

function tradesSorted() {
  return [...trades].sort((a, b) =>
    (b.date || '').localeCompare(a.date || '') ||
    (b.createdAt || 0) - (a.createdAt || 0)
  );
}

/* ---------- Submit / Edit / Delete ---------- */
function submitTrade(e) {
  if (e) e.preventDefault();

  const data = {
    id: editingId || uid(),
    symbol: ($('tSymbol').value || '').trim().toUpperCase(),
    side: $('tSide').value,
    entry: parseFloat($('tEntry').value),
    exit: parseFloat($('tExit').value),
    qty: parseFloat($('tQty').value),
    date: $('tDate').value,
    notes: ($('tNotes').value || '').trim(),
    createdAt: editingId ? undefined : Date.now(),
  };

  if (!data.symbol || isNaN(data.entry) || isNaN(data.exit) || isNaN(data.qty) || !data.date) {
    toast('Please fill all required fields');
    return;
  }

  if (editingId) {
    const i = trades.findIndex(t => t.id === editingId);
    if (i > -1) trades[i] = { ...trades[i], ...data, id: editingId };
    toast('Trade updated');
  } else {
    trades.push(data);
    toast('Trade added');
  }

  saveTrades();
  closeTradeModal();

  const active = document.querySelector('.nav-item.active')?.dataset.page || 'dashboard';
  go(active);
}

function deleteTrade(id) {
  if (!confirm('Ye trade delete karni hai?')) return;
  trades = trades.filter(t => t.id !== id);
  saveTrades();
  toast('Trade deleted');
  const active = document.querySelector('.nav-item.active')?.dataset.page || 'dashboard';
  go(active);
}

function editTrade(id) {
  const t = trades.find(x => x.id === id);
  if (t) openTradeModal(t);
}
