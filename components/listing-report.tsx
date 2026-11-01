"use client";
import {useState} from "react";
import Link from "next/link";
import {AlertTriangle,ArrowRight,CheckCircle2,Flag,LockKeyhole,ShieldCheck} from "lucide-react";
import {type Listing} from "@/lib/catalog";
import {discoverAccountsConfigured,getDiscoverBrowserClient} from "@/lib/discover-browser";
const reasons=[
 {value:"misleading",label:"Misleading details"},
 {value:"duplicate",label:"Duplicate listing"},
 {value:"privacy",label:"Privacy concern"},
 {value:"suspicious",label:"Suspected fraud"},
 {value:"other",label:"Other concern"}
] as const;
export function ListingReport({listing}:{listing:Listing}){
 const enabled=listing.source==="khanhomes"&&process.env.NEXT_PUBLIC_DISCOVER_REQUESTS_ENABLED==="true"&&discoverAccountsConfigured();
 const [open,setOpen]=useState(false);
 const [reason,setReason]=useState<(typeof reasons)[number]["value"]>("misleading");
 const [details,setDetails]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [done,setDone]=useState(false);
 if(!enabled)return <p className="report-placeholder"><LockKeyhole size={15}/> Listing reporting will become available with verified Discover accounts. Public previews are fictional.</p>;
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();setBusy(true);setError("");
  try{
   const {data}=await getDiscoverBrowserClient().auth.getSession();
   if(!data.session)throw new Error("Sign in with your Discover account to submit a report.");
   const res=await fetch("/api/reports",{method:"POST",headers:{
    "Content-Type":"application/json",authorization:"Bearer "+data.session.access_token
   },body:JSON.stringify({reportId:crypto.randomUUID(),listingId:listing.id,reason,details})});
   const value=await res.json() as {error?:string};
   if(!res.ok)throw new Error(value.error??"Unable to send report.");
   setDone(true);
  }catch(err){setError(err instanceof Error?err.message:"Report unavailable.");}
  finally{setBusy(false);}
 };
 if(done)return <p role="status" className="report-success"><CheckCircle2 size={18}/> Report recorded for private review. It has not yet been assessed.</p>;
 return <div className="listing-report">
  <button type="button" aria-expanded={open} onClick={()=>setOpen(!open)}><Flag size={16}/> Report this listing <ArrowRight size={14}/></button>
  {open&&<form onSubmit={submit}>
   <h3><AlertTriangle size={17}/> What is concerning about this listing?</h3>
   <label>Reason <select value={reason} onChange={e=>setReason(e.target.value as typeof reason)}>{reasons.map(r=><option value={r.value} key={r.value}>{r.label}</option>)}</select></label>
   <label>Details <textarea rows={3} minLength={20} maxLength={600} required value={details} onChange={e=>setDetails(e.target.value)} placeholder="Provide specific information without sharing passwords, IDs or other private information."/></label>
   <p><ShieldCheck size={15}/> Reports are private, rate-limited, and require a confirmed account. <Link href="/account">My account</Link></p>
   <button type="submit" disabled={busy}>{busy?"Sending…":"Submit report"}</button>
   {error&&<p className="report-error" role="alert">{error}</p>}
  </form>}
 </div>;
}
