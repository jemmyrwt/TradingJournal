import {esc,money,db,saveDB,uid} from "./storage.js";

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
   MODAL
========================= */

export function openModal(html){

  const modal=document.getElementById("modal");
  const box=document.getElementById("modalbox");

  if(!modal || !box)return;

  box.innerHTML=html;

  modal.classList.add("open");

  document.body.style.overflow="hidden";

  initSelects(box);
}


export function closeModal(){

  const modal=document.getElementById("modal");

  if(!modal)return;

  modal.classList.remove("open");

  document.body.style.overflow="";
}


/*
  HTML inside the modal uses inline
  onclick="closeModal()".
  Because this file is an ES module,
  the function must also be exposed
  on window.
*/
window.closeModal=closeModal;


/* Close when clicking modal backdrop */

const modalElement=document.getElementById("modal");

if(modalElement){

  modalElement.addEventListener("click",e=>{

    if(e.target===modalElement || e.target.id==="modal"){
      closeModal();
    }

  });

}


/* Close modal with Escape */

document.addEventListener("keydown",e=>{

  if(
    e.key==="Escape" &&
    document.getElementById("modal")?.classList.contains("open")
  ){

    e.preventDefault();

    closeModal();
  }

});


/* =========================
   CUSTOM SELECT
========================= */

export function appSelect(id,value,options){

  const label=
    (
      options.find(
        o=>String(o[0])===String(value)
      ) ||
      options[0] ||
      ["","Select"]
    )[1];

  return `
    <div class="app-select" data-select="${id}">

      <input
        type="hidden"
        id="${id}"
        value="${esc(value)}"
      >

      <button
        type="button"
        class="app-select-trigger"
      >${esc(label)}</button>

      <div class="app-select-menu">

        ${options.map(o=>`

          <button
            type="button"
            class="app-option ${String(o[0])===String(value)?"selected":""}"
            data-value="${esc(o[0])}"
          >${esc(o[1])}</button>

        `).join("")}

      </div>

    </div>
  `;
}


export function initSelects(root=document){

  root.querySelectorAll(".app-select").forEach(box=>{

    if(box.dataset.bound)return;

    const trigger=
      box.querySelector(".app-select-trigger");

    const input=
      box.querySelector("input[type=hidden]");

    if(!trigger || !input)return;

    box.dataset.bound="1";


    trigger.addEventListener("click",e=>{

      e.stopPropagation();

      document
        .querySelectorAll(".app-select.open")
        .forEach(x=>{

          if(x!==box){
            x.classList.remove("open");
          }

        });

      box.classList.toggle("open");

    });


    box.querySelectorAll(".app-option").forEach(opt=>{

      opt.addEventListener("click",e=>{

        e.stopPropagation();

        input.value=opt.dataset.value;

        trigger.textContent=opt.textContent;

        box
          .querySelectorAll(".app-option")
          .forEach(x=>x.classList.remove("selected"));

        opt.classList.add("selected");

        box.classList.remove("open");

        input.dispatchEvent(
          new Event("change",{bubbles:true})
        );

      });

    });

  });

}


/* Close custom selects */

document.addEventListener("click",()=>{

  document
    .querySelectorAll(".app-select.open")
    .forEach(x=>x.classList.remove("open"));

});


/* =========================
   CHART
========================= */

export function chartSVG(vals){

  if(!vals.length){

    return `
      <div class="empty">
        <div>
          <b>No curve yet</b>
          <span>Your curve appears after trades are added.</span>
        </div>
      </div>
    `;
  }

  let min=Math.min(0,...vals);
  let max=Math.max(0,...vals);
  let range=max-min||1;

  let w=760;
  let h=250;
  let p=20;

  let pts=vals.map((v,i)=>{

    const x=
      p+
      i*((w-p*2)/Math.max(1,vals.length-1));

    const y=
      h-p-
      ((v-min)/range)*(h-p*2);

    return `${x},${y}`;

  }).join(" ");

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

  return `
    <div class="trade">

      <div>

        <div class="sym">

          ${esc(t.symbol)}

          <span
            class="pill ${String(t.direction).toLowerCase()}"
          >
            ${esc(t.direction)}
          </span>

        </div>

        <div class="meta">
          ${esc(t.date)} · ${esc(t.setup||"Unspecified")}
        </div>

      </div>


      <div class="trade-mid">

        <div>
          ${Number(t.pnl)>=0?"+":""}₹${money(t.pnl)}
        </div>

        <div class="meta">
          ${Number(t.r)>=0?"+":""}${Number(t.r).toFixed(2)}R ·
          ${t.rule?"Rules ✓":"Violation"}
        </div>

      </div>


      <div
        class="${Number(t.r)>0?"green":Number(t.r)<0?"red":""}"
        style="font-weight:800"
      >
        ${Number(t.r)>0?"+":""}${Number(t.r||0).toFixed(2)}R
      </div>


      <div class="trade-actions">

        <button onclick="openTrade('${t.id}')">
          View/Edit
        </button>

        <button onclick="deleteTrade('${t.id}')">
          Delete
        </button>

      </div>

    </div>
  `;
}


/* =========================
   IMAGE INPUT
========================= */

export function setupImageInput(
  id,
  label="Chart Screenshot"
){

  return `
    <div class="field">

      <label>${label}</label>

      <input
        class="input"
        type="file"
        id="${id}"
        accept="image/*"
        capture="environment"
      >

    </div>
  `;
}
