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
              onclick="deleteTrade('${id}')"
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

export async function submitTrade(e,id=""){

  if(e){
    e.preventDefault();
    e.stopPropagation();
  }


  const form=
    e?.target?.closest?.(
      'form[data-trade-form]'
    )
    ||
    document.querySelector(
      'form[data-trade-form]'
    );


  if(
    form?.dataset.saving==="1"
  ){
    return;
  }


  if(form){

    form.dataset.saving="1";

  }


  const saveButton=
    form?.querySelector(
      'button[type="submit"]'
    );


  const originalText=
    saveButton?.textContent ||
    "Save Trade";


  if(saveButton){

    saveButton.disabled=true;

    saveButton.textContent=
      "Saving…";

  }


  try{

    const old=
      db.trades.find(
        x=>x.id===id
      );


    let screenshots=
      old?.screenshots || [];


    const imageInput=
      document.getElementById(
        "t_images"
      );


    const files=
      imageInput
        ?
        Array.from(
          imageInput.files || []
        )
        :
        [];


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


    const value=id=>{

      const el=
        document.getElementById(id);

      return el
        ? el.value
        : "";

    };


    const symbol=
      value("t_symbol")
        .trim()
        .toUpperCase();


    if(!symbol){

      toast(
        "Please enter symbol"
      );

      document
        .getElementById(
          "t_symbol"
        )
        ?.focus();

      return;

    }


    const t={

      id:
        id ||
        uid(),


      date:
        value("t_date") ||
        new Date()
          .toISOString()
          .slice(0,10),


      symbol,


      direction:
        value("t_direction") ||
        "Long",


      setup:
        value("t_setup")
          .trim() ||
        "Unspecified",


      timeframe:
        value("t_tf")
          .trim(),


      entry:
        +value("t_entry") ||
        0,


      exit:
        +value("t_exit") ||
        0,


      sl:
        +value("t_sl") ||
        0,


      target:
        +value("t_target") ||
        0,


      qty:
        +value("t_qty") ||
        0,


      pnl:
        +value("t_pnl") ||
        0,


      r:
        +value("t_r") ||
        0,


      rule:
        value("t_rule")==="true",


      emotion:
        value("t_emotion")
          .trim(),


      mistake:
        value("t_mistake")
          .trim(),


      entryReason:
        value("t_entryReason")
          .trim(),


      exitReason:
        value("t_exitReason")
          .trim(),


      notes:
        value("t_notes")
          .trim(),


      screenshots,


      created:
        old?.created ||
        Date.now()

    };


    const riskUnit=
      Math.abs(
        t.entry-t.sl
      );


    const rewardUnit=
      Math.abs(
        t.target-t.entry
      );


    t.risk=
      riskUnit*t.qty;


    t.riskPct=0;


    t.rr=
      riskUnit
        ?
        rewardUnit/riskUnit
        :
        0;


    if(old){

      Object.assign(
        old,
        t
      );

    }else{

      db.trades.unshift(t);

    }


    saveDB();


    /*
      IMPORTANT:
      Close only AFTER successful
      localStorage save.
    */

    closeModal();


    toast(
      old
        ?
        "Trade updated"
        :
        "Trade added"
    );


    /*
      Refresh trade list.
    */

    try{

      renderTrades();

    }catch(error){

      console.warn(
        "TradeVault: trade list refresh failed",
        error
      );

    }


  }catch(error){

    console.error(
      "TradeVault: submitTrade failed",
      error
    );


    toast(
      "Could not save trade. Please try again."
    );


  }finally{

    if(form){

      form.dataset.saving="";

    }


    if(saveButton){

      saveButton.disabled=false;

      saveButton.textContent=
        originalText;

    }

  }

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
   TRADE FORM SUBMIT DELEGATION
========================= */

if(!window.__tradeFormSubmitBound){

  window.__tradeFormSubmitBound=true;


  document.addEventListener(
    "submit",
    async e=>{

      const form=
        e.target.closest(
          'form[data-trade-form]'
        );


      if(!form)return;


      e.preventDefault();

      e.stopPropagation();


      const id=
        form.dataset.tradeId ||
        "";


      await submitTrade(
        e,
        id
      );

    }
  );

}


/* =========================
   MODAL CLOSE DELEGATION
========================= */

if(!window.__modalCloseDelegationBound){

  window.__modalCloseDelegationBound=true;


  document.addEventListener(
    "click",
    e=>{

      const closeBtn=
        e.target.closest(
          '[data-close-modal]'
        );


      if(!closeBtn)return;


      e.preventDefault();

      e.stopPropagation();


      closeModal();

    }
  );

}


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openTrade=openTrade;

window.deleteTrade=deleteTrade;

window.submitTrade=submitTrade;

window.closeModal=closeModal;

window.previewTrade=previewTrade;
