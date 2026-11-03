"use client";
import {useEffect,useState} from "react";
import {ArrowRight,BellOff,BookmarkPlus,Check,Copy,Link2,SearchCheck,Sparkles,Trash2,X} from "lucide-react";
import {type Filters,parseFilters,serializeFilters} from "@/lib/filters";
import {interpretHomeQuery} from "@/lib/search-intent";
import {SEARCHES_KEY,makeSavedSearch,normalizeSavedSearches,restoreSavedSearch,type SavedSearch} from "@/lib/saved-searches";
export function DiscoverTools({filters,onFiltersChange,counties}:{filters:Filters;onFiltersChange:(f:Filters)=>void;counties:readonly string[]}){
 const [prompt,setPrompt]=useState("");
 const [feedback,setFeedback]=useState("");
 const [interpreted,setInterpreted]=useState<string[]>([]);
 const [savedSearches,setSavedSearches]=useState<SavedSearch[]>([]);
 const [savedPanel,setSavedPanel]=useState(false);
 const [newLabel,setNewLabel]=useState("");
 const [saveOpen,setSaveOpen]=useState(false);
 useEffect(()=>{
  const synchronize=()=>{
   try{setSavedSearches(normalizeSavedSearches(JSON.parse(localStorage.getItem(SEARCHES_KEY)??"[]")));}
   catch{setSavedSearches([]);}
  };
  const restoreFromUrl=()=>{
   const params=new URLSearchParams(window.location.search);
   onFiltersChange(parseFilters(params,counties));
  };
  synchronize();
  // Initial deep links and browser Back/Forward must restore exactly the same filter set.
  if(window.location.search)restoreFromUrl();
  const onStorage=(event:StorageEvent)=>{
   if(event.key===SEARCHES_KEY||event.key===null)synchronize();
  };
  window.addEventListener("storage",onStorage);
  window.addEventListener("popstate",restoreFromUrl);
  return()=>{
   window.removeEventListener("storage",onStorage);
   window.removeEventListener("popstate",restoreFromUrl);
  };
  // Initial hydration binds to the first catalog; changes to filters must not reset them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const run=()=>{
  if(!prompt.trim()){setFeedback("Describe the location, budget or features you want.");return;}
  const extracted=interpretHomeQuery(prompt,filters);
  onFiltersChange(extracted.filters);
  setInterpreted(extracted.interpreted);
  setFeedback(extracted.interpreted.length?"Applied recognized criteria. Remaining text is searched literally.":"No structured preferences detected; searching the words you entered.");
  document.getElementById("homes")?.scrollIntoView({block:"start",behavior:"smooth"});
 };
 const store=(next:SavedSearch[])=>{
  setSavedSearches(next);
  try{localStorage.setItem(SEARCHES_KEY,JSON.stringify(next));}catch{setFeedback("Browser storage is unavailable; this search is only saved in this tab.");}
 };
 const save=()=>{
  if(savedSearches.length>=12){setFeedback("Maximum 12 local saved searches. Remove one to save another.");return;}
  const id=globalThis.crypto?.randomUUID?.()??"local-"+Date.now().toString(36);
  try{
   const entry=makeSavedSearch(newLabel,filters,id);
   store([entry,...savedSearches]);
   setSaveOpen(false);setNewLabel("");setFeedback("Search saved in this browser. Automatic notifications are not active.");
  }catch{setFeedback("Give the search a short name before saving.");}
 };
 const share=async()=>{
  const search=serializeFilters(filters);
  const url=window.location.origin+window.location.pathname+(search?"?"+search:"")+"#homes";
  try{await navigator.clipboard.writeText(url);setFeedback("Shareable search URL copied.");}
  catch{setFeedback("Clipboard access is unavailable. Copy the browser URL after applying these filters.");window.history.replaceState(null,"",url);}
 };
 return <div className="discover-toolkit" aria-label="Discover search tools">
  <div className="intent-bar">
   <div className="intent-copy"><Sparkles size={20}/><div><strong>Describe your ideal home</strong><small>Natural-language filtering · transparent rules, not AI-generated listings</small></div></div>
   <form className="intent-form" onSubmit={e=>{e.preventDefault();run();}}>
    <label htmlFor="intent-prompt" className="sr-only">Describe a property search</label>
    <input id="intent-prompt" value={prompt} maxLength={180} onChange={e=>setPrompt(e.target.value)} placeholder="e.g. 2 bedrooms in Mombasa under KES 50k with parking"/>
    <button type="submit" aria-label="Find matches"><SearchCheck size={17}/> <span>Find matches</span></button>
   </form>
  </div>
  {interpreted.length>0&&<div className="interpreted-chips" aria-label="Recognized search criteria">{interpreted.map((x,i)=><span key={i}><Check size={13}/>{x}</span>)}</div>}
  <div className="search-tools-row">
   <span className="tools-note"><BellOff size={15}/> Searches are saved locally; email alerts are not yet enabled.</span>
   <div className="tools-buttons">
    <button type="button" onClick={()=>setSaveOpen(!saveOpen)} aria-expanded={saveOpen}><BookmarkPlus size={17}/> Save search</button>
    <button type="button" onClick={()=>setSavedPanel(!savedPanel)} aria-expanded={savedPanel}><BookmarkPlus size={16}/> Saved searches ({savedSearches.length})</button>
    <button type="button" onClick={share}><Link2 size={16}/> Share</button>
   </div>
  </div>
  {saveOpen&&<form className="saved-search-editor" onSubmit={e=>{e.preventDefault();save();}}>
   <label htmlFor="saved-search-name">Name this search</label>
   <input id="saved-search-name" autoFocus required maxLength={70} value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="e.g. Mombasa family apartments"/>
   <button type="submit"><Check size={16}/> Save locally</button>
   <button type="button" aria-label="Cancel saving" onClick={()=>setSaveOpen(false)}><X size={16}/></button>
  </form>}
  {savedPanel&&<div className="saved-search-library" aria-label="Local saved searches">
   <h3>My saved searches <small>Stored on this device only</small></h3>
   {savedSearches.length===0?<p>No saved searches yet. Set up your filters, then save your preferences.</p>:savedSearches.map(entry=>
    <div className="saved-search-entry" key={entry.id}>
     <div><strong>{entry.label}</strong><small>Saved {new Date(entry.savedAt).toLocaleDateString("en-KE")}</small></div>
     <button type="button" onClick={()=>{onFiltersChange(restoreSavedSearch(entry,counties));setFeedback("Saved search loaded.");document.getElementById("homes")?.scrollIntoView({behavior:"smooth"});}}>Apply <ArrowRight size={15}/></button>
     <button type="button" className="remove-saved" title="Delete saved search" aria-label={"Delete "+entry.label} onClick={()=>store(savedSearches.filter(x=>x.id!==entry.id))}><Trash2 size={17}/></button>
    </div>
   )}
  </div>}
  {feedback&&<p className="tool-feedback" role="status"><Copy size={14}/>{feedback}<button type="button" aria-label="Dismiss notification" onClick={()=>setFeedback("")}><X size={14}/></button></p>}
 </div>;
}
