import {
  esc,
  money,
  db,
  saveDB,
  uid
} from "./storage.js";


/* =========================
   TOAST
========================= */

export function toast(msg){

  const t=document.getElementById("toast");

  if(!t)return;

  t.textContent=msg;

  t.classList.add("show");

  clearTimeout(window.__tt);

  window.__tt=setTimeout(()=>{

    t.classList.remove("show");

  },2200);

}


/* =========================
   OPEN MODAL
========================= */

export function openModal(html){

  const modal=document.getElementById("modal");

  const box=document.getElementById("modalbox");


  if(!modal || !box){

    console.error(
      "TradeVault: modal container not found"
    );

    return false;

  }


  /*
    Completely clear previous modal.
  */

  box.innerHTML="";

  modal.classList.remove("open");


  /*
    Insert new modal content.
  */

  box.innerHTML=html;


  /*
    CSS uses:

    .modal.open{
      display:flex;
    }
  */

  modal.classList.add("open");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  /*
    Lock background scrolling.
  */

  document.body.style.overflow="hidden";

  document.documentElement.style.overflow="hidden";


  /*
    Initialize dynamically-created
    custom dropdowns.
  */

  initSelects(box);


  return true;

}


/* =========================
   CLOSE MODAL
========================= */

export function closeModal(){

  const modal=document.getElementById("modal");

  const box=document.getElementById("modalbox");


  if(!modal)return;


  /*
    Remove visible state.
  */

  modal.classList.remove("open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  /*
    Remove old modal HTML.

    This is important because the
    dynamically-created form should
    no longer remain active.
  */

  if(box){

    box.innerHTML="";

  }


  /*
    Restore page scrolling.
  */

  document.body.style.overflow="";

  document.documentElement.style.overflow="";


  /*
    Close any custom dropdown.
  */

  document
    .querySelectorAll(".app-select.open")
    .forEach(x=>{

      x.classList.remove("open");

    });

}


/*
  Keep compatibility with the other
  modules that still use:

  onclick="closeModal()"
*/

window.closeModal=closeModal;


/* =========================
   MODAL CLOSE EVENTS
========================= */

/*
  IMPORTANT:

  Modal HTML is dynamically created.

  Therefore event delegation is used
  instead of attaching listeners only
  when the page initially loads.

  These handlers work with:
  - data-close-modal on any element
  - clicks on the dark backdrop
  - Escape key presses
*/

document.addEventListener(
  "click",
  e=>{

    /*
      Cross / Cancel buttons with
      data-close-modal attribute.
    */

    const closeButton=
      e.target.closest(
        "[data-close-modal]"
      );


    if(closeButton){

      e.preventDefault();

      e.stopPropagation();

      closeModal();

      return;

    }


    /*
      Click on dark backdrop.
    */

    const modal=
      document.getElementById("modal");


    if(
      modal &&
      e.target===modal
    ){

      e.preventDefault();

      closeModal();

    }

  }
);


/* =========================
   ESCAPE KEY
========================= */

document.addEventListener(
  "keydown",
  e=>{

    if(e.key!=="Escape")return;


    const modal=
      document.getElementById("modal");


    if(
      modal &&
      modal.classList.contains("open")
    ){

      e.preventDefault();

      closeModal();

    }

  }
);


/* =========================
   CUSTOM SELECT
========================= */

export function appSelect(
  id,
  value,
  options
){

  const label=
    (
      options.find(
        o=>String(o[0])===String(value)
      )
      ||
      options[0]
      ||
      ["","Select"]
    )[1];


  return `

    <div
      class="app-select"
      data-select="${id}"
    >

      <input
        type="hidden"
        id="${id}"
        value="${esc(value)}"
      >

      <button
        type="button"
        class="app-select-trigger"
      >
        ${esc(label)}
      </button>

      <div class="app-select-menu">

        ${
          options
            .map(o=>`

              <button
                type="button"
                class="app-option ${
                  String(o[0])===String(value)
                    ?"selected"
                    :""
                }"
                data-value="${esc(o[0])}"
              >
                ${esc(o[1])}
              </button>

            `)
            .join("")
        }

      </div>

    </div>

  `;

}


/* =========================
   INIT CUSTOM SELECTS
========================= */

export function initSelects(
  root=document
){

  root
    .querySelectorAll(".app-select")
    .forEach(box=>{

      if(box.dataset.bound)return;


      const trigger=
        box.querySelector(
          ".app-select-trigger"
        );


      const input=
        box.querySelector(
          'input[type="hidden"]'
        );


      if(!trigger || !input)return;


      box.dataset.bound="1";


      /*
        Open / close dropdown.
      */

      trigger.addEventListener(
        "click",
        e=>{

          e.preventDefault();

          e.stopPropagation();


          document
            .querySelectorAll(
              ".app-select.open"
            )
            .forEach(x=>{

              if(x!==box){

                x.classList.remove(
                  "open"
                );

              }

            });


          box.classList.toggle(
            "open"
          );

        }
      );


      /*
        Select option.
      */

      box
        .querySelectorAll(
          ".app-option"
        )
        .forEach(opt=>{

          opt.addEventListener(
            "click",
            e=>{

              e.preventDefault();

              e.stopPropagation();


              input.value=
                opt.dataset.value;


              trigger.textContent=
                opt.textContent.trim();


              box
                .querySelectorAll(
                  ".app-option"
                )
                .forEach(x=>{

                  x.classList.remove(
                    "selected"
                  );

                });


              opt.classList.add(
                "selected"
              );


              box.classList.remove(
                "open"
              );


              input.dispatchEvent(
                new Event(
                  "change",
                  {
                    bubbles:true
                  }
                )
              );

            }
          );

        });

    });

}


/* =========================
   CLOSE CUSTOM SELECTS
========================= */

document.addEventListener(
  "click",
  e=>{

    if(
      e.target.closest(
        ".app-select"
      )
    ){

      return;

    }


    document
      .querySelectorAll(
        ".app-select.open"
      )
      .forEach(x=>{

        x.classList.remove(
          "open"
        );

      });

  }
);


/* =========================
   CHART SVG
========================= */

export function chartSVG(vals){

  if(!vals.length){

    return `

      <div class="empty">

        <div>

          <b>No curve yet</b>

          <span>
            Your curve appears after
            trades are added.
          </span>

        </div>

      </div>

    `;

  }


  let min=
    Math.min(
      0,
      ...vals
    );


  let max=
    Math.max(
      0,
      ...vals
    );


  let range=
    max-min || 1;


  const w=760;

  const h=250;

  const p=20;


  const pts=
    vals
      .map((v,i)=>{

        const x=
          p+
          i*
          (
            (w-p*2)/
            Math.max(
              1,
              vals.length-1
            )
          );


        const y=
          h-p-
          (
            (v-min)/
            range
          )*
          (
            h-p*2
          );


        return `${x},${y}`;

      })
      .join(" ");


  return `

    <svg
      viewBox="0 0 ${w} ${h}"
      preserveAspectRatio="none"
    >

      <polyline
        points="${pts}"
        fill="none"
        stroke="url(#g)"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <defs>

        <linearGradient
          id="g"
          x1="0"
          x2="1"
        >

          <stop
            offset="0"
            stop-color="#7c6cff"
          />

          <stop
            offset="1"
            stop-color="#4f9cff"
          />

        </linearGradient>

      </defs>

    </svg>

  `;

}


/* =========================
   TRADE CARD
========================= */

export function tradeCard(t){

  const pnl=
    Number(t.pnl)||0;


  const r=
    Number(t.r)||0;


  return `

    <div class="trade">

      <div>

        <div class="sym">
          ${esc(t.symbol || "—")}
        </div>

        <div class="meta">

          ${esc(t.date || "")}

          ·

          ${esc(t.setup || "Unspecified")}

        </div>

      </div>


      <div class="trade-mid">

        <span
          class="pill ${
            t.direction==="Short"
              ?"short"
              :"long"
          }"
        >
          ${esc(t.direction || "Long")}
        </span>

        <span class="pill">
          ${esc(t.timeframe || "—")}
        </span>

      </div>


      <div>

        <b
          class="${
            r>0
              ?"green"
              :
            r<0
              ?"red"
              :""
          }"
        >
          ${r>=0?"+":""}${r.toFixed(2)}R
        </b>

        <div class="meta">

          ${
            pnl>=0
              ?"+"
              :""
          }₹${money(Math.abs(pnl))}

        </div>

      </div>


      <div class="trade-actions">

        <button
          type="button"
          onclick="openTrade('${esc(t.id)}')"
        >
          Edit
        </button>

        <button
          type="button"
          onclick="deleteTrade('${esc(t.id)}')"
        >
          Delete
        </button>

      </div>

    </div>

  `;

}


/* =========================
   SETUP IMAGE INPUT
========================= */

export function setupImageInput(
  id,
  label="Chart Screenshot"
){

  return `

    <div class="field">

      <label>
        ${esc(label)}
      </label>

      <input
        class="input"
        type="file"
        id="${esc(id)}"
        accept="image/*"
        capture="environment"
        multiple
      >

    </div>

  `;

}


/* =========================
   END UI
========================= */
