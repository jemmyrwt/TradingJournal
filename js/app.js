import {db,saveDB,tradeStats} from "./storage.js";
import {initSelects,chartSVG,toast,tradeCard,openModal,closeModal} from "./ui.js";
import {openTrade,renderTrades} from "./trades.js";
import {initRisk,riskToTrade} from "./risk.js";
import {renderCalendar} from "./calendar.js";
import {renderAnalytics} from "./analytics.js";
import {renderPlaybook} from "./playbook.js";
import {renderBacktests} from "./backtesting.js";
import {renderReviews} from "./reviews.js";
import {renderSettings,saveSettings} from "./settings.js";

const meta={
 home:["Dashboard","Your trading process at a glance."],trades:["Trades","Record, review and manage every trade."],risk:["Risk Calculator","Size every trade before you enter."],
 calendar:["Calendar","See your trading activity day by day."],analytics:["Analytics","See what your data is actually saying."],playbook:["Playbook","Your personal setup library."],
 backtesting:["Backtesting","Test ideas separately from live trading."],reviews:["Reviews","Daily, weekly and monthly process reviews."],settings:["Settings","Backup, permissions and device preferences."]
};
export function go(page){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id==="page-"+page));document.querySelectorAll("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page===page));pageTitle.textContent=meta[page][0];pageSub.textContent=meta[page][1];window.scrollTo({top:0,behavior:"smooth"});renderAll()}
function buildBottom(){const items=[["home","⌂","Home"],["trades","↗","Trades"],["risk","⌁","Risk"],["calendar","▦","Calendar"],["analytics","◔","Stats"],["more","⋯","More"]];bottomNav.innerHTML=items.map(x=>x[0]==="more"?`<button data-more="1"><i>${x[1]}</i>${x[2]}</button>`:`<button data-page="${x[0]}"><i>${x[1]}</i>${x[2]}</button>`).join("");bottomNav.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>go(b.dataset.page));bottomNav.querySelector("[data-more]")?.addEventListener("click",openMoreMenu)}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
buildBottom();initSelects();initRisk();

document.getElementById("filterDir")?.addEventListener("change",renderTrades);
document.getElementById("filterResult")?.addEventListener("change",renderTrades);
document.getElementById("anPeriod")?.addEventListener("change",renderAnalytics);

export function openMoreMenu(){
  openModal(`<div class="modal-head"><h2>More</h2><button class="x" onclick="closeModal()">×</button></div>
    <div class="stack-actions" style="display:grid;gap:10px">
      <button class="btn" onclick="go('playbook');closeModal()">▤ Playbook</button>
      <button class="btn" onclick="go('backtesting');closeModal()">◉ Backtesting</button>
      <button class="btn" onclick="go('reviews');closeModal()">✓ Reviews</button>
      <button class="btn" onclick="go('settings');closeModal()">⚙ Settings</button>
    </div>`);
}

window.openTradeWithRisk=(x)=>{go("trades");setTimeout(()=>{openTrade();setTimeout(()=>{t_entry.value=x.e;t_sl.value=x.sl;t_target.value=x.t;t_qty.value=x.qty;t_direction.value=x.dir;document.querySelector('[data-select="t_direction"] .app-select-trigger').textContent=x.dir},0)},0)}

function renderHome(){const s=tradeStats();sPnl.textContent=(s.pnl>=0?"+":"-")+"₹"+new Intl.NumberFormat("en-IN",{maximumFractionDigits:2}).format(Math.abs(s.pnl));sPnl.className=s.pnl>=0?"green":"red";sR.textContent=(s.sum>=0?"+":"")+s.sum.toFixed(2)+"R";sR.className=s.sum>=0?"green":"red";sWin.textContent=s.wr.toFixed(1)+"%";sTrades.textContent=s.a.length;pf.textContent=s.pf===0?"—":s.pf==="∞"?"∞":s.pf.toFixed(2);exp.textContent=s.a.length?(s.exp>=0?"+":"")+s.exp.toFixed(2)+"R":"—";dd.textContent=s.dd.toFixed(2)+"R";best.textContent=s.a.length?(s.best>=0?"+":"")+s.best.toFixed(2)+"R":"—";avgw.textContent=s.wins.length?"+"+s.avgw.toFixed(2)+"R":"—";avgl.textContent=s.loss.length?s.avgl.toFixed(2)+"R":"—";let eq=0,vals=[];s.a.slice().reverse().forEach(t=>{eq+=+t.r||0;vals.push(eq)});equityChart.innerHTML=chartSVG(vals);equityRange.textContent=s.a.length?`${s.a.length} trades`:"No trades";recent.innerHTML=s.a.length?`<div class="trade-list">${s.a.slice(0,5).map(tradeCard).join("")}</div>`:"<div class=\"empty\"><div><b>Your journal is empty</b><span>Start with one completed trade.</span></div></div>";let streak=0;for(const t of s.a){if(t.r>0)streak++;else break}streakBox.innerHTML=`<div><b>${streak} winning trade${streak===1?"":"s"} in current streak</b><span>Based on your latest recorded trades.</span></div>`}

export function renderAll(){initSelects();renderHome();renderTrades();renderAnalytics();renderPlaybook();renderBacktests();renderReviews();renderSettings();if(document.getElementById("page-calendar").classList.contains("active"))renderCalendar()}
window.addEventListener("tv:data",renderAll);
renderAll();
document.getElementById("page-calendar").addEventListener("click",()=>renderCalendar());

window.go=go;window.riskToTrade=riskToTrade;window.renderTrades=renderTrades;window.renderAnalytics=renderAnalytics;window.openMoreMenu=openMoreMenu;
