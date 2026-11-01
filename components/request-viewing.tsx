"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowRight,CalendarClock,CheckCircle2,Info,LockKeyhole,MessageSquare,ShieldCheck} from "lucide-react";
import {type Listing} from "@/lib/catalog";
import {discoverAccountsConfigured,getDiscoverBrowserClient} from "@/lib/discover-browser";
export function RequestViewing({home}:{home:Listing}){
 const enabled=home.source==="khanhomes"&&home.status==="availability-confirmed"&&home.availability==="available"&&
  process.env.NEXT_PUBLIC_DISCOVER_REQUESTS_ENABLED==="true"&&discoverAccountsConfigured();
 const [kind,setKind]=useState<"viewing"|"enquiry">("viewing");
 const [date,setDate]=useState("");
 const [message,setMessage]=useState("");
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [feedback,setFeedback]=useState("");
 const [submitted,setSubmitted]=useState(false);
 if(!enabled)return <div className="viewing-gate"><LockKeyhole size={17}/>
  <span>{home.source==="demo"?"Preview concept: requests cannot be submitted.":"Viewing requests will be enabled only after authorization, availability and manager coordination are verified."}</span>
 </div>;
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();if(busy)return;setBusy(true);setFeedback("");
  try{
   const client=getDiscoverBrowserClient();
   const {data}=await client.auth.getSession();
   if(!data.session)throw new Error("Please sign in to your Discover account before requesting a viewing.");
   const iso=kind==="viewing"?new Date(date).toISOString():undefined;
   const res=await fetch("/api/seeker-requests",{method:"POST",headers:{
    "Content-Type":"application/json",authorization:"Bearer "+data.session.access_token
   },body:JSON.stringify({
    requestId:crypto.randomUUID(),listingId:home.id,kind,
    ...(iso?{preferredAt:iso}:{}),message,consent
   })});
   const dataOut=await res.json() as {error?:string};
   if(!res.ok)throw new Error(dataOut.error??"Request unavailable.");
   setSubmitted(true);
  }catch(err){setFeedback(err instanceof Error?err.message:"Unable to submit request.");}
  finally{setBusy(false);}
 };
 if(submitted)return <div className="viewing-success" role="status"><CheckCircle2 size={25}/>
  <strong>Request submitted for review.</strong><p>This is not a confirmed appointment. An authorized property representative must review and confirm your request separately.</p><Link href="/account">My requests <ArrowRight size={15}/></Link></div>;
 return <form className="viewing-form" onSubmit={submit}>
  <h3><CalendarClock size={18}/> Request a viewing or enquire</h3>
  <div className="viewing-kind" role="group" aria-label="Request type">
   <button type="button" aria-pressed={kind==="viewing"} onClick={()=>setKind("viewing")}><CalendarClock size={15}/> Viewing</button>
   <button type="button" aria-pressed={kind==="enquiry"} onClick={()=>setKind("enquiry")}><MessageSquare size={15}/> Enquiry</button>
  </div>
  {kind==="viewing"&&<label>Preferred date and time <input type="datetime-local" required value={date} onChange={e=>setDate(e.target.value)}/></label>}
  <label>Message to the property representative <textarea required minLength={20} maxLength={500} rows={3} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tell us what you would like to know or request…"/></label>
  <label className="viewing-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/>I agree to share this request with authorized listing coordinators for responding to my enquiry.</label>
  <p className="viewing-fineprint"><Info size={15}/> Requests may be reviewed manually; submitting does not reserve a home or create a lease.</p>
  <button type="submit" disabled={busy||!consent} className="viewing-submit">{busy?"Submitting…":"Send request"} <ArrowRight size={15}/></button>
  {feedback&&<p className="viewing-error" role="alert">{feedback}</p>}
  <div className="viewing-safe"><ShieldCheck size={15}/> No booking fees or deposits are collected.</div>
 </form>;
}
