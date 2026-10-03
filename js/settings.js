import { db, saveDB } from "./storage.js";
import { toast } from "./ui.js";

/* =========================================================
   THEME SYSTEM
   ========================================================= */

const THEME_KEY = "tradevault_theme";

/* Apply selected theme */
export function applyTheme(theme) {
  const isLight = theme === "light";

  document.body.classList.toggle("light-theme", isLight);

  /* Browser native controls */
  document.documentElement.style.colorScheme =
    isLight ? "light" : "dark";

  /* Theme button */
  const icon = document.getElementById("themeIcon");
  const text = document.getElementById("themeText");
  const button = document.getElementById("themeToggle");

  if (icon) {
    icon.textContent = isLight ? "☾" : "☀";
  }

  if (text) {
    text.textContent = isLight ? "Dark" : "Light";
  }

  if (button) {
    button.setAttribute(
      "aria-label",
      isLight
        ? "Switch to dark theme"
        : "Switch to light theme"
    );

    button.title =
      isLight
        ? "Switch to dark theme"
        : "Switch to light theme";
  }

  /* Browser/PWA top bar color */
  const meta = document.querySelector(
    'meta[name="theme-color"]'
  );

  if (meta) {
    meta.setAttribute(
      "content",
      isLight ? "#f4f1ea" : "#0b0e14"
    );
  }
}


/* Load saved theme */
export function initTheme() {
  const savedTheme =
    localStorage.getItem(THEME_KEY);

  const theme =
    savedTheme === "light"
      ? "light"
      : "dark";

  applyTheme(theme);
}


/* Toggle Dark <-> Light */
export function toggleTheme() {

  const currentTheme =
    document.body.classList.contains("light-theme")
      ? "light"
      : "dark";

  const nextTheme =
    currentTheme === "light"
      ? "dark"
      : "light";

  /* Save */
  localStorage.setItem(
    THEME_KEY,
    nextTheme
  );

  /* Apply immediately */
  applyTheme(nextTheme);

  toast(
    nextTheme === "light"
      ? "Light theme enabled"
      : "Dark theme enabled"
  );
}


/* =========================================================
   SETTINGS
   ========================================================= */

export function renderSettings() {

  const name =
    document.getElementById("traderName");

  const market =
    document.getElementById("defaultMarket");

  const counts =
    document.getElementById("dataCounts");

  const notify =
    document.getElementById("notifyStatus");

  if (name) {
    name.value =
      db.settings?.name || "";
  }

  if (market) {
    market.value =
      db.settings?.market || "";
  }

  if (counts) {
    counts.textContent =
      `${db.trades.length} trades · ` +
      `${db.setups.length} setups · ` +
      `${db.backtests.length} tests · ` +
      `${db.reviews.length} reviews`;
  }

  if (notify) {
    notify.textContent =
      "Notification permission: " +
      (
        "Notification" in window
          ? Notification.permission
          : "unsupported"
      );
  }

  /* Always restore saved theme */
  initTheme();
}


/* Save settings */
export function saveSettings() {

  if (!db.settings) {
    db.settings = {
      name: "",
      market: "",
      capital: 0
    };
  }

  db.settings.name =
    document
      .getElementById("traderName")
      ?.value
      .trim() || "";

  db.settings.market =
    document
      .getElementById("defaultMarket")
      ?.value
      .trim() || "";

  saveDB();

  toast("Settings saved");
}


/* =========================================================
   BACKUP
   ========================================================= */

export function exportData() {

  const blob =
    new Blob(
      [JSON.stringify(db, null, 2)],
      {
        type: "application/json"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "tradevault-backup-" +
    new Date()
      .toISOString()
      .slice(0, 10) +
    ".json";

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

  toast("Backup exported");
}


/* =========================================================
   IMPORT
   ========================================================= */

export function importData(event) {

  const file =
    event.target.files?.[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = () => {

    try {

      const imported =
        JSON.parse(reader.result);

      if (
        !Array.isArray(imported.trades) ||
        !Array.isArray(imported.setups) ||
        !Array.isArray(imported.reviews)
      ) {
        throw new Error("Invalid backup");
      }

      Object.assign(db, imported);

      db.backtests ??= [];

      db.settings ??= {
        name: "",
        market: "",
        capital: 0
      };

      saveDB();

      toast("Backup imported");

      renderSettings();

    } catch (error) {

      console.error(error);

      toast("Invalid backup file");
    }
  };

  reader.readAsText(file);

  event.target.value = "";
}


/* =========================================================
   CSV EXPORT
   ========================================================= */

export function exportCSV() {

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
      t.rule
        ? "Followed"
        : "Violation",
      t.emotion,
      t.mistake
    ]);

  const csv =
    [headers, ...rows]
      .map(row =>
        row
          .map(value =>
            `"${String(value ?? "")
              .replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

  const blob =
    new Blob(
      [csv],
      { type: "text/csv" }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = "tradevault-trades.csv";

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);

  toast("CSV exported");
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

export async function requestNotifications() {

  if (!("Notification" in window)) {

    toast(
      "Notifications are not supported here"
    );

    return;
  }

  try {

    const permission =
      await Notification.requestPermission();

    renderSettings();

    toast(
      permission === "granted"
        ? "Notifications enabled"
        : `Permission: ${permission}`
    );

  } catch (error) {

    console.error(error);

    toast("Notification permission failed");
  }
}


export function sendTestNotification() {

  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {

    toast("Enable notifications first");

    return;
  }

  new Notification(
    "TradeVault",
    {
      body:
        "Notification test is working."
    }
  );
}


/* =========================================================
   APP UPDATE
   ========================================================= */

export async function checkForUpdate() {

  const status =
    document.getElementById("updateStatus");

  if (!status) return;

  if (!("serviceWorker" in navigator)) {

    status.textContent =
      "Service worker not supported";

    return;
  }

  try {

    const registration =
      await navigator.serviceWorker
        .getRegistration();

    if (!registration) {

      status.textContent =
        "Service worker not registered yet";

      return;
    }

    await registration.update();

    status.textContent =
      registration.waiting
        ? "Update ready — reload to apply."
        : "App is up to date.";

  } catch (error) {

    console.error(error);

    status.textContent =
      "Unable to check for update.";
  }
}


/* =========================================================
   CLEAR DATA
   ========================================================= */

export function clearAll() {

  const confirmed =
    confirm(
      "This will delete all trades, setups, backtests and reviews. Export first if needed."
    );

  if (!confirmed) return;

  db.trades = [];
  db.setups = [];
  db.backtests = [];
  db.reviews = [];

  saveDB();

  toast("All data cleared");

  renderSettings();
}


/* =========================================================
   GLOBAL FUNCTIONS
   =========================================================
   HTML onclick="" ke liye zaroori
   ========================================================= */

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

window.applyTheme =
  applyTheme;

window.initTheme =
  initTheme;


/* =========================================================
   INITIAL THEME
   =========================================================
   JS load hote hi saved theme apply.
   ========================================================= */

initTheme();
