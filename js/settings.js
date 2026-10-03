import {db,saveDB} from "./storage.js";
import {toast} from "./ui.js";

const THEME_KEY="tradevault_theme";

/* =========================
   THEME SYSTEM
========================= */

export function applyTheme(theme){
  const light = theme === "light";

  document.body.classList.toggle("light-theme", light);
  document.documentElement.classList.toggle("theme-light-preload", light);
  document.documentElement.style.colorScheme = light ? "light" : "dark";

  const icon = document.getElementById("themeIcon");
  const text = document.getElementById("themeText");
  const btn = document.getElementById("themeToggle");

  if(icon){
    icon.textContent = light ? "☾" : "☀";
  }

  if(text){
    text.textContent = light ? "Dark" : "Light";
  }

  if(btn){
    btn.setAttribute(
      "aria-label",
      light ? "Switch to dark theme" : "Switch to light theme"
    );

    btn.setAttribute(
      "aria-pressed",
      light ? "true" : "false"
    );
  }

  const meta = document.querySelector('meta[name="theme-color"]');

  if(meta){
    meta.setAttribute(
      "content",
      light ? "#f4f1ea" : "#0b0e14"
    );
  }
}


export function initTheme(){
  const saved = localStorage.getItem(THEME_KEY);

  if(saved === "light"){
    applyTheme("light");
  }else{
    applyTheme("dark");
  }
}


export function toggleTheme(){

  const current =
    document.body.classList.contains("light-theme")
      ? "light"
      : "dark";

  const next =
    current === "light"
      ? "dark"
      : "light";

  localStorage.setItem(THEME_KEY,next);

  applyTheme(next);

  toast(
    next === "light"
      ? "Light theme enabled"
      : "Dark theme enabled"
  );
}


/* =========================
   SETTINGS PAGE
========================= */

export function renderSettings(){

  const name =
    document.getElementById("traderName");

  const market =
    document.getElementById("defaultMarket");

  const counts =
    document.getElementById("dataCounts");

  const notify =
    document.getElementById("notifyStatus");


  if(name){
    name.value = db.settings.name || "";
  }

  if(market){
    market.value = db.settings.market || "";
  }

  if(counts){
    counts.textContent =
      `${db.trades.length} trades · ` +
      `${db.setups.length} setups · ` +
      `${db.backtests.length} tests · ` +
      `${db.reviews.length} reviews`;
  }

  if(notify){
    notify.textContent =
      "Notification permission: " +
      (
        ("Notification" in window)
          ? Notification.permission
          : "unsupported"
      );
  }

  /*
    Make sure the saved theme is applied
    whenever Settings page is opened.
  */
  const savedTheme =
    localStorage.getItem(THEME_KEY) === "light"
      ? "light"
      : "dark";

  applyTheme(savedTheme);
}


export function saveSettings(){

  const name =
    document.getElementById("traderName")?.value.trim() || "";

  const market =
    document.getElementById("defaultMarket")?.value.trim() || "";

  db.settings.name = name;
  db.settings.market = market;

  saveDB();

  toast("Settings saved");
}


/* =========================
   BACKUP / IMPORT
========================= */

export function exportData(){

  const blob =
    new Blob(
      [JSON.stringify(db,null,2)],
      {type:"application/json"}
    );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    "tradevault-backup-" +
    new Date().toISOString().slice(0,10) +
    ".json";

  a.click();

  URL.revokeObjectURL(a.href);

  toast("Backup exported");
}


export function importData(e){

  const f =
    e.target.files[0];

  if(!f){
    return;
  }

  const rd =
    new FileReader();

  rd.onload = () => {

    try{

      const x =
        JSON.parse(rd.result);

      if(
        !Array.isArray(x.trades) ||
        !Array.isArray(x.setups) ||
        !Array.isArray(x.reviews)
      ){
        throw Error();
      }

      Object.assign(db,x);

      db.backtests ??= [];

      db.settings ??= {
        name:"",
        market:"",
        capital:0
      };

      saveDB();

      renderSettings();

      toast("Backup imported");

    }catch{

      toast("Invalid backup file");

    }

  };

  rd.readAsText(f);

  e.target.value = "";
}


/* =========================
   CSV EXPORT
========================= */

export function exportCSV(){

  const headers = [
    "Date",
    "Symbol",
    "Direction",
    "Setup",
    "Timeframe",
    "Entry",
    "SL",
    "Target",
    "Exit",
    "Qty",
    "P&L",
    "R",
    "Rule",
    "Emotion",
    "Mistake"
  ];

  const rows =
    db.trades.map(t => [
      t.date,
      t.symbol,
      t.direction,
      t.setup,
      t.timeframe,
      t.entry,
      t.sl,
      t.target,
      t.exit,
      t.qty,
      t.pnl,
      t.r,
      t.rule ? "Followed" : "Violation",
      t.emotion,
      t.mistake
    ]);

  const csv =
    [headers,...rows]
      .map(row =>
        row
          .map(
            v =>
              `"${String(v ?? "").replaceAll('"','""')}"`
          )
          .join(",")
      )
      .join("\n");

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(
      new Blob(
        [csv],
        {type:"text/csv"}
      )
    );

  a.download =
    "tradevault-trades.csv";

  a.click();

  toast("CSV exported");
}


/* =========================
   NOTIFICATIONS
========================= */

export async function requestNotifications(){

  if(!("Notification" in window)){

    toast(
      "Notifications are not supported here"
    );

    return;
  }

  const p =
    await Notification.requestPermission();

  renderSettings();

  toast(
    p === "granted"
      ? "Notifications enabled"
      : `Permission: ${p}`
  );
}


export function sendTestNotification(){

  if(
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ){

    toast("Enable notifications first");

    return;
  }

  new Notification(
    "TradeVault",
    {
      body:"Notification test is working."
    }
  );
}


/* =========================
   APP UPDATE
========================= */

export async function checkForUpdate(){

  const el =
    document.getElementById("updateStatus");

  if(!el){
    return;
  }

  if(!("serviceWorker" in navigator)){

    el.textContent =
      "Service worker not supported";

    return;
  }

  const reg =
    await navigator.serviceWorker.getRegistration();

  if(!reg){

    el.textContent =
      "Service worker not registered yet";

    return;
  }

  await reg.update();

  el.textContent =
    reg.waiting
      ? "Update ready — reload to apply."
      : "App is up to date.";
}


/* =========================
   CLEAR ALL DATA
========================= */

export function clearAll(){

  const confirmed =
    confirm(
      "This will delete all trades, setups, backtests and reviews. Export first if needed."
    );

  if(!confirmed){
    return;
  }

  db.trades = [];
  db.setups = [];
  db.backtests = [];
  db.reviews = [];

  saveDB();

  renderSettings();

  toast("All data cleared");
}


/* =========================
   GLOBAL FUNCTIONS
   Required because HTML uses
   inline onclick handlers.
========================= */

window.exportData = exportData;
window.importData = importData;
window.exportCSV = exportCSV;

window.requestNotifications =
  requestNotifications;

window.sendTestNotification =
  sendTestNotification;

window.checkForUpdate =
  checkForUpdate;

window.clearAll =
  clearAll;

window.saveSettings =
  saveSettings;

window.toggleTheme =
  toggleTheme;


/* =========================
   INITIALIZE THEME
========================= */

initTheme();
