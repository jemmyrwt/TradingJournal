/* ============================================================
   app.js — Main app: navigation, rendering, filters, import/export
   ============================================================ */

/* ---------- Navigation ---------- */
function go(page) {
  ['dashboard', 'trades', 'analytics', 'settings'].forEach(p => {
    const sec = $('page-' + p);
    if (sec) sec.classList.toggle('hidden', p !== page);
  });

  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'dashboard') renderDashboard();
  if (page === 'trades') renderTrades();
  if (page === 'analytics') renderAnalytics();
}

/* ---------- Table Renderer ---------- */
function renderTable(list, compact) {
  return `<div class="table-wrap"><table>
    <thead><tr>
      <th>Date</th><th>Symbol</th><th>Side</th>
      <th>Entry</th><th>Exit</th><th>Qty</th>
      <th>P&L</th>${compact ? '' : '<th></th>'}
    </tr></thead>
    <tbody>
      ${list.map(t => {
        const p = calcPnl(t);
        return `<tr>
          <td>${t.date || '—'}</td>
          <td><strong>${escapeHtml(t.symbol)}</strong></td>
          <td><span class="pill ${t.side === 'BUY' ? 'pill-buy' : 'pill-sell'}">${t.side}</span></td>
          <td>${t.entry}</td>
          <td>${t.exit}</td>
          <td>${t.qty}</td>
          <td class="${p > 0 ? 'pos' : p < 0 ? 'neg' : ''}"><strong>${fmtMoney(p)}</strong></td>
          ${compact ? '' : `<td style="text-align:right;">
            <button class="btn" style="padding:5px 10px;font-size:12px;" onclick="editTrade('${t.id}')">Edit</button>
            <button class="btn btn-danger" style="padding:5px 10px;font-size:12px;" onclick="deleteTrade('${t.id}')">Del</button>
          </td>`}
        </tr>`;
      }).join('')}
    </tbody>
  </table></div>`;
}

/* ---------- Dashboard ---------- */
function renderDashboard() {
  const list = trades;
  const total = list.length;
  const pnl = list.reduce((s, t) => s + calcPnl(t), 0);
  const wins = list.filter(t => calcPnl(t) > 0).length;
  const losses = list.filter(t => calcPnl(t) < 0).length;
  const winRate = total ? (wins / total) * 100 : 0;

  const avgWin = wins
    ? list.filter(t => calcPnl(t) > 0).reduce((s, t) => s + calcPnl(t), 0) / wins
    : 0;
  const avgLoss = losses
    ? Math.abs(list.filter(t => calcPnl(t) < 0).reduce((s, t) => s + calcPnl(t), 0) / losses)
    : 0;
  const rr = avgLoss ? (avgWin / avgLoss) : 0;

  const pnlEl = $('dashPnl');
  pnlEl.textContent = fmtMoney(pnl);
  pnlEl.className = 'stat-value ' + (pnl > 0 ? 'pos' : pnl < 0 ? 'neg' : '');
  $('dashPnlSub').textContent = total + ' trades';

  $('dashWinRate').textContent = winRate.toFixed(1) + '%';
  $('dashWinSub').textContent = wins + ' wins / ' + total + ' total';
  $('dashTrades').textContent = total;
  $('dashRR').textContent = rr ? rr.toFixed(2) + ' : 1' : '—';

  const recent = tradesSorted().slice(0, 5);
  const cont = $('dashRecent');
  if (!recent.length) {
    cont.innerHTML = '<div class="empty">Abhi koi trade nahi hai. "Add Trade" pe click karo shuru karne ke liye.</div>';
    return;
  }
  cont.innerHTML = renderTable(recent, true);
}

/* ---------- Trades ---------- */
function renderTrades() {
  const q = ($('filterSearch').value || '').toLowerCase();
  const side = $('filterSide').value;
  const res = $('filterResult').value;

  let list = tradesSorted();
  if (q) list = list.filter(t => (t.symbol || '').toLowerCase().includes(q));
  if (side) list = list.filter(t => t.side === side);
  if (res === 'win') list = list.filter(t => calcPnl(t) > 0);
  if (res === 'loss') list = list.filter(t => calcPnl(t) < 0);

  const cont = $('tradesList');
  if (!list.length) {
    cont.innerHTML = '<div class="empty">Koi trade match nahi hui.</div>';
    return;
  }
  cont.innerHTML = renderTable(list, false);
}

/* ---------- Analytics ---------- */
function renderAnalytics() {
  const list = trades;
  const wins = list.filter(t => calcPnl(t) > 0);
  const losses = list.filter(t => calcPnl(t) < 0);
  const be = list.filter(t => calcPnl(t) === 0);
  const total = list.length;
  const winRate = total ? (wins.length / total) * 100 : 0;

  $('donut').style.setProperty('--p', winRate.toFixed(1));
  $('donutVal').textContent = winRate.toFixed(0) + '%';
  $('legendWins').textContent = wins.length + ' Wins';
  $('legendLosses').textContent = losses.length + ' Losses';
  $('legendBE').textContent = be.length + ' Breakeven';

  const recent = tradesSorted().slice(0, 20).reverse();
  const chart = $('pnlChart');
  if (!recent.length) {
    chart.innerHTML = '<div class="empty" style="width:100%">No data yet.</div>';
  } else {
    const maxAbs = Math.max(...recent.map(t => Math.abs(calcPnl(t))), 1);
    chart.innerHTML = recent.map(t => {
      const p = calcPnl(t);
      const h = Math.max((Math.abs(p) / maxAbs) * 100, 4);
      const cls = p > 0 ? 'pos' : p < 0 ? 'neg' : '';
      return `<div class="bar-wrap" title="${escapeHtml(t.symbol)} ${fmtMoney(p)}">
        <div style="flex:1;display:flex;align-items:flex-end;width:100%">
          <div class="bar ${cls}" style="height:${h}%"></div>
        </div>
        <div class="bar-label">${escapeHtml(t.symbol.slice(0, 4))}</div>
      </div>`;
    }).join('');
  }

  const pnls = list.map(calcPnl);
  const best = pnls.length ? Math.max(...pnls) : 0;
  const worst = pnls.length ? Math.min(...pnls) : 0;
  const totalWin = wins.reduce((s, t) => s + calcPnl(t), 0);
  const totalLoss = Math.abs(losses.reduce((s, t) => s + calcPnl(t), 0));
  const avgWin = wins.length ? totalWin / wins.length : 0;
  const avgLoss = losses.length ? totalLoss / losses.length : 0;
  const pf = totalLoss ? (totalWin / totalLoss) : (totalWin > 0 ? Infinity : 0);

  $('aBest').textContent = fmtShort(best);
  $('aWorst').textContent = fmtShort(worst);
  $('aAvgWin').textContent = fmtShort(avgWin);
  $('aAvgLoss').textContent = fmtShort(avgLoss);
  $('aTotal').textContent = total;
  $('aPF').textContent = pf === Infinity ? '∞' : pf ? pf.toFixed(2) : '—';
}

/* ---------- Export / Import / Clear ---------- */
function exportData() {
  const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tradevault-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Exported!');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Invalid format');
      if (!confirm('Import se existing data replace ho jayega. Continue?')) return;

      trades = data.map(t => ({
        id: t.id || uid(),
        symbol: String(t.symbol || '').toUpperCase(),
        side: t.side === 'SELL' ? 'SELL' : 'BUY',
        entry: Number(t.entry) || 0,
        exit: Number(t.exit) || 0,
        qty: Number(t.qty) || 0,
        date: t.date || new Date().toISOString().slice(0, 10),
        notes: t.notes || '',
        createdAt: t.createdAt || Date.now(),
      }));
      saveTrades();
      toast('Imported ' + trades.length + ' trades');
      go('dashboard');
    } catch (err) {
      console.error(err);
      toast('Invalid JSON file');
    }
  };
  reader.readAsText(file);
}

function clearAll() {
  if (!confirm('Saara data permanently delete ho jayega. Sure?')) return;
  trades = [];
  saveTrades();
  toast('All data cleared');
  go('dashboard');
}

/* ---------- Init ---------- */
function init() {
  const savedTheme = localStorage.getItem('tradevault.theme.v1') || 'light';
  applyTheme(savedTheme);

  loadTrades();

  $('themeBtn').addEventListener('click', toggleTheme);
  $('addTradeTop').addEventListener('click', () => openTradeModal());
  $('tradeForm').addEventListener('submit', submitTrade);

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => go(btn.dataset.page));
  });

  $('filterSearch').addEventListener('input', renderTrades);
  $('filterSide').addEventListener('change', renderTrades);
  $('filterResult').addEventListener('change', renderTrades);

  $('themeSelect').addEventListener('change', (e) => applyTheme(e.target.value));
  $('exportBtn').addEventListener('click', exportData);
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });
  $('clearBtn').addEventListener('click', clearAll);

  $('tradeModal').addEventListener('click', (e) => {
    if (e.target.id === 'tradeModal') closeTradeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTradeModal();
  });

  go('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
