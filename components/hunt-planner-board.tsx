"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {ArrowRight,BadgeCheck,CalendarDays,Check,CheckSquare2,Download,Upload,Heart,Info,NotebookPen,Printer,ShieldCheck,Star,Trash2} from "lucide-react";
import {type Listing,formatKes} from "@/lib/catalog";
import {assessmentCompletion,exportSafePlanner,HUNT_CHECKLIST,HUNT_PLANNER_KEY,initialAssessment,safeAssessments,type CheckId,type HomeAssessment} from "@/lib/hunt-planner";
import {PropertyPhoto} from "@/components/property-card";
import {mergePlannerImport,parsePlannerImport} from "@/lib/planner-portability";
import {DISCOVER_FAVORITES_KEY,normalizeFavoriteIds,readStoredList} from "@/lib/local-preferences";
export function HuntPlannerBoard({listings,mode}:{listings:Listing[];mode:"preview"|"live"}){
 const [ready,setReady]=useState(false);
 const [saved,setSaved]=useState<string[]>([]);
 const [assessments,setAssessments]=useState<HomeAssessment[]>([]);
 const [selected,setSelected]=useState("");
 const [status,setStatus]=useState("");
 const importInput=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  const syncFavorites=()=>{
   try{setSaved(readStoredList(localStorage.getItem(DISCOVER_FAVORITES_KEY),normalizeFavoriteIds));}
   catch{setSaved([]);}
  };
  const syncNotes=()=>{
   try{setAssessments(readStoredList(localStorage.getItem(HUNT_PLANNER_KEY),safeAssessments));}
   catch{setAssessments([]);}
  };
  syncFavorites();syncNotes();setReady(true);
  const onStorage=(event:StorageEvent)=>{
   if(event.key===DISCOVER_FAVORITES_KEY||event.key===null)syncFavorites();
   if(event.key===HUNT_PLANNER_KEY||event.key===null){
    syncNotes();setStatus("Notebook updated from another tab.");
   }
  };
  window.addEventListener("storage",onStorage);
  return()=>window.removeEventListener("storage",onStorage);
 },[]);
 const available=useMemo(()=>listings.filter(x=>saved.includes(x.id)),[listings,saved]);
 const active=available.find(x=>x.id===selected)??available[0];
 const assessment=active?assessments.find(x=>x.listingId===active.id)??initialAssessment(active.id):null;
 const save=(next:HomeAssessment[])=>{
  setAssessments(next);
  try{localStorage.setItem(HUNT_PLANNER_KEY,JSON.stringify(next));setStatus("Notes saved on this device only.");}
  catch{setStatus("Browser storage unavailable; notes will not survive a reload.");}
 };
 const update=(change:Partial<HomeAssessment>)=>{
  if(!active||!assessment)return;
  const next:HomeAssessment={...assessment,...change,listingId:active.id,updatedAt:new Date().toISOString()};
  save([...assessments.filter(x=>x.listingId!==active.id),next]);
 };
 const mark=(id:CheckId,checked:boolean)=>{
  if(!assessment)return;
  update({checklist:checked?[...assessment.checklist,id]:assessment.checklist.filter(x=>x!==id)});
 };
 const exportNotes=()=>{
  const text=exportSafePlanner(assessments,available.map(x=>x.id));
  const blob=new Blob([text],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");
  anchor.href=url;anchor.download="khanhomes-discover-home-hunt-notes.json";anchor.click();
  URL.revokeObjectURL(url);
  setStatus("Your local notes were exported. Keep the file in a private location.");
 };
 const importNotes=async(file:File|undefined)=>{
  if(!file)return;
  if(file.size>100_000){setStatus("This file exceeds the 100 KB notebook import limit.");return;}
  try{
   const text=await file.text();
   const imported=parsePlannerImport(text,listings.map(x=>x.id));
   const merged=mergePlannerImport(assessments,imported);
   save(merged);
   setStatus("Imported "+imported.length+" matching home "+(imported.length===1?"assessment":"assessments")+". Newer notes were preserved. Saved homes remain unchanged.");
  }catch(error){setStatus(error instanceof Error?error.message:"Could not import this notebook.");}
  finally{if(importInput.current)importInput.current.value="";}
 };
 const clearCurrent=()=>{
  if(!active)return;
  save(assessments.filter(x=>x.listingId!==active.id));
  setStatus("Notes for this home cleared from local browser storage.");
 };
 return <section className="planner-wrap">
  <div className="planner-heading">
   <span className="section-kicker">YOUR HOUSE-HUNTING WORKSPACE</span>
   <h2>Make a more <em>confident choice.</em></h2>
   <p>Keep your shortlist, personal observations, and visit checklist in one calm space. These notes stay in this browser and are not shared with landlords or KhanHomes.</p>
  </div>
  <div className="planner-privacy-banner"><ShieldCheck size={19}/><span>Local-only notebook · Not a booking confirmation, condition report, or verification of any property. {mode==="preview"?"All displayed properties are fictional concept examples.":""}</span></div>
  {!ready?<p className="planner-loading">Loading your saved homes…</p>:available.length===0?
   <div className="planner-empty"><span><Heart size={29}/></span><h3>Your shortlist starts with one home.</h3><p>Explore homes, tap the heart to save a favorite, then return here to prepare your checklist and notes.</p><Link href="/#homes">Explore homes <ArrowRight size={16}/></Link></div>:
   <div className="planner-layout">
    <nav className="planner-sidebar" aria-label="Saved homes to assess">
     <div className="planner-sidebar-head"><strong>{available.length} saved {available.length===1?"home":"homes"}</strong><Link href="/#homes">Add homes <ArrowRight size={14}/></Link></div>
     {available.map(home=>{
      const note=assessments.find(x=>x.listingId===home.id);
      return <button key={home.id} type="button" className={"planner-home-tab"+(active?.id===home.id?" selected":"")} aria-pressed={active?.id===home.id} onClick={()=>setSelected(home.id)}>
       <PropertyPhoto src={home.images[0]??""} title={home.title}/>
       <span><strong>{home.title}</strong><small>{home.area}</small><small>{note?assessmentCompletion(note)+"% personally reviewed":"Not reviewed yet"}</small></span>
      </button>;
     })}
    </nav>
    {active&&assessment&&<div className="planner-detail">
      <div className="planner-detail-heading">
       <div><span className="section-kicker">{active.source==="demo"?"FICTIONAL CONCEPT HOME":"PUBLISHED LISTING"}</span><h3>{active.title}</h3><p>{active.area} · {formatKes(active.priceKes)}{active.type==="rent"?"/month":""}</p></div>
       <Link href={"/homes/"+active.slug}>View listing <ArrowRight size={15}/></Link>
      </div>
      <div className="planner-overview">
       <div><span><CheckSquare2 size={20}/></span><strong>{assessmentCompletion(assessment)}%</strong><small>Checklist completed</small></div>
       <div><span><CalendarDays size={20}/></span><strong>{assessment.plannedFor||"Not set"}</strong><small>Personal visit plan</small></div>
       <div><span><Star size={20}/></span><strong>{assessment.rating?assessment.rating+"/5":"Not rated"}</strong><small>Your impression</small></div>
      </div>
      <div className="planner-controls">
       <label><span><CalendarDays size={16}/> Date to visit (personal plan only)</span><input type="date" value={assessment.plannedFor} onChange={e=>update({plannedFor:e.target.value})}/></label>
       <div className="planner-rating" role="group" aria-label="Personal rating"><span>Personal rating</span><div>{[1,2,3,4,5].map(n=><button type="button" key={n} onClick={()=>update({rating:assessment.rating===n?0:n})} aria-label={"Rate "+n+" out of 5"} aria-pressed={assessment.rating===n}><Star size={21} fill={assessment.rating>=n?"currentColor":"none"}/></button>)}</div></div>
      </div>
      <section className="planner-checks"><div><h4>Home viewing checklist</h4><span>{assessment.checklist.length} of {HUNT_CHECKLIST.length} checked</span></div>
       <div className="planner-check-grid">{HUNT_CHECKLIST.map(entry=><label key={entry.id} className={assessment.checklist.includes(entry.id)?"checked":""}>
        <input type="checkbox" checked={assessment.checklist.includes(entry.id)} onChange={e=>mark(entry.id,e.target.checked)}/>
        <span><strong>{entry.question}</strong><small>{entry.hint}</small></span>
        {assessment.checklist.includes(entry.id)&&<Check size={17}/>}
       </label>)}</div>
      </section>
      <section className="planner-notes"><label htmlFor="planner-notes"><NotebookPen size={18}/> Your private observations</label>
       <textarea id="planner-notes" rows={5} maxLength={600} value={assessment.notes} onChange={e=>update({notes:e.target.value})} placeholder="Write personal impressions, questions to ask, and observations to verify. Do not store ID numbers, access codes, or sensitive information."/>
       <small>{assessment.notes.length}/600 characters · Saved only on this device</small>
      </section>
      <div className="planner-actions">
       <button type="button" onClick={exportNotes}><Download size={16}/> Export notes</button>
       <input ref={importInput} type="file" accept=".json,application/json" className="sr-only" aria-label="Import a KhanHomes Discover notebook" onChange={e=>void importNotes(e.target.files?.[0])}/>
       <button type="button" onClick={()=>importInput.current?.click()}><Upload size={16}/> Import notes</button>
       <button type="button" onClick={()=>window.print()}><Printer size={16}/> Print summary</button>
       <button type="button" className="planner-delete" onClick={clearCurrent}><Trash2 size={16}/> Clear this home&apos;s notes</button>
      </div>
      {status&&<p className="planner-status" role="status"><Info size={15}/>{status}</p>}
     </div>}
   </div>}
  <div className="planner-footer-note"><BadgeCheck size={17}/> A completed checklist records only your own observations. Professional inspections, ownership checks, verified lease terms, actual appointments, and payments require independent authorized processes.</div>
 </section>;
}
