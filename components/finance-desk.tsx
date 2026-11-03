"use client";
import {useMemo,useState} from "react";
import {Calculator,CheckCircle2,ChevronDown,Home,Info,Landmark,RotateCcw,ShieldCheck,Wallet,ArrowRight} from "lucide-react";
import {DEFAULT_FINANCE,estimateHousingScenario,finiteRange,type FinanceInput} from "@/lib/finance-scenario";
import {formatKes} from "@/lib/catalog";
type Key=keyof FinanceInput;
const fields:{key:Key;label:string;min:number;max:number;step:number;help:string}[]=[
 {key:"price",label:"Illustrative purchase price (KES)",min:0,max:1e10,step:50000,help:"An example asking price, not a valuation."},
 {key:"depositPercent",label:"Down payment (%)",min:0,max:100,step:1,help:"Your contribution toward the purchase price."},
 {key:"annualRatePercent",label:"Annual mortgage interest (%)",min:0,max:100,step:.25,help:"Hypothetical fixed nominal annual rate; actual terms vary."},
 {key:"years",label:"Loan term (years)",min:1,max:50,step:1,help:"Assumes regular monthly payments and no early repayment."},
 {key:"monthlyIncome",label:"Monthly take-home income (KES)",min:0,max:1e10,step:5000,help:"Private: this value stays in this page, not your account."},
 {key:"monthlyOtherDebt",label:"Other monthly debt payments (KES)",min:0,max:1e10,step:1000,help:"Include other obligations for the income ratio."},
 {key:"monthlyFees",label:"Monthly ownership costs (KES)",min:0,max:1e10,step:1000,help:"Estimated service, maintenance, insurance and other ongoing costs."},
 {key:"upfrontFees",label:"Purchase closing costs (KES)",min:0,max:1e10,step:1000,help:"Estimate taxes, legal fees and other one-off purchase charges."},
 {key:"monthlyRent",label:"Alternative monthly rent (KES)",min:0,max:1e10,step:1000,help:"Comparable rental assumption; no verified rental quotation."},
 {key:"rentDepositMonths",label:"Rental deposit (months)",min:0,max:6,step:1,help:"Refundable assumption; treated as cash needed, not a nonrefundable cost."},
 {key:"movingAllowance",label:"Moving/setup allowance (KES)",min:0,max:1e10,step:1000,help:"Applies to both alternatives in this simplified scenario."}
];
function money(n:number){return formatKes(Math.round(n));}
export function FinanceDesk({mode}:{mode:"preview"|"live"}){
 const [input,setInput]=useState<FinanceInput>(DEFAULT_FINANCE);
 const [expanded,setExpanded]=useState(false);
 const values=useMemo(()=>estimateHousingScenario(input),[input]);
 const update=(key:Key,value:string)=>{
  const field=fields.find(f=>f.key===key);
  const parsed=value===""?0:Number(value);
  const bounded=finiteRange(parsed,field?.min??0,field?.max??1e10);
  setInput(old=>({...old,[key]:bounded}));
 };
 const caution=input.monthlyIncome>0&&values.incomeSharePercent>40;
 return <div className="finance-desk">
 <div className="finance-intro"><div><span className="section-kicker"><Calculator size={15}/> KHANHOMES DISCOVER / FINANCE DESK</span>
 <h1>Make your next move <em>make sense.</em></h1>
 <p>Explore mortgage payments, move-in cash and the difference between renting and buying. Every number is based on your inputs—no lender offers, approvals or live market rates.</p></div>
 <div className="finance-preview"><ShieldCheck size={19}/><span>{mode==="preview"?"Illustrative preview homes":"Independent scenario tool"}<small>No application · No credit check</small></span></div></div>
 <div className="finance-layout">
 <section className="finance-controls" aria-labelledby="finance-inputs"><div className="finance-panel-heading"><span className="finance-panel-icon"><Landmark size={21}/></span><div><h2 id="finance-inputs">Your scenario</h2><p>Adjust assumptions. Nothing is submitted.</p></div><button type="button" className="finance-reset" onClick={()=>setInput(DEFAULT_FINANCE)}><RotateCcw size={15}/> Reset</button></div>
 <div className="finance-fields">{fields.slice(0,5).map(f=><label key={f.key} className="finance-field"><span>{f.label}</span><input type="number" min={f.min} max={f.max} step={f.step} value={input[f.key]} onChange={e=>update(f.key,e.target.value)} aria-describedby={"help-"+f.key}/><small id={"help-"+f.key}>{f.help}</small></label>)}</div>
 <button type="button" className="finance-more" aria-expanded={expanded} onClick={()=>setExpanded(!expanded)}>Additional fees and rental assumptions <ChevronDown size={16}/></button>
 {expanded&&<div className="finance-fields finance-extra">{fields.slice(5).map(f=><label key={f.key} className="finance-field"><span>{f.label}</span><input type="number" min={f.min} max={f.max} step={f.step} value={input[f.key]} onChange={e=>update(f.key,e.target.value)} aria-describedby={"help-"+f.key}/><small id={"help-"+f.key}>{f.help}</small></label>)}</div>}
 </section>
 <div className="finance-results" aria-live="polite">
 <div className="finance-metric-main"><span><Wallet size={17}/> ESTIMATED MONTHLY MORTGAGE</span><strong>{money(values.monthlyPayment)}</strong><small>Principal and interest only · hypothetical rate</small></div>
 <div className="finance-stat-grid"><article><span><Home size={16}/> Cash needed to buy</span><strong>{money(values.initialCash)}</strong><small>Down payment + upfront fees + moving</small></article><article><span><Wallet size={16}/> Cash needed to rent</span><strong>{money(values.rentInitialCash)}</strong><small>First month + assumed deposit + moving</small></article><article><span>Monthly ownership total</span><strong>{money(values.monthlyHousingCost)}</strong><small>Mortgage + estimated monthly ownership costs</small></article><article><span>Total loan interest</span><strong>{money(values.totalInterest)}</strong><small>Across {Math.max(1,Math.min(50,Number.isFinite(input.years)?input.years:1))} years at an unchanged rate</small></article></div>
 <div className="finance-share"><div><strong>Housing and debt / income</strong><span>{input.monthlyIncome>0?values.incomeSharePercent.toFixed(1)+"%":"Enter an income"}</span></div>{input.monthlyIncome>0?
  <div className="finance-share-track" role="meter" aria-label="Share of take-home income for ownership and debts" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100,values.incomeSharePercent)} aria-valuetext={values.incomeSharePercent.toFixed(1)+" percent of take-home income"}><span style={{width:Math.min(100,values.incomeSharePercent)+"%"}}/></div>:
  <p className="finance-share-unavailable">Enter a monthly income to calculate this ratio; no percentage is assumed.</p>}<p>{caution?"This scenario may put substantial pressure on your budget. The 40% marker is a planning prompt, not a lender qualification threshold.":"A personal budgeting indicator—not an eligibility or credit decision."}</p></div>
 <div className="finance-comparison"><h2>First-year cash-flow snapshot</h2><div><span>Rent scenario</span><strong>{money(values.rentYearOneCash)}</strong></div><div><span>Buy scenario</span><strong>{money(values.buyYearOneCash)}</strong></div><p><Info size={15}/> These figures are cash outlays, not equivalent economic costs: a deposit may be refundable, and mortgage payments build some equity. Price changes, opportunity cost, inflation, tax, repairs and resale costs are not modeled.</p></div>
 </div></div>
 <div className="finance-bottom"><div><CheckCircle2 size={19}/><span><strong>Private by design.</strong> Inputs remain in memory on this device; no financial details are saved, transmitted or linked to KhanHomes.</span></div><a href="/match">Explore AURA Match <ArrowRight size={16}/></a></div>
 </div>;
}
