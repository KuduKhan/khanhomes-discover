"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {
 ArrowRight,ArrowUpRight,BadgeCheck,Check,Compass,MapPin,SlidersHorizontal,
 Sparkles,ShieldCheck,Target,Wallet,Layers3,Flower2,RotateCcw,Info
} from "lucide-react";
import {formatKes,type Listing} from "@/lib/catalog";
import {PropertyPhoto} from "@/components/property-card";
import {POPULAR_AMENITIES} from "@/lib/filters";
import {DEFAULT_MATCH_PREFERENCES,MATCH_STORAGE_KEY,normalizeMatchPreferences,rankHomeMatches,type MatchPreferences,type MatchWeights} from "@/lib/match-engine";
type Props={listings:Listing[];mode:"preview"|"live"};
const priorities=[
 {key:"location",label:"Location",icon:MapPin,detail:"Preferred county"},
 {key:"budget",label:"Budget",icon:Wallet,detail:"Monthly rent or sale price"},
 {key:"space",label:"Space",icon:Layers3,detail:"Bedrooms and floor area"},
 {key:"features",label:"Lifestyle",icon:Flower2,detail:"Amenities and finishes"}
] as const;
export function MatchStudio({listings,mode}:Props){
 const counties=useMemo(()=>["Any county",...new Set(listings.map(x=>x.county))],[listings]);
 const amenities=useMemo(()=>POPULAR_AMENITIES.filter(x=>listings.some(home=>home.amenities.includes(x))),[listings]);
 const [ready,setReady]=useState(false);
 const [preferences,setPreferences]=useState<MatchPreferences>({...DEFAULT_MATCH_PREFERENCES,amenities:[],weights:{...DEFAULT_MATCH_PREFERENCES.weights}});
 const [feedback,setFeedback]=useState("");
 const [expanded,setExpanded]=useState<string|null>(null);
 useEffect(()=>{
  const syncPreferences=()=>{
   try{
    const raw=localStorage.getItem(MATCH_STORAGE_KEY);
    setPreferences(normalizeMatchPreferences(raw?JSON.parse(raw):null,counties));
   }catch{
    setPreferences(normalizeMatchPreferences(null,counties));
   }
  };
  syncPreferences();setReady(true);
  const onStorage=(event:StorageEvent)=>{
   if(event.key===MATCH_STORAGE_KEY||event.key===null){
    syncPreferences();setFeedback("Matching preferences refreshed from another tab.");
   }
  };
  window.addEventListener("storage",onStorage);
  return()=>window.removeEventListener("storage",onStorage);
 },[counties]);
 const update=(change:Partial<MatchPreferences>)=>{
  setPreferences(old=>{
   const next={...old,...change};
   try{localStorage.setItem(MATCH_STORAGE_KEY,JSON.stringify(next));setFeedback("Preferences saved on this device.");}
   catch{setFeedback("Browser storage unavailable. Preferences are held only in this tab.");}
   return next;
  });
 };
 const score=useMemo(()=>rankHomeMatches(listings,preferences),[listings,preferences]);
 const reset=()=>update({...DEFAULT_MATCH_PREFERENCES,amenities:[],weights:{...DEFAULT_MATCH_PREFERENCES.weights}});
 return <div className="match-studio">
  <div className="match-intro"><div>
   <span className="section-kicker"><Sparkles size={16}/> AURA MATCH STUDIO · PERSONALIZED DISCOVERY</span>
   <h2>Homes ranked around <em>your priorities.</em></h2>
   <p>Tell Discover what matters most. We rank existing catalog homes with clear, inspectable criteria—not generated addresses, AI guesses or availability promises.</p>
  </div><div className="match-notice"><ShieldCheck size={18}/>{mode==="preview"?"Illustrative previews only — no real homes or prices":"Scores reflect preferences, not verification or booking availability"}</div></div>
  <div className="match-layout">
   <aside className="match-controls" aria-label="Home-matching preferences">
    <div className="match-control-header"><span><SlidersHorizontal size={20}/> Your preferences</span><button type="button" onClick={reset}><RotateCcw size={14}/> Reset</button></div>
    <div className="match-control-grid">
     <fieldset className="match-toggle"><legend>What are you looking for?</legend>
      <label><input type="radio" name="match-type" checked={preferences.type==="rent"} onChange={()=>update({type:"rent",maxPriceKes:null})}/> To rent</label>
      <label><input type="radio" name="match-type" checked={preferences.type==="sale"} onChange={()=>update({type:"sale",maxPriceKes:null})}/> To buy</label>
     </fieldset>
     <label className="match-field">Preferred county
      <select value={preferences.county} onChange={e=>update({county:e.target.value})}>{counties.map(c=><option key={c} value={c}>{c}</option>)}</select>
     </label>
     <label className="match-field">Maximum {preferences.type==="rent"?"monthly rent":"asking price"} (KES)
      <input type="number" min="1" max="1000000000000" step={preferences.type==="rent"?"1000":"100000"} value={preferences.maxPriceKes??""}
       onChange={e=>update({maxPriceKes:e.target.value?Math.max(1,Math.min(1000000000000,Math.floor(Number(e.target.value)||1))):null})}
       placeholder="Any budget"/>
     </label>
     <div className="match-field-pair">
      <label className="match-field">Minimum bedrooms
       <select value={preferences.minBeds} onChange={e=>update({minBeds:Number(e.target.value)})}>
        {[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n===0?"Any / studio":n+"+"}</option>)}
       </select>
      </label>
      <label className="match-field">Minimum area
       <select value={preferences.minSqm} onChange={e=>update({minSqm:Number(e.target.value)})}>
        {[0,40,70,100,150,200,300].map(n=><option key={n} value={n}>{n===0?"Any":n+"+ m²"}</option>)}
       </select>
      </label>
     </div>
    </div>
    <fieldset className="match-feature-fieldset"><legend>Lifestyle preferences</legend>
     <div className="match-feature-tags">
      {[{id:"Parking",label:"Parking"},{id:"Furnished",label:"Furnished"},...amenities.filter(x=>x!=="Parking").map(x=>({id:x,label:x}))].map(item=>{
       const checked=item.id==="Parking"?preferences.parking:item.id==="Furnished"?preferences.furnished:preferences.amenities.includes(item.id);
       return <label className={checked?"selected":""} key={item.id}>
        <input type="checkbox" checked={checked} onChange={e=>{
         if(item.id==="Parking")update({parking:e.target.checked});
         else if(item.id==="Furnished")update({furnished:e.target.checked});
         else update({amenities:e.target.checked?[...preferences.amenities,item.id]:preferences.amenities.filter(x=>x!==item.id)});
        }}/>
        {checked&&<Check size={14}/>} {item.label}
       </label>;
      })}
     </div>
    </fieldset>
    <fieldset className="match-priorities"><legend>What matters most? <small>1 = flexible · 5 = important</small></legend>
      {priorities.map(({key,label,icon:Icon,detail})=><label key={key} className="match-weight">
       <span><Icon size={17}/><span><strong>{label}</strong><small>{detail}</small></span></span>
       <span className="match-weight-slider"><input type="range" min="1" max="5" step="1" value={preferences.weights[key]} aria-label={label+" priority"}
        onChange={e=>update({weights:{...preferences.weights,[key]:Number(e.target.value)} as MatchWeights})}/><output>{preferences.weights[key]}/5</output></span>
      </label>)}
    </fieldset>
    <div className="match-privacy"><Info size={16}/><p>Preferences stay on this device. The matching algorithm is deterministic, auditable, and uses only the properties currently in Discover. It does not run background searches or access private KhanHomes records.</p></div>
   </aside>
   <div className="match-results" aria-live="polite">
    <div className="match-results-head"><div><span className="section-kicker">YOUR RANKED SHORTLIST</span><h3>{score.length} {score.length===1?"possibility":"possibilities"} to explore</h3></div><span><Target size={17}/> Explained matching</span></div>
    {!ready&&<p className="match-status">Loading your saved preferences…</p>}
    {score.length===0?<div className="match-empty"><Compass size={35}/><h3>No matching homes in this catalog.</h3><p>Try switching rent/buy or reducing your requirements. Discover does not create listings to fill gaps.</p></div>:<div className="match-cards">
     {score.slice(0,12).map((item,i)=><article className="match-card" key={item.home.id}>
      <Link className="match-photo" href={"/homes/"+item.home.slug} aria-label={"View "+item.home.title}><PropertyPhoto src={item.home.images[0]??""} title={item.home.title}/></Link>
      <div className="match-card-body">
       <div className="match-card-top"><span>#{i+1} · {item.home.source==="demo"?"CONCEPT PROPERTY":"PUBLISHED SNAPSHOT"}</span><div className="match-score"><strong>{item.score}</strong><small>/ 100</small></div></div>
       <h4><Link href={"/homes/"+item.home.slug}>{item.home.title}<ArrowUpRight size={16}/></Link></h4>
       <p><MapPin size={14}/>{item.home.area} · {formatKes(item.home.priceKes)}{item.home.type==="rent"?"/mo":""}</p>
       <div className="match-insights">
        {item.highlights.slice(0,2).map(h=><span key={h} className="match-positive"><Check size={13}/>{h}</span>)}
        {item.tradeoffs.slice(0,1).map(h=><span key={h} className="match-caution">{h}</span>)}
       </div>
       <button type="button" className="match-explain" onClick={()=>setExpanded(expanded===item.home.id?null:item.home.id)}
        aria-expanded={expanded===item.home.id} aria-controls={"match-breakdown-"+item.home.id}>
        <BadgeCheck size={16}/> {expanded===item.home.id?"Hide score details":"Why this match?"}<ArrowRight size={15}/>
       </button>
       {expanded===item.home.id&&<div id={"match-breakdown-"+item.home.id} className="match-breakdown">
        {item.factors.map(f=><div key={f.key}><span>{f.label}<small>{f.explanation}</small></span><div className="match-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={f.score} aria-label={f.label+" fit"}><span style={{width:f.score+"%"}}/></div><strong>{f.score}/100</strong></div>)}
        {item.tradeoffs.length>0&&<p><strong>Consider:</strong> {item.tradeoffs.join("; ")}.</p>}
        <p>A preference score is not a valuation, guarantee of availability, verified ownership, or suitability assessment.</p>
       </div>}
      </div>
     </article>)}
    </div>}
    <div className="match-after"><ShieldCheck size={17}/><span>Only published/catalog fields are scored. {mode==="preview"?"These examples are fictional.":"Publication and availability should still be independently confirmed."}</span><Link href="/#homes">All homes <ArrowRight size={15}/></Link></div>
   </div>
  </div>
  {feedback&&<p className="match-feedback" role="status">{feedback}</p>}
 </div>;
}
