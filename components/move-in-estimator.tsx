"use client";
import {useState} from "react";
import {Calculator,ChevronDown,Info,Receipt,Wallet} from "lucide-react";
import {formatKes} from "@/lib/catalog";
import {defaultMoveInInput,estimateMoveInCost,type MoveInInput} from "@/lib/move-in-costs";
export function MoveInEstimator({monthlyRent}:{monthlyRent:number}){
 const [input,setInput]=useState<MoveInInput>(()=>defaultMoveInInput(monthlyRent));
 const values=estimateMoveInCost({...input,monthlyRent});
 const set=(key:"depositMonths"|"serviceCharge"|"utilitySetup"|"movingBudget",value:number)=>
  setInput(old=>({...old,[key]:Math.max(0,Number.isFinite(value)?value:0)}));
 return <section className="move-in-estimator" aria-label="Move-in cost estimator">
  <div className="estimator-intro">
   <span className="estimator-icon"><Calculator size={22}/></span>
   <div><span className="section-kicker">PLAN WITH CLARITY</span><h2>Estimate your move-in cost.</h2><p>Adjust the assumptions to explore your upfront budget. These are your estimates, <strong>not verified listing charges</strong>.</p></div>
  </div>
  <div className="estimator-inputs">
   <label><span>Deposit duration</span><select aria-label="Deposit months" value={input.depositMonths} onChange={e=>set("depositMonths",Number(e.target.value))}>
    {[0,1,2,3].map(n=><option key={n} value={n}>{n===0?"No deposit assumed":n+" "+(n===1?"month":"months")}</option>)}
   </select><ChevronDown size={15}/></label>
   <label><span>Monthly service charge (KES)</span><input type="number" min="0" max="1000000" step="100" value={input.serviceCharge} onChange={e=>set("serviceCharge",Number(e.target.value))}/></label>
   <label><span>Utilities/setup allowance (KES)</span><input type="number" min="0" max="1000000" step="100" value={input.utilitySetup} onChange={e=>set("utilitySetup",Number(e.target.value))}/></label>
   <label><span>Moving allowance (KES)</span><input type="number" min="0" max="1000000" step="100" value={input.movingBudget} onChange={e=>set("movingBudget",Number(e.target.value))}/></label>
  </div>
  <div className="estimator-breakdown">
    <div><span>First month&apos;s rent</span><strong>{formatKes(values.firstMonthRent)}</strong></div>
    <div><span>Refundable deposit assumption</span><strong>{formatKes(values.deposit)}</strong></div>
    <div><span>Service, utility and moving allowances</span><strong>{formatKes(values.serviceCharge+values.utilitySetup+values.movingBudget)}</strong></div>
    <div className="estimator-total"><span><Wallet size={18}/> Estimated upfront amount</span><strong>{formatKes(values.total)}</strong></div>
    <div className="estimator-monthly"><span><Receipt size={15}/> Estimated recurring rent + service</span><strong>{formatKes(values.ongoingMonthly)} / mo</strong></div>
  </div>
  <p className="estimator-notice"><Info size={16}/> Illustrative calculation only; no taxes, interest, bank fees, or actual owner-quoted charges are implied. Confirm deposits and all costs with the verified property representative.</p>
 </section>;
}
