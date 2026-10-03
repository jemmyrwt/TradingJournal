import {db,saveDB} from "./storage.js";
import {toast} from "./ui.js";

const THEME_KEY="tradevault_theme";

export function applyTheme(theme){
  const light=theme==="light";
  document.body.classList.toggle("light-theme",light);
  document.documentElement.style.colorScheme=light?"light":"dark";
  const icon=document.getElementById("themeIcon");
  const text=document.getElementById("themeText");
  const btn=document.getElementById("themeToggle");
  if(icon) icon.textContent=light?"☾":"☀";
  if(text) text.textContent=light?"Dark":"Light";
  if(btn) btn.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme");
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute("content",light?"#f4f1ea":"#0b0e14");
}

export function initTheme(){
  const saved=localStorage.getItem(THEME_KEY);
  const theme=saved==="light"?"light":"dark";
  applyTheme(theme);
}

export function toggleTheme(){
  const next=document.body.classList.contains("light-theme")?"dark":"light";
  localStorage.setItem(THEME_KEY,next);
  applyTheme(next);
  toast(next==="light"?"Light theme enabled":"Dark theme enabled");
}

export function renderSettings(){
  const name=document.getElementById("traderName");
  const market=document.getElementById("defaultMarket");
  const counts=document.getElementById("dataCounts");
  const notify=document.getElementById("notifyStatus");
  if(name) name.value=db.settings.name||"";
  if(market) market.value=db.settings.market||"";
  if(counts) counts.textContent=`${db.trades.length} trades · ${db.setups.length} setups · ${db.backtests.length} tests · ${db.reviews.length} reviews`;
  if(notify) notify.textContent="Notification permission: "+(("Notification" in window)?Notification.permission:"unsupported");
  applyTheme(localStorage.getItem(THEME_KEY)==="light"?"light":"dark");
}

export function saveSettings(){
  db.settings.name=document.getElementById("traderName")?.value.trim()||"";
  db.settings.market=document.getElementById("defaultMarket")?.value.trim()||"";
  saveDB();
  toast("Settings saved");
}

export function exportData(){const blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="tradevault-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(a.href);toast("Backup exported")}
export function importData(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const x=JSON.parse(rd.result);if(!Array.isArray(x.trades)||!Array.isArray(x.setups)||!Array.isArray(x.reviews))throw Error();Object.assign(db,x);db.backtests??=[];db.settings??={name:"",market:"",capital:0};saveDB();toast("Backup imported")}catch{toast("Invalid backup file")}};rd.readAsText(f);e.target.value=""}
export function exportCSV(){const headers=["Date","Symbol","Direction","Setup","Timeframe","Entry","SL","Target","Exit","Qty","P&L","R","Rule","Emotion","Mistake"];const rows=db.trades.map(t=>[t.date,t.symbol,t.direction,t.setup,t.timeframe,t.entry,t.sl,t.target,t.exit,t.qty,t.pnl,t.r,t.rule?"Followed":"Violation",t.emotion,t.mistake]);const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="tradevault-trades.csv";a.click();toast("CSV exported")}
export async function requestNotifications(){if(!("Notification"in window)){toast("Notifications are not supported here");return}const p=await Notification.requestPermission();renderSettings();toast(p==="granted"?"Notifications enabled":`Permission: ${p}`)}
export function sendTestNotification(){if(!(("Notification"in window))||Notification.permission!=="granted"){toast("Enable notifications first");return}new Notification("TradeVault",{body:"Notification test is working."})}
export async function checkForUpdate(){const el=document.getElementById("updateStatus");if(!el)return;if(!("serviceWorker"in navigator)){el.textContent="Service worker not supported";return}const reg=await navigator.serviceWorker.getRegistration();if(!reg){el.textContent="Service worker not registered yet";return}await reg.update();el.textContent=reg.waiting?"Update ready — reload to apply.":"App is up to date."}
export function clearAll(){if(confirm("This will delete all trades, setups, backtests and reviews. Export first if needed.")){db.trades=[];db.setups=[];db.backtests=[];db.reviews=[];saveDB();toast("All data cleared")}}

window.exportData=exportData;window.importData=importData;window.exportCSV=exportCSV;window.requestNotifications=requestNotifications;window.sendTestNotification=sendTestNotification;window.checkForUpdate=checkForUpdate;window.clearAll=clearAll;window.saveSettings=saveSettings;window.toggleTheme=toggleTheme;
