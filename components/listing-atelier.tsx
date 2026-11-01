"use client";
import {useEffect,useMemo,useState} from "react";
import {ArrowUpRight,Check,CheckCircle2,ClipboardCheck,CopyPlus,Download,
 FileCheck2,FileText,Home,Info,LockKeyhole,Plus,Save,ShieldCheck,SlidersHorizontal,Trash2} from "lucide-react";
import {formatKes} from "@/lib/catalog";
import {blankListingDraft,DRAFT_AMENITIES,DRAFT_KINDS,evaluateDraft,exportLocalDraft,LISTING_DRAFT_KEY,
 normalizeDrafts,type ListingDraft} from "@/lib/listing-draft";
const PARENT="https://khanhomes.vercel.app/workspace";
const COUNTIES=["Nairobi","Mombasa","Kisumu","Kiambu","Nakuru","Machakos","Kajiado","Other"];
export function ListingAtelier(){
 const [ready,setReady]=useState(false);
 const [drafts,setDrafts]=useState<ListingDraft[]>([]);
 const [currentId,setCurrentId]=useState("");
 const [feedback,setFeedback]=useState("");
 const [error,setError]=useState("");
 useEffect(()=>{
  try{
   const saved=normalizeDrafts(JSON.parse(localStorage.getItem(LISTING_DRAFT_KEY)??"[]"));
   setDrafts(saved);setCurrentId(saved[0]?.id??"");
  }catch{}
  setReady(true);
 },[]);
 const draft=useMemo(()=>drafts.find(x=>x.id===currentId),[drafts,currentId]);
 const progress=draft?evaluateDraft(draft):null;
 const persist=(next:ListingDraft[],message="Draft stored in this browser.")=>{
  setDrafts(next);setError("");
  try{localStorage.setItem(LISTING_DRAFT_KEY,JSON.stringify(next));setFeedback(message);}
  catch{setFeedback("Storage unavailable. Draft may be lost when this tab closes.");}
 };
 const create=()=>{
  if(drafts.length>=20){setError("You can keep at most 20 local drafts. Export or remove an older draft first.");return;}
  const id=crypto.randomUUID();
  const next=blankListingDraft(id);persist([next,...drafts],"New private listing draft created.");
  setCurrentId(id);
 };
 const patch=(change:Partial<ListingDraft>)=>{
  if(!draft)return;
  const updated={...draft,...change,updatedAt:new Date().toISOString()};
  persist(drafts.map(x=>x.id===draft.id?updated:x),"Unsynced local draft · changes stored on this device.");
 };
 const duplicate=()=>{
  if(!draft||drafts.length>=20)return;
  const id=crypto.randomUUID();
  const copy={...draft,id,title:draft.title?draft.title+" (copy)":"Untitled copy",updatedAt:new Date().toISOString(),
   representationChecked:false,mediaRightsChecked:false,availabilityChecked:false};
  persist([copy,...drafts],"Draft duplicated. Manual review confirmations reset.");
  setCurrentId(id);
 };
 const remove=()=>{
  if(!draft)return;
  const rest=drafts.filter(x=>x.id!==draft.id);persist(rest,"Local draft removed.");setCurrentId(rest[0]?.id??"");
 };
 const download=()=>{
  if(!draft)return;
  try{
   const content=exportLocalDraft(draft);
   const blob=new Blob([content],{type:"application/json;charset=utf-8"});
   const url=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=url;a.download="khanhomes-discover-private-draft-"+draft.id.slice(0,8)+".json";a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
   setFeedback("Draft exported. Export does not publish a property or grant manager approval.");
   setError("");
  }catch(err){setError(err instanceof Error?err.message:"Draft export unavailable.");}
 };
 const enabled=Boolean(draft);
 return <section className="atelier" aria-label="Private listing preparation workspace">
  <div className="atelier-heading">
   <div><span className="section-kicker"><SlidersHorizontal size={16}/> KHANHOMES DISCOVER · PRIVATE LISTING PREP</span>
    <h2>Present a home with <em>intention.</em></h2>
    <p>Prepare an accurate, transparent property listing before sending anything for verified KhanHomes management review. Nothing you write here is a public listing.</p></div>
   <div className="atelier-studio-label"><LockKeyhole size={18}/> Draft-only workspace</div>
  </div>
  <div className="atelier-disclaimer"><ShieldCheck size={19}/><p><strong>No authorization is granted here.</strong> Drafts are browser-local, not synced with KhanHomes. An authorized KhanHomes manager must independently verify property representation, photo rights, availability, and listing terms before actual publication.</p></div>
  <div className="atelier-lifecycle" aria-label="Publishing lifecycle; only local draft stage enabled">
   {["Prepare draft","Manager review","Verified approval","Public publication"].map((step,i)=><div key={step} className={i===0?"active":""}>
    <span>{i===0?<FileText size={18}/>:<LockKeyhole size={17}/>}</span><strong>{step}</strong><small>{i===0?"Local only":"Not enabled"}</small>
   </div>)}
  </div>
  <div className="atelier-layout">
   <aside className="atelier-sidebar">
    <div className="atelier-sidebar-head"><div><span className="section-kicker">DRAFT LIBRARY</span><h3>Your listing ideas</h3></div><button type="button" onClick={create} aria-label="Create new listing draft" title="New private draft"><Plus size={18}/></button></div>
    {!ready?<p>Loading device drafts…</p>:drafts.length===0?<div className="atelier-empty-list"><Home size={25}/><p>No drafts yet. Start with one property concept and review your information privately.</p></div>:
     drafts.map(item=><button type="button" key={item.id} className={"atelier-draft-tab"+(currentId===item.id?" selected":"")}
      aria-pressed={currentId===item.id} onClick={()=>setCurrentId(item.id)}><span><strong>{item.title||"Untitled draft"}</strong><small>{item.county} · {item.type==="rent"?"Rental":"For sale"}</small></span><span>{evaluateDraft(item).score}%</span></button>)}
    <button type="button" className="atelier-add" disabled={drafts.length>=20} onClick={create}><Plus size={17}/> New draft</button>
    <div className="atelier-side-help"><Info size={17}/><p>Do not enter personal identifiers, tenant names, private access codes, or exact addresses of occupied homes. Store source photographs only in approved private KhanHomes workflows.</p></div>
   </aside>
   {enabled&&draft?<div className="atelier-editor-area">
    <form className="atelier-editor" onSubmit={e=>e.preventDefault()} aria-label="Edit local listing draft">
     <div className="atelier-editor-title"><div><span className="section-kicker">EDITING A PRIVATE DRAFT</span><h3>{draft.title||"New listing idea"}</h3></div><div className="atelier-editor-actions">
      <button type="button" onClick={duplicate} title="Duplicate draft"><CopyPlus size={16}/> Duplicate</button>
      <button type="button" onClick={remove} className="danger" title="Delete draft"><Trash2 size={16}/> Delete</button>
     </div></div>
     <section><div className="atelier-section-label"><span>01</span><div><h4>Property essentials</h4><p>General, shareable facts only.</p></div></div>
      <div className="atelier-fields">
       <label className="atelier-wide">Listing headline<input value={draft.title} maxLength={120} onChange={e=>patch({title:e.target.value})} placeholder="e.g. Sunlit 2-bedroom apartment"/></label>
       <label>County<select value={draft.county} onChange={e=>patch({county:e.target.value})}>{COUNTIES.map(c=><option key={c}>{c}</option>)}</select></label>
       <label>Neighborhood / area<input value={draft.area} maxLength={100} onChange={e=>patch({area:e.target.value})} placeholder="e.g. Nyali (no exact address)"/></label>
       <label>Listing type<select value={draft.type} onChange={e=>patch({type:e.target.value==="sale"?"sale":"rent"})}><option value="rent">For rent</option><option value="sale">For sale</option></select></label>
       <label>Home type<select value={draft.kind} onChange={e=>patch({kind:e.target.value as ListingDraft["kind"]})}>{DRAFT_KINDS.map(k=><option key={k}>{k}</option>)}</select></label>
       <label>Price (KES)<input type="number" min="0" max="1000000000000" step="1000" value={draft.priceKes} onChange={e=>patch({priceKes:Math.min(1000000000000,Math.max(0,Math.floor(Number(e.target.value)||0)))})}/></label>
       <label>Bedrooms<input type="number" min="0" max="30" value={draft.beds} onChange={e=>patch({beds:Math.min(30,Math.max(0,Math.floor(Number(e.target.value)||0)))})}/></label>
       <label>Bathrooms<input type="number" min="1" max="30" value={draft.baths} onChange={e=>patch({baths:Math.min(30,Math.max(1,Math.floor(Number(e.target.value)||1)))})}/></label>
       <label>Floor area (m²)<input type="number" min="0" max="100000" value={draft.sizeSqm} onChange={e=>patch({sizeSqm:Math.min(100000,Math.max(0,Math.floor(Number(e.target.value)||0)))})}/></label>
      </div>
     </section>
     <section><div className="atelier-section-label"><span>02</span><div><h4>Features & property story</h4><p>Include only facts you can independently support.</p></div></div>
      <div className="atelier-feature-chips">{DRAFT_AMENITIES.map(a=><label key={a} className={draft.amenities.includes(a)?"selected":""}>
       <input type="checkbox" checked={draft.amenities.includes(a)} onChange={e=>patch({amenities:e.target.checked?[...draft.amenities,a]:draft.amenities.filter(x=>x!==a)})}/>{draft.amenities.includes(a)&&<Check size={14}/>} {a}
      </label>)}</div>
      <div className="atelier-toggles"><label><input type="checkbox" checked={draft.furnished} onChange={e=>patch({furnished:e.target.checked})}/> Furnished</label>
       <label><input type="checkbox" checked={draft.parking} onChange={e=>patch({parking:e.target.checked})}/> Parking available</label></div>
      <label className="atelier-story">Description <small>80+ characters recommended</small><textarea rows={5} maxLength={1600} value={draft.description}
       placeholder="Describe the unit honestly. Never include the names, contacts or private information of residents."
       onChange={e=>patch({description:e.target.value})}/></label>
      <label className="atelier-story">Price and fee disclosures <small>Distinguish confirmed terms from assumptions</small><textarea rows={3} maxLength={500} value={draft.charges}
       placeholder="e.g. Rent excludes utilities; deposit and service charges pending verified review."
       onChange={e=>patch({charges:e.target.value})}/></label>
     </section>
     <section><div className="atelier-section-label"><span>03</span><div><h4>Preparation review</h4><p>These are self-attested preparation tasks, not verified status.</p></div></div>
      <div className="atelier-checks">
       <label><input type="checkbox" checked={draft.representationChecked} onChange={e=>patch({representationChecked:e.target.checked})}/> I have identified the responsible authorized representative for later review.</label>
       <label><input type="checkbox" checked={draft.mediaRightsChecked} onChange={e=>patch({mediaRightsChecked:e.target.checked})}/> I have considered photo rights, consent, and removal of private resident details.</label>
       <label><input type="checkbox" checked={draft.availabilityChecked} onChange={e=>patch({availabilityChecked:e.target.checked})}/> I have identified how actual availability will be reconfirmed by a manager.</label>
      </div>
     </section>
     <div className="atelier-export-actions"><button type="button" onClick={download}><Download size={18}/> Export draft JSON</button><span><Save size={16}/> Saved in this browser only</span></div>
    </form>
    <aside className="atelier-inspector" aria-label="Listing quality checklist and concept preview">
     <div className="atelier-quality">
      <div className="atelier-quality-heading"><span><ClipboardCheck size={19}/> Draft completeness</span><strong>{progress?.score??0}%</strong></div>
      <div className="atelier-quality-meter" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress?.score??0} aria-label="Draft completeness"><span style={{width:(progress?.score??0)+"%"}}/></div>
      <p>Completeness is not approval, quality certification, proof of representation or publication readiness.</p>
      <ul>{progress?.checks.map(item=><li key={item.key} className={item.done?"done":""}>
       <span>{item.done?<CheckCircle2 size={17}/>:<span className="atelier-unchecked"/>}</span>
       <div><strong>{item.label}</strong><small>{item.explanation}</small></div></li>)}</ul>
     </div>
     <div className="atelier-preview">
      <div className="atelier-preview-scene"><Home size={58} strokeWidth={1}/><span>DRAFT ONLY · NOT PUBLIC</span></div>
      <div className="atelier-preview-body"><strong>{draft.priceKes>0?formatKes(draft.priceKes):"Price not entered"}</strong><small>{draft.type==="rent"?"/ month · provisional":"asking price · provisional"}</small>
       <h4>{draft.title||"Your future listing headline"}</h4><p>{draft.area?draft.area+", ":""}{draft.county}</p>
       <span>{draft.beds===0?"Studio":draft.beds+" bedrooms"} · {draft.baths} baths · {draft.sizeSqm||"?"} m²</span></div>
     </div>
     <div className="atelier-no-publish"><LockKeyhole size={17}/><p><strong>Public publishing is locked.</strong> There is no public listing, identity check, signed publisher event, or agent messaging from this studio.</p>
      <a href={PARENT} target="_blank" rel="noopener noreferrer">Go to authorized KhanHomes workspace <ArrowUpRight size={15}/></a></div>
    </aside>
   </div>:<div className="atelier-start"><FileCheck2 size={37}/><h3>Prepare a listing with clarity.</h3><p>Start a local draft, organize the facts, and review what remains before any manager approval. Your draft is not publicly visible and will never be submitted automatically.</p><button type="button" onClick={create}><Plus size={17}/> Create first draft</button></div>}
  </div>
  {feedback&&<p role="status" className="atelier-feedback"><Save size={16}/>{feedback}</p>}
  {error&&<p role="alert" className="atelier-error"><Info size={16}/>{error}</p>}
 </section>;
}
