import {
  db,
  saveDB,
  uid,
  esc,
  money
} from "./storage.js";

import {
  openModal,
  closeModal,
  appSelect,
  toast,
  tradeCard,
  setupImageInput
} from "./ui.js";


/* =========================
   OPEN / EDIT TRADE
========================= */

export function openTrade(id=""){

  const t=
    db.trades.find(x=>x.id===id) ||
    {
      id:"",
      date:new Date().toISOString().slice(0,10),
      symbol:"",
      direction:"Long",
      setup:"",
      timeframe:"",
      entry:"",
      exit:"",
      sl:"",
      target:"",
      qty:"",
      pnl:"",
      r:"",
      risk:"",
      riskPct:"",
      rr:"",
      rule:true,
      emotion:"",
      mistake:"",
      entryReason:"",
      exitReason:"",
      notes:"",
      screenshots:[]
    };


  openModal(`

    <div class="modal-head">

      <h2>
        ${id?"Trade Detail / Edit":"New Trade"}
      </h2>

      <button
        type="button"
        class="x"
        data-close-modal
        aria-label="Close"
      >
        ×
      </button>

    </div>


    <form
      class="form"
      data-trade-form="1"
      data-trade-id="${esc(id)}"
    >

      <div class="formgrid">

        <div class="field">
          <label>Date</label>
          <input
            class="input"
            type="date"
            id="t_date"
            value="${esc(t.date)}"
            required
          >
        </div>

        <div class="field">
          <label>Symbol</label>
          <input
            class="input"
            id="t_symbol"
            value="${esc(t.symbol)}"
            placeholder="NIFTY / RELIANCE"
            required
          >
        </div>

        <div class="field">
          <label>Direction</label>
          ${appSelect(
            "t_direction",
            t.direction,
            [
              ["Long","Long"],
              ["Short","Short"]
            ]
          )}
        </div>

        <div class="field">
          <label>Setup</label>
          <input
            class="input"
            id="t_setup"
            value="${esc(t.setup)}"
            placeholder="Your setup"
          >
        </div>

        <div class="field">
          <label>Timeframe</label>
          <input
            class="input"
            id="t_tf"
            value="${esc(t.timeframe)}"
            placeholder="5m / 15m / 1H"
          >
        </div>

        <div class="field">
          <label>Quantity</label>
          <input
            class="input"
            type="number"
            step="any"
            id="t_qty"
            value="${esc(t.qty)}"
          >
        </div>

        <div class="field">
          <label>Entry</label>
          <input
            class="input"
            type="number"
            step="any"
            id="t_entry"
            value="${esc(t.entry)}"
          >
        </div>

        <div class="field">
          <label>Exit</label>
          <input
            class="input"
            type="number"
            step="any"
            id="t_exit"
            value="${esc(t.exit)}"
          >
        </div>

        <div class="field">
          <label>Stop Loss</label>
          <input
            class="input"
            type="number"
            step="any"
            id="t_sl"
            value="${esc(t.sl)}"
          >
        </div>

        <div class="field">
          <label>Target</label>
          <input
            class="input"
            type="number"
            step="any"
            id="t_target"
            value="${esc(t.target)}"
          >
        </div>

        <div class="field">
          <label>Net P&L ₹</label>
          <input
            class="input"
            type="number"
            step="any"
            id="t_pnl"
            value="${esc(t.pnl)}"
            placeholder="After charges"
          >
        </div>

        <div class="field">
          <label>Result R</label>
          <input
            class="input"
            type="number"
            step="any"
            id="t_r"
            value="${esc(t.r)}"
          >
        </div>

      </div>


      <div class="result-grid">

        <div class="mini">
          <span>Risk ₹</span>
          <b id="tradeRiskPreview">—</b>
        </div>

        <div class="mini">
          <span>Risk %</span>
          <b id="tradeRiskPctPreview">—</b>
        </div>

        <div class="mini">
          <span>Planned R:R</span>
          <b id="tradeRRPreview">—</b>
        </div>

      </div>


      <div class="field">

        <label>Rule adherence</label>

        ${appSelect(
          "t_rule",
          String(!!t.rule),
          [
            ["true","Followed rules"],
            ["false","Rule violation"]
          ]
        )}

      </div>


      <div class="formgrid">

        <div class="field">
          <label>Emotion before trade</label>
          <input
            class="input"
            id="t_emotion"
            value="${esc(t.emotion)}"
            placeholder="Calm / FOMO / revenge"
          >
        </div>

        <div class="field">
          <label>Mistake / violation</label>
          <input
            class="input"
            id="t_mistake"
            value="${esc(t.mistake)}"
          >
        </div>

      </div>


      <div class="formgrid">

        <div class="field">
          <label>Entry reason</label>
          <textarea
            class="textarea"
            id="t_entryReason"
          >${esc(t.entryReason)}</textarea>
        </div>

        <div class="field">
          <label>Exit reason</label>
          <textarea
            class="textarea"
            id="t_exitReason"
          >${esc(t.exitReason)}</textarea>
        </div>

      </div>


      <div class="field">
        <label>Notes</label>
        <textarea
          class="textarea"
          id="t_notes"
        >${esc(t.notes)}</textarea>
      </div>


      ${setupImageInput(
        "t_images",
        "Chart Screenshots (camera/gallery)"
      )}


      <div id="existingPhotos">

        ${
          t.screenshots?.length
          ?
          `
            <div class="photo-grid">
              ${t.screenshots.map(s=>`
                <img
                  src="${s}"
                  alt="Trade chart"
                >
              `).join("")}
            </div>
          `
          :
          ""
        }

      </div>


      <div class="form-actions">

        <button
          type="button"
          class="btn"
          data-close-modal
        >
          Cancel
        </button>


        ${
          id
          ?
          `
            <button
              type="button"
              class="btn danger"
              onclick="deleteTrade('${esc(id)}')"
            >
              Delete
            </button>
          `
          :
          ""
        }


        <button
          type="submit"
          class="btn primary"
          data-save-trade
        >
          ${id?"Save Changes":"Save Trade"}
        </button>

      </div>


    </form>

  `);


  [
    "t_entry",
    "t_exit",
    "t_sl",
    "t_target",
    "t_qty"
  ].forEach(x=>{

    document
      .getElementById(x)
      ?.addEventListener(
        "input",
        previewTrade
      );

  });


  previewTrade();
}


/* =========================
   MODAL CLOSE HANDLER
   Handles X + Cancel even when
   modal HTML is dynamically created.
========================= */

if(!window.__tradeModalCloseBound){

  window.__tradeModalCloseBound=true;

  document.addEventListener("click", e=>{

    const btn=e.target.closest("[data-close-modal]");

    if(!btn)return;

    e.preventDefault();
    e.stopPropagation();

    closeModal();

  });

}


/* =========================
   TRADE FORM SUBMIT HANDLER
   Handles dynamically created
   Add Trade / Edit Trade forms.
========================= */

if(!window.__tradeFormSubmitBound){

  window.__tradeFormSubmitBound=true;

  document.addEventListener("submit", async e=>{

    const form=
      e.target.closest("form[data-trade-form]");

    if(!form)return;

    e.preventDefault();
    e.stopPropagation();

    if(form.dataset.saving==="1"){
      return;
    }

    form.dataset.saving="1";

    const saveBtn=
      form.querySelector("[data-save-trade]");

    const originalText=
      saveBtn?.textContent || "";

    if(saveBtn){

      saveBtn.disabled=true;
      saveBtn.textContent="Saving...";

    }

    try{

      await submitTrade(
        e,
        form.dataset.tradeId || "",
        form
      );

    }catch(error){

      console.error(
        "Trade save failed:",
        error
      );

      toast(
        "Unable to save trade"
      );

    }finally{

      form.dataset.saving="0";

      if(saveBtn){

        saveBtn.disabled=false;
        saveBtn.textContent=originalText;

      }

    }

  });

}


/* =========================
   TRADE PREVIEW
========================= */

function previewTrade(){

  const entryEl=
    document.getElementById("t_entry");

  const slEl=
    document.getElementById("t_sl");

  const targetEl=
    document.getElementById("t_target");

  const qtyEl=
    document.getElementById("t_qty");

  const directionEl=
    document.getElementById("t_direction");


  if(
    !entryEl ||
    !slEl ||
    !targetEl ||
    !qtyEl ||
    !directionEl
  ){
    return;
  }


  const e=+entryEl.value||0;
  const sl=+slEl.value||0;
  const tar=+targetEl.value||0;
  const qty=+qtyEl.value||0;
  const dir=directionEl.value;


  const riskUnit=
    Math.abs(e-sl);

  const rewardUnit=
    Math.abs(tar-e);


  const riskPreview=
    document.getElementById(
      "tradeRiskPreview"
    );

  const riskPctPreview=
    document.getElementById(
      "tradeRiskPctPreview"
    );

  const rrPreview=
    document.getElementById(
      "tradeRRPreview"
    );


  if(riskPreview){

    riskPreview.textContent=
      riskUnit && qty
        ? "₹"+money(riskUnit*qty)
        : "—";

  }


  if(riskPctPreview){

    riskPctPreview.textContent="—";

  }


  if(rrPreview){

    rrPreview.textContent=
      riskUnit
        ? (
            (rewardUnit/riskUnit)
              .toFixed(2)
            +":1"
          )
        : "—";

  }

}


/* =========================
   IMAGE → DATA URL
========================= */

async function fileToDataURL(f){

  return new Promise((res,rej)=>{

    const r=
      new FileReader();

    r.onload=()=>{
      res(r.result);
    };

    r.onerror=rej;

    r.readAsDataURL(f);

  });

}


/* =========================
   SAVE TRADE
========================= */

export async function submitTrade(e,id,form=null){

  if(e){
    e.preventDefault();
  }

  const old=
    db.trades.find(x=>x.id===id);


  let screenshots=
    old?.screenshots || [];


  const imageInput=
    document.getElementById("t_images");


  const files=
    imageInput
      ? [...imageInput.files]
      : [];


  if(files.length){

    const data=
      await Promise.all(
        files
          .slice(0,4)
          .map(fileToDataURL)
      );

    screenshots=[
      ...screenshots,
      ...data
    ];

  }


  const symbol=
    document
      .getElementById("t_symbol")
      ?.value
      .trim()
      .toUpperCase() || "";


  if(!symbol){

    toast("Please enter symbol");

    return;

  }


  const t={

    id:id||uid(),

    date:
      document.getElementById("t_date")?.value || "",

    symbol,

    direction:
      document.getElementById("t_direction")?.value || "Long",

    setup:
      document
        .getElementById("t_setup")
        ?.value
        .trim() ||
      "Unspecified",

    timeframe:
      document
        .getElementById("t_tf")
        ?.value
        .trim() || "",

    entry:
      +(
        document
          .getElementById("t_entry")
          ?.value
      ) || 0,

    exit:
      +(
        document
          .getElementById("t_exit")
          ?.value
      ) || 0,

    sl:
      +(
        document
          .getElementById("t_sl")
          ?.value
      ) || 0,

    target:
      +(
        document
          .getElementById("t_target")
          ?.value
      ) || 0,

    qty:
      +(
        document
          .getElementById("t_qty")
          ?.value
      ) || 0,

    pnl:
      +(
        document
          .getElementById("t_pnl")
          ?.value
      ) || 0,

    r:
      +(
        document
          .getElementById("t_r")
          ?.value
      ) || 0,

    rule:
      document
        .getElementById("t_rule")
        ?.value === "true",

    emotion:
      document
        .getElementById("t_emotion")
        ?.value
        .trim() || "",

    mistake:
      document
        .getElementById("t_mistake")
        ?.value
        .trim() || "",

    entryReason:
      document
        .getElementById("t_entryReason")
        ?.value
        .trim() || "",

    exitReason:
      document
        .getElementById("t_exitReason")
        ?.value
        .trim() || "",

    notes:
      document
        .getElementById("t_notes")
        ?.value
        .trim() || "",

    screenshots,

    created:
      old?.created || Date.now()

  };


  const risk=
    Math.abs(t.entry-t.sl)*t.qty;

  t.risk=risk;

  t.riskPct=0;

  t.rr=
    Math.abs(t.entry-t.sl)
      ?
      Math.abs(t.target-t.entry) /
      Math.abs(t.entry-t.sl)
      :
      0;


  if(old){

    Object.assign(old,t);

  }else{

    db.trades.unshift(t);

  }


  /* Save FIRST. Only close after
     successful persistence. */
  saveDB();


  /* Refresh the visible trade list
     without changing storage. */
  try{

    renderTrades();

  }catch(error){

    console.warn(
      "Trade list refresh failed:",
      error
    );

  }


  closeModal();

  toast(
    old
      ? "Trade updated"
      : "Trade added"
  );

}


/* =========================
   DELETE TRADE
========================= */

export function deleteTrade(id){

  if(
    !confirm(
      "Delete this trade permanently?"
    )
  ){
    return;
  }


  db.trades=
    db.trades.filter(
      x=>x.id!==id
    );


  saveDB();

  toast("Trade deleted");


  const modal=
    document.getElementById("modal");

  if(
    modal?.classList.contains("open")
  ){

    closeModal();

  }

  try{

    renderTrades();

  }catch(error){

    console.warn(
      "Trade list refresh failed:",
      error
    );

  }

}


/* =========================
   RENDER TRADES
========================= */

export function renderTrades(){

  const q=
    (
      document
        .getElementById("search")
        ?.value || ""
    ).toLowerCase();


  const d=
    document
      .getElementById("filterDir")
      ?.value || "";


  const r=
    document
      .getElementById("filterResult")
      ?.value || "";


  const a=
    db.trades.filter(t=>{

      const searchMatch=
        !q ||
        [
          t.symbol,
          t.setup,
          t.notes,
          t.mistake,
          t.emotion
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);


      const directionMatch=
        !d ||
        t.direction===d;


      const resultMatch=
        !r ||
        (
          r==="win"
            ? t.r>0
            : r==="loss"
              ? t.r<0
              : t.r===0
        );


      return(
        searchMatch &&
        directionMatch &&
        resultMatch
      );

    });


  const el=
    document.getElementById(
      "tradesList"
    );


  if(!el)return;


  el.innerHTML=
    a.length
      ?
      `
        <div class="trade-list">
          ${a.map(tradeCard).join("")}
        </div>
      `
      :
      `
        <div class="empty">

          <div>

            <b>No trades found</b>

            <span>
              Add your first trade to start building data.
            </span>

          </div>

        </div>
      `;

}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openTrade=openTrade;

window.deleteTrade=deleteTrade;

window.submitTrade=submitTrade;

window.closeModal=closeModal;

window.previewTrade=previewTrade;
