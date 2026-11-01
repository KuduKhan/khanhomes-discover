"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowLeft,ArrowRight,CheckCircle2,Eye,EyeOff,Heart,LockKeyhole,Mail,ShieldCheck,UserRound,LogOut,CalendarCheck2,RefreshCw} from "lucide-react";
import {discoverAccountsConfigured,getDiscoverBrowserClient} from "@/lib/discover-browser";
type OwnRequest={id:string;kind:"viewing"|"enquiry";preferred_at:string|null;status:string;created_at:string;listing_id:string};
export function SeekerAccount(){
 const enabled=discoverAccountsConfigured();
 const [mode,setMode]=useState<"signin"|"signup">("signin");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [showPassword,setShowPassword]=useState(false);
 const [signedEmail,setSignedEmail]=useState<string|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [requests,setRequests]=useState<OwnRequest[]>([]);
 const [loadingRequests,setLoadingRequests]=useState(false);
 useEffect(()=>{
  if(!enabled)return;
  const client=getDiscoverBrowserClient();
  void client.auth.getUser().then(({data:{user}})=>setSignedEmail(user?.email_confirmed_at?user.email??null:null));
  const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{
   setSignedEmail(session?.user.email_confirmed_at?session.user.email??null:null);
  });
  return()=>subscription.unsubscribe();
 },[enabled]);
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();if(!enabled||busy)return;
  setBusy(true);setError("");setMessage("");
  const client=getDiscoverBrowserClient();
  try{
   if(mode==="signup"){
    const {error:err}=await client.auth.signUp({
     email:email.trim(),password,
     options:{emailRedirectTo:window.location.origin+"/account"}
    });
    if(err)throw err;
    setMessage("If a new account can be created, check your email for a confirmation link. Account access requires verified email.");
   }else{
    const {error:err,data}=await client.auth.signInWithPassword({email:email.trim(),password});
    if(err)throw err;
    if(!data.user?.email_confirmed_at){
     setMessage("Please confirm your email address before requesting viewings.");
    }else setSignedEmail(data.user.email??null);
   }
  }catch(err){
   setError(err instanceof Error?err.message:"Authentication unavailable.");
  }finally{setBusy(false);}
 };
 const signOut=async()=>{
  setBusy(true);
  try{await getDiscoverBrowserClient().auth.signOut();setSignedEmail(null);setRequests([]);}
  finally{setBusy(false);}
 };
 const loadRequests=async()=>{
  if(!enabled||!signedEmail)return;
  setLoadingRequests(true);setError("");
  try{
   const client=getDiscoverBrowserClient();
   const {data}=await client.auth.getSession();
   if(!data.session)throw new Error("Please sign in again.");
   const res=await fetch("/api/seeker-requests",{headers:{authorization:"Bearer "+data.session.access_token},cache:"no-store"});
   if(!res.ok)throw new Error("Private request history is not enabled or unavailable.");
   const json=await res.json() as {requests?:OwnRequest[]};
   setRequests(json.requests??[]);
  }catch(err){setError(err instanceof Error?err.message:"Unable to load requests.");}
  finally{setLoadingRequests(false);}
 };
 if(!enabled)return <div className="account-unavailable"><LockKeyhole size={33}/>
  <h2>Private accounts are being prepared.</h2>
  <p>Discovery preview is open, but account creation, enquiries, applications and viewing requests remain disabled until the independent Discover database, verified email delivery, authorization tests and manager workflows are accepted.</p>
  <Link href="/#homes">Explore the preview homes <ArrowRight size={16}/></Link>
 </div>;
 return <section className="account-panel" aria-label="Discover seeker account">
  {signedEmail?<div className="account-signed">
   <span className="account-symbol"><UserRound size={27}/></span>
   <span className="section-kicker">YOUR PRIVATE SPACE</span><h2>Welcome to Discover.</h2>
   <p><Mail size={16}/> {signedEmail}</p>
   <div className="account-privacy-note"><ShieldCheck size={19}/><span>Your account belongs only to KhanHomes Discover. It does not grant access to any private KhanHomes property-management records.</span></div>
   <div className="account-actions">
    <button type="button" onClick={loadRequests} disabled={loadingRequests}><RefreshCw size={16}/>{loadingRequests?"Checking…":"My enquiries & viewing requests"}</button>
    <Link href="/#homes"><Heart size={16}/> Explore homes</Link>
    <button type="button" onClick={signOut} disabled={busy}><LogOut size={16}/> Sign out</button>
   </div>
   <div className="account-request-list" aria-live="polite">
    {requests.map(r=><div key={r.id}><span><CalendarCheck2 size={17}/>{r.kind==="viewing"?"Viewing request":"Enquiry"}</span><strong>{r.status}</strong><small>{new Date(r.created_at).toLocaleDateString("en-KE")}</small></div>)}
    {requests.length===0&&<p>Your request history is empty or has not been loaded. Viewing requests are not confirmed appointments.</p>}
   </div>
   {error&&<p className="account-error" role="alert">{error}</p>}
  </div>:<>
   <span className="account-symbol"><UserRound size={27}/></span>
   <span className="section-kicker">SEEKER ACCOUNT</span>
   <h2>{mode==="signin"?"Welcome back.":"Find a home, feel at home."}</h2>
   <p className="account-intro">Sign in to your independent Discover account. Public previews are always available without a login.</p>
   <div className="account-switcher" role="group" aria-label="Account access mode">
    <button type="button" aria-pressed={mode==="signin"} onClick={()=>{setMode("signin");setError("");}}>Sign in</button>
    <button type="button" aria-pressed={mode==="signup"} onClick={()=>{setMode("signup");setError("");}}>Create account</button>
   </div>
   <form className="account-form" onSubmit={submit}>
    <label><span>Email address</span><div><Mail size={18}/><input type="email" required maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div></label>
    <label><span>Password</span><div><LockKeyhole size={18}/><input type={showPassword?"text":"password"} minLength={8} maxLength={128} required autoComplete={mode==="signin"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 characters"/>
     <button type="button" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
    <button type="submit" className="account-submit" disabled={busy}>{busy?"Please wait…":mode==="signin"?"Sign in securely":"Request account confirmation"} <ArrowRight size={17}/></button>
   </form>
   {message&&<p role="status" className="account-message"><CheckCircle2 size={17}/>{message}</p>}
   {error&&<p role="alert" className="account-error">{error}</p>}
   <div className="account-privacy-note"><ShieldCheck size={20}/><span>Email verification is required. Passwords are handled by the independent Supabase Auth provider, not stored in KhanHomes operational records.</span></div>
  </>}
 </section>;
}
