import {
  db,
  saveDB,
  esc,
  money
} from "./storage.js";

import {
  toast
} from "./ui.js";


/* ================================
   SETTINGS RENDER
================================ */

export function renderSettings() {

  const traderNameEl =
    document.getElementById("traderName");

  const defaultMarketEl =
    document.getElementById("defaultMarket");

  const dataCountsEl =
    document.getElementById("dataCounts");

  const notifyStatusEl =
    document.getElementById("notifyStatus");


  if (traderNameEl) {
    traderNameEl.value =
      db.settings.name || "";
  }


  if (defaultMarketEl) {
    defaultMarketEl.value =
      db.settings.market || "";
  }


  if (dataCountsEl) {

    dataCountsEl.textContent =
      `${db.trades.length} trades · ` +
      `${db.setups.length} setups · ` +
      `${db.backtests.length} tests · ` +
      `${db.reviews.length} reviews`;

  }


  if (notifyStatusEl) {

    notifyStatusEl.textContent =
      "Notification permission: " +
      (
        ("Notification" in window)
          ? Notification.permission
          : "unsupported"
      );

  }

}


/* ================================
   SAVE SETTINGS
================================ */

export function saveSettings() {

  const traderNameEl =
    document.getElementById("traderName");

  const defaultMarketEl =
    document.getElementById("defaultMarket");


  db.settings.name =
    traderNameEl
      ? traderNameEl.value.trim()
      : "";


  db.settings.market =
    defaultMarketEl
      ? defaultMarketEl.value.trim()
      : "";


  saveDB();

  toast("Settings saved");

}


/* ================================
   EXPORT JSON
================================ */

export function exportData() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          db,
          null,
          2
        )
      ],
      {
        type: "application/json"
      }
    );


  const a =
    document.createElement("a");


  const url =
    URL.createObjectURL(blob);


  a.href = url;

  a.download =
    "tradevault-backup-" +
    new Date()
      .toISOString()
      .slice(0, 10) +
    ".json";


  a.click();


  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);


  toast("Backup exported");

}


/* ================================
   IMPORT JSON
================================ */

export function importData(e) {

  const file =
    e.target.files[0];


  if (!file) {
    return;
  }


  const reader =
    new FileReader();


  reader.onload = () => {

    try {

      const imported =
        JSON.parse(
          reader.result
        );


      /*
       * Basic backup validation.
       */

      if (
        !imported ||
        !Array.isArray(imported.trades) ||
        !Array.isArray(imported.setups) ||
        !Array.isArray(imported.reviews)
      ) {

        throw new Error(
          "Invalid backup structure"
        );

      }


      db.trades =
        imported.trades;


      db.setups =
        imported.setups;


      db.reviews =
        imported.reviews;


      db.backtests =
        Array.isArray(imported.backtests)
          ? imported.backtests
          : [];


      db.settings = {
        name: "",
        market: "",
        capital: 0,
        ...(imported.settings || {})
      };


      saveDB();


      toast(
        "Backup imported"
      );


    } catch (error) {

      console.error(
        "TradeVault import error:",
        error
      );

      toast(
        "Invalid backup file"
      );

    }

  };


  reader.readAsText(file);

  e.target.value = "";

}


/* ================================
   EXPORT CSV
================================ */

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
    db.trades.map(
      trade => [

        trade.date,
        trade.symbol,
        trade.direction,
        trade.setup,
        trade.timeframe,
        trade.entry,
        trade.sl,
        trade.target,
        trade.exit,
        trade.qty,
        trade.pnl,
        trade.r,

        trade.rule
          ? "Followed"
          : "Violation",

        trade.emotion,
        trade.mistake

      ]
    );


  const csv =
    [
      headers,
      ...rows
    ]
      .map(row =>
        row
          .map(value =>
            `"${String(
              value ?? ""
            ).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");


  const blob =
    new Blob(
      [csv],
      {
        type: "text/csv"
      }
    );


  const a =
    document.createElement("a");


  const url =
    URL.createObjectURL(blob);


  a.href = url;

  a.download =
    "tradevault-trades.csv";


  a.click();


  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);


  toast(
    "CSV exported"
  );

}


/* ================================
   NOTIFICATIONS
================================ */

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

    console.error(
      "Notification permission error:",
      error
    );

    toast(
      "Could not request notifications"
    );

  }

}


/* ================================
   TEST NOTIFICATION
================================ */

export function sendTestNotification() {

  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {

    toast(
      "Enable notifications first"
    );

    return;
  }


  try {

    new Notification(
      "TradeVault",
      {
        body:
          "Notification test is working."
      }
    );


  } catch (error) {

    console.error(
      "Notification error:",
      error
    );

    toast(
      "Notification could not be sent"
    );

  }

}


/* ================================
   APP UPDATE
================================ */

export async function checkForUpdate() {

  const status =
    document.getElementById(
      "updateStatus"
    );


  if (!status) {
    return;
  }


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

    console.error(
      "Update check error:",
      error
    );

    status.textContent =
      "Could not check for update.";

  }

}


/* ================================
   CLEAR ALL DATA
================================ */

export function clearAll() {

  const confirmed =
    confirm(
      "This will delete all trades, setups, backtests and reviews. Export first if needed."
    );


  if (!confirmed) {
    return;
  }


  db.trades = [];

  db.setups = [];

  db.backtests = [];

  db.reviews = [];


  saveDB();


  toast(
    "All data cleared"
  );

}


/* =================================================
   THEME
================================================= */

function applyTheme(theme) {

  const isLight =
    theme === "light";


  document.body.classList.toggle(
    "light-theme",
    isLight
  );


  const icon =
    document.getElementById(
      "themeIcon"
    );


  const text =
    document.getElementById(
      "themeText"
    );


  if (icon) {

    icon.textContent =
      isLight
        ? "☾"
        : "☀";

  }


  if (text) {

    text.textContent =
      isLight
        ? "Dark"
        : "Light";

  }


  /*
   * Keep browser / PWA top bar
   * in sync with selected theme.
   */

  const themeMeta =
    document.querySelector(
      'meta[name="theme-color"]'
    );


  if (themeMeta) {

    themeMeta.setAttribute(
      "content",
      isLight
        ? "#f4f2ed"
        : "#0b0e14"
    );

  }

}


/* ================================
   THEME TOGGLE SETUP
================================ */

function setupThemeToggle() {

  const toggle =
    document.getElementById(
      "themeToggle"
    );


  if (!toggle) {
    return;
  }


  /*
   * Prevent duplicate listeners
   * when settings page re-renders.
   */

  if (
    toggle.dataset.themeBound === "1"
  ) {

    return;

  }


  toggle.dataset.themeBound = "1";


  const savedTheme =
    localStorage.getItem(
      "tradevault_theme"
    ) || "dark";


  applyTheme(
    savedTheme
  );


  toggle.addEventListener(
    "click",
    () => {

      const isLight =
        document.body.classList.contains(
          "light-theme"
        );


      const nextTheme =
        isLight
          ? "dark"
          : "light";


      localStorage.setItem(
        "tradevault_theme",
        nextTheme
      );


      applyTheme(
        nextTheme
      );


      toast(
        nextTheme === "light"
          ? "Off-white theme enabled"
          : "Dark theme enabled"
      );

    }
  );

}


/* ================================
   INITIAL THEME
=============================== */

function initTheme() {

  const savedTheme =
    localStorage.getItem(
      "tradevault_theme"
    ) || "dark";


  applyTheme(
    savedTheme
  );

}


/*
 * Apply theme immediately when
 * this module is loaded.
 */

initTheme();


/*
 * Setup button when DOM is ready.
 */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    setupThemeToggle,
    {
      once: true
    }
  );

} else {

  setupThemeToggle();

}


/* ================================
   GLOBAL EXPORTS
================================ */

window.exportData =
  exportData;

window.importData =
  importData;

window.exportCSV =
  exportCSV;

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
