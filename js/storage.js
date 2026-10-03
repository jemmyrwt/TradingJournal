export const KEY="tradevault_v2";
const defaults=()=>({trades:[],setups:[],reviews:[],backtests:[],settings:{name:"",market:"",capital:0}});
export function loadDB(){
 try{
  const raw=localStorage.getItem(KEY);
  const db=raw?JSON.parse(raw):defaults();
  db.trades??=[]; db.setups??=[]; db.reviews??=[]; db.backtests??=[]; db.settings={...defaults().settings,...(db.settings||{})};
  return db;
 }catch{return defaults()}
}
export let db=loadDB();
export function saveDB(){localStorage.setItem(KEY,JSON.stringify(db));window.dispatchEvent(new CustomEvent("tv:data"));return db}
export function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
export function money(n){return new Intl.NumberFormat("en-IN",{maximumFractionDigits:2}).format(Number(n)||0)}
export function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
export function tradeStats(arr=db.trades){
 const a=[...arr],wins=a.filter(t=>Number(t.r)>0),loss=a.filter(t=>Number(t.r)<0),sum=a.reduce((s,t)=>s+(Number(t.r)||0),0),pnl=a.reduce((s,t)=>s+(Number(t.pnl)||0),0);
 let eq=0,peak=0,dd=0; a.slice().reverse().forEach(t=>{eq+=Number(t.r)||0;peak=Math.max(peak,eq);dd=Math.min(dd,eq-peak)});
 const pf=loss.length?wins.reduce((s,t)=>s+t.r,0)/Math.abs(loss.reduce((s,t)=>s+t.r,0)):wins.length?"∞":0;
 return {a,wins,loss,sum,pnl,wr:a.length?wins.length/a.length*100:0,pf,exp:a.length?sum/a.length:0,dd,best:a.length?Math.max(...a.map(t=>Number(t.r)||0)):0,avgw:wins.length?wins.reduce((s,t)=>s+t.r,0)/wins.length:0,avgl:loss.length?loss.reduce((s,t)=>s+t.r,0)/loss.length:0,rule:a.length?a.filter(t=>t.rule).length/a.length*100:0}
}
