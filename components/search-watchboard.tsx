"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,BellOff,BookmarkCheck,Check,Clock3,Eye,RefreshCw,Search,ShieldCheck,Trash2} from "lucide-react";
import {type Listing,formatKes} from "@/lib/catalog";
import {SEARCHES_KEY,normalizeSavedSearches,restoreSavedSearch,type SavedSearch} from "@/lib/saved-searches";
import {WATCH_KEY,checkSavedSearch,newSinceSnapshot,normalizeWatchSnapshots,type WatchSnapshot} from "@/lib/search-watch";
import {serializeFilters} from "@/lib/filters";
type Props={listings:Listing[];mode:"preview"|"live"};
export function SearchWatchboard({listings,mode}:Props){
 const [ready,setReady]=useState(false);
 const [searches,setSearches]=useState<SavedSearch[]>([]);
 const [watches,setWatches]=useState<WatchSnapshot[]>([]);
 const [feedback,setFeedback]=useState("");
 const counties=useMemo(()=>["All locations",...new Set(listings.map(x=>x.county))],[listings]);
 useEffect(()=>{
  const syncSearches=()=>{
   try{setSearches(normalizeSavedSearches(JSON.parse(localStorage.getItem(SEARCHES_KEY)??"[]")));}
   catch{setSearches([]);}
  };
  const syncWatches=()=>{
   try{setWatches(normalizeWatchSnapshots(JSON.parse(localStorage.getItem(WATCH_KEY)??"[]")));}
   catch{setWatches([]);}
  };
  syncSearches();syncWatches();setReady(true);
  const onStorage=(event:StorageEvent)=>{
   if(event.key===SEARCHES_KEY||event.key===null)syncSearches();
   if(event.key===WATCH_KEY||event.key===null)syncWatches();
  };
  window.addEventListener("storage",onStorage);
  return()=>window.removeEventListener("storage",onStorage);
 },[]);
 const check=(entry:SavedSearch)=>{
  const next=checkSavedSearch(entry,watches,listings,counties);
  setWatches(next);
  try{localStorage.setItem(WATCH_KEY,JSON.stringify(next));setFeedback("Current catalog matches recorded on this device.");}
  catch{setFeedback("Browser storage unavailable. This check is not persisted.");}
 };
 const forget=(entry:SavedSearch)=>{
  const next=searches.filter(x=>x.id!==entry.id),watched=watches.filter(x=>x.searchId!==entry.id);
  setSearches(next);setWatches(watched);
  try{localStorage.setItem(SEARCHES_KEY,JSON.stringify(next));localStorage.setItem(WATCH_KEY,JSON.stringify(watched));}
  catch{setFeedback("Browser storage unavailable; deletion cannot be persisted.");return;}
  setFeedback("Saved search removed from this device.");
 };
 return <section className="watchboard">
  <div className="watch-heading">
   <div><span className="section-kicker">YOUR SEARCH LIBRARY</span><h2>Keep an eye on <em>what matters.</em></h2>
    <p>Revisit your saved filters, compare today’s visible catalog with your last manual check, and notice newly appearing homes without tracking or background notifications.</p></div>
   <button type="button" className="watch-refresh" onClick={()=>window.location.reload()}><RefreshCw size={17}/> Refresh catalog</button>
  </div>
  <div className="watch-disclosure"><BellOff size={18}/><p><strong>Manual, device-local checks only.</strong> This is not an email, SMS, push or automatic monitoring service. {mode==="preview"?"All homes here are fictional UI examples.": "Only the catalog currently returned to your browser is compared; results may be incomplete for very large inventories."}</p></div>
  {!ready?<p className="watch-loading">Loading your saved searches…</p>:searches.length===0?
   <div className="watch-empty"><Search size={31}/><h3>Your search collection is empty.</h3><p>Browse homes, apply filters and use “Save search” to create a personal search watch.</p><Link href="/#homes">Find your homes <ArrowRight size={17}/></Link></div>:
   <div className="watch-list">
    {searches.map(entry=>{
     const snapshot=watches.find(x=>x.searchId===entry.id);
     const state=newSinceSnapshot(entry,snapshot,listings,counties);
     const filters=restoreSavedSearch(entry,counties);
     const query=serializeFilters(filters);
     return <article className="watch-entry" key={entry.id}>
      <div className="watch-entry-heading">
       <div><span><BookmarkCheck size={17}/> SAVED PREFERENCE</span><h3>{entry.label}</h3><small><Clock3 size={13}/>{snapshot?"Last manually checked "+new Date(snapshot.checkedAt).toLocaleString("en-KE"):"Not checked on this device yet"}</small></div>
       <span className="watch-match-count">{state.matches.length} catalog {state.matches.length===1?"match":"matches"}</span>
      </div>
      <div className="watch-entry-status">
       {snapshot?
        <span className={state.newHomes.length?"watch-has-new":""}><Eye size={16}/>{state.newHomes.length?state.newHomes.length+" newly appearing since last check":"No new matches since last check"}</span>:
        <span><ShieldCheck size={16}/> Establish a first baseline; existing results will not be misreported as new.</span>}
       <button type="button" onClick={()=>check(entry)}><Check size={16}/>{snapshot?"Mark current matches checked":"Establish baseline"}</button>
      </div>
      {state.newHomes.length>0&&<div className="watch-new-homes">
       {state.newHomes.slice(0,5).map(home=><Link href={"/homes/"+home.slug} key={home.id}>
        <span>{home.title}<small>{home.area}</small></span><strong>{formatKes(home.priceKes)}</strong><ArrowRight size={15}/>
       </Link>)}
      </div>}
      <div className="watch-entry-actions">
       <Link href={"/"+(query?"?"+query:"")+"#homes"}>Apply search <ArrowRight size={15}/></Link>
       <button type="button" onClick={()=>forget(entry)} aria-label={"Delete saved search "+entry.label}><Trash2 size={16}/> Remove</button>
      </div>
     </article>;
    })}
   </div>}
  <p className="watch-footer"><ShieldCheck size={17}/> A home appearing in the catalog is not proof of availability, a confirmed viewing or a completed owner verification.</p>
  {feedback&&<p role="status" className="match-feedback">{feedback}</p>}
 </section>;
}
