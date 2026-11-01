"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,CalendarClock,CalendarPlus,Check,Clock3,Download,Info,MapPin,Plus,ShieldCheck,Trash2} from "lucide-react";
import {type Listing,formatKes} from "@/lib/catalog";
import {TENTATIVE_VISITS_KEY,buildTentativeIcs,hasVisitClash,normalizeTentativeVisits,type TentativeVisit} from "@/lib/calendar-export";
type Props={listings:Listing[];mode:"preview"|"live"};
export function VisitPlanner({listings,mode}:Props){
 const [visits,setVisits]=useState<TentativeVisit[]>([]);
 const [listingId,setListingId]=useState(listings[0]?.id??"");
 const [day,setDay]=useState("");
 const [time,setTime]=useState("10:00");
 const [note,setNote]=useState("");
 const [ready,setReady]=useState(false);
 const [feedback,setFeedback]=useState("");
 const byId=useMemo(()=>new Map(listings.map(x=>[x.id,x])),[listings]);
 const upcoming=useMemo(()=>visits.filter(x=>byId.has(x.listingId)).sort((a,b)=>(a.day+"T"+a.time).localeCompare(b.day+"T"+b.time)),[visits,byId]);
 useEffect(()=>{try{setVisits(normalizeTentativeVisits(JSON.parse(localStorage.getItem(TENTATIVE_VISITS_KEY)??"[]")));}catch{}setReady(true);},[]);
 const persist=(next:TentativeVisit[])=>{
  setVisits(next);
  try{localStorage.setItem(TENTATIVE_VISITS_KEY,JSON.stringify(next));setFeedback("Personal itinerary saved on this device.");}
  catch{setFeedback("Storage unavailable. Changes will not survive a reload.");}
 };
 const add=(event:React.FormEvent)=>{
  event.preventDefault();
  if(!byId.has(listingId)){setFeedback("Select a home from the current catalog.");return;}
  if(visits.length>=30){setFeedback("Maximum 30 personal visit ideas.");return;}
  const item={id:crypto.randomUUID(),listingId,day,time,note:note.trim().slice(0,240)};
  if(normalizeTentativeVisits([item]).length===0){setFeedback("Select a valid date and time.");return;}
  persist([...visits,item]);setNote("");
 };
 const download=()=>{
  if(!upcoming.length)return;
  const calendar=buildTentativeIcs(upcoming,new Map(listings.map(x=>[x.id,x.title])));
  const blob=new Blob([calendar],{type:"text/calendar;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");anchor.href=url;anchor.download="khanhomes-discover-tentative-visits.ics";anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  setFeedback("Calendar exported. Events are explicitly tentative, not confirmed bookings.");
 };
 const removedCount=visits.length-upcoming.length;
 return <section className="visit-planner">
  <div className="visit-intro"><div><span className="section-kicker">YOUR PRIVATE VISIT PLAN</span><h2>Explore on <em>your own schedule.</em></h2>
   <p>Prepare potential viewing dates, spot overlapping plans, and export a tentative calendar. Only a verified agent or manager can confirm an actual appointment.</p></div>
   <span className="visit-mode"><ShieldCheck size={17}/>{mode==="preview"?"Fictional home previews":"Personal plans · not agent bookings"}</span>
  </div>
  <div className="visit-layout">
   <form className="visit-editor" onSubmit={add} aria-label="Add a tentative viewing plan">
    <div className="visit-panel-head"><CalendarPlus size={22}/><h3>Plan a potential visit</h3></div>
    <label>Home
     <select required aria-label="Choose home" value={listingId} onChange={e=>setListingId(e.target.value)}>
      {listings.map(home=><option key={home.id} value={home.id}>{home.title} · {home.county}</option>)}
     </select>
    </label>
    <div className="visit-fields">
     <label>Date<input type="date" required value={day} onChange={e=>setDay(e.target.value)} /></label>
     <label>Local time (EAT)<input type="time" required value={time} onChange={e=>setTime(e.target.value)} /></label>
    </div>
    <label>Preparation note <small>Optional · avoid sensitive details</small>
     <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} maxLength={240} placeholder="e.g. Ask about water, parking and all upfront charges"/>
    </label>
    <button type="submit" disabled={!listings.length}><Plus size={18}/> Add tentative plan</button>
    <p><Info size={16}/> Creating a personal plan does not contact a landlord, reserve a unit, or book any appointment.</p>
   </form>
   <div className="visit-list" aria-label="Your tentative viewing itinerary">
    <div className="visit-panel-head"><CalendarClock size={22}/><div><h3>Personal itinerary</h3><span>{ready?upcoming.length+" visible home plans":"Loading local plans…"}</span></div></div>
    {ready&&upcoming.length===0?<div className="visit-empty"><CalendarClock size={28}/><h4>No plans on your calendar yet.</h4><p>Choose a home and set a tentative date. Confirm the visit separately with an authorized representative.</p></div>:
     <ol className="visit-timeline">{upcoming.map((item,i)=>{
      const home=byId.get(item.listingId)!;
      const clashes=upcoming.filter(other=>hasVisitClash(item,other));
      return <li key={item.id} className="visit-row"><span className="visit-index">{String(i+1).padStart(2,"0")}</span><div>
       <div className="visit-row-top"><strong>{new Date(item.day+"T12:00:00+03:00").toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric",timeZone:"Africa/Nairobi"})} · {item.time} EAT</strong><button type="button" onClick={()=>persist(visits.filter(x=>x.id!==item.id))} aria-label={"Remove planned visit for "+home.title}><Trash2 size={16}/></button></div>
       <h4><Link href={"/homes/"+home.slug}>{home.title} <ArrowRight size={15}/></Link></h4>
       <p><MapPin size={13}/>{home.area} · {formatKes(home.priceKes)}</p>
       {item.note&&<blockquote>{item.note}</blockquote>}
       {clashes.length>0&&<span className="visit-clash">Potential overlap with {clashes.length} other personal {clashes.length===1?"plan":"plans"}</span>}
       <small><Check size={13}/> Tentative · not a booking</small>
      </div></li>;
     })}</ol>}
    {removedCount>0&&<p className="visit-orphan">{removedCount} old {removedCount===1?"plan references a":"plans reference"} home no longer visible in the current catalog. It will not be included in the export.</p>}
    {upcoming.length>0&&<button type="button" className="visit-export" onClick={download}><Download size={17}/> Export tentative calendar (.ics)</button>}
   </div>
  </div>
  <div className="visit-safety"><ShieldCheck size={19}/><p>For a real visit, contact an authenticated property representative, reconfirm current availability and charges, and never share access codes or financial documents through public messages. {mode==="preview"?"All properties shown in this preview are fictional.":""}</p></div>
  {feedback&&<p className="match-feedback" role="status">{feedback}</p>}
 </section>;
}
