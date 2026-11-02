"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {ArrowUpRight,Check,Compass,Menu,Moon,Sun,SunMedium,Waves,MoonStar,X,UserRound,Wallet} from "lucide-react";
import {Brand} from "@/components/brand";

const atmospheres=[{id:"aurora",label:"Aurora",Icon:Waves},{id:"daybreak",label:"Daybreak",Icon:SunMedium},{id:"midnight",label:"Midnight",Icon:MoonStar}] as const;
type Atmosphere=(typeof atmospheres)[number]["id"];
type Theme="light"|"dark";
const parentUrl=process.env.NEXT_PUBLIC_KHANHOMES_URL||"https://khanhomes.vercel.app";
const buildUrl=process.env.NEXT_PUBLIC_KHANHOMES_BUILD_URL?.startsWith("https://")?process.env.NEXT_PUBLIC_KHANHOMES_BUILD_URL.replace(/\/$/,""):parentUrl+"/build";
export function SiteHeader(){
 const [theme,setTheme]=useState<Theme>("light");
 const [atmosphere,setAtmosphere]=useState<Atmosphere>("aurora");
 const [menuOpen,setMenuOpen]=useState(false);
 const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  try{
   const raw=JSON.parse(localStorage.getItem("kh-discovery-style")||"{}") as {theme?:Theme;atmosphere?:Atmosphere};
   const t=raw.theme==="dark"?"dark":"light";
   const a=atmospheres.some(x=>x.id===raw.atmosphere)?raw.atmosphere!:"aurora";
   setTheme(t);setAtmosphere(a);document.documentElement.dataset.theme=t;document.documentElement.dataset.atmosphere=a;
  }catch{ /* private browsing still allows in-session preferences */ }
 },[]);
 useEffect(()=>{
  if(!menuOpen)return;
  const close=(e:KeyboardEvent)=>{if(e.key==="Escape"){setMenuOpen(false);trigger.current?.focus();}};
  window.addEventListener("keydown",close);
  return()=>window.removeEventListener("keydown",close);
 },[menuOpen]);
 const update=(nextTheme:Theme,nextAtmosphere:Atmosphere)=>{
  setTheme(nextTheme);setAtmosphere(nextAtmosphere);
  document.documentElement.dataset.theme=nextTheme;
  document.documentElement.dataset.atmosphere=nextAtmosphere;
  try{localStorage.setItem("kh-discovery-style",JSON.stringify({theme:nextTheme,atmosphere:nextAtmosphere}));}catch{}
 };
 return <header className="site-header">
  <div className="wrap header-inner">
   <Brand/>
   <nav className="desktop-nav" aria-label="Primary">
    <Link href="/#homes">Explore homes</Link>
    <Link href="/match">AURA Match</Link>
    <Link href="/watch">Search watch</Link>
    <Link href="/visits">Visit plans</Link>
    <Link href="/planner">Notebook</Link>
    <Link href="/studio">Listing Atelier</Link>
    <Link href="/finance">Finance Desk</Link>
    <Link href="/account"><UserRound size={15}/> My account</Link>
    <a href={parentUrl+"/ecosystem"} target="_blank" rel="noopener noreferrer">KhanHomes ecosystem <ArrowUpRight size={14}/></a>
   </nav>
   <div className="header-actions">
    <div className="atmosphere-picker" role="group" aria-label="Atmosphere Studio">
      {atmospheres.map(({id,label,Icon})=><button key={id} type="button" onClick={()=>update(theme,id)} aria-label={"Apply "+label+" atmosphere"} aria-pressed={atmosphere===id} title={label}>
       <Icon size={16}/><span className="sr-only">{label}</span>
      </button>)}
    </div>
    <button className="header-icon" type="button" onClick={()=>update(theme==="light"?"dark":"light",atmosphere)} title="Toggle light or dark mode" aria-label={theme==="dark"?"Switch to light mode":"Switch to dark mode"}>
     {theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}
    </button>
    <Link className="header-cta" href="/#homes"><Compass size={16}/> Discover <span>homes</span></Link>
    <button ref={trigger} className="mobile-menu-trigger" aria-label={menuOpen?"Close navigation":"Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-primary" onClick={()=>setMenuOpen(!menuOpen)} type="button">
     {menuOpen?<X size={20}/>:<Menu size={20}/>}
    </button>
   </div>
  </div>
  {menuOpen&&<nav className="mobile-menu" id="mobile-primary" aria-label="Mobile navigation">
   <Link href="/#homes" onClick={()=>setMenuOpen(false)}>Explore homes <Compass size={17}/></Link>
   <Link href="/match" onClick={()=>setMenuOpen(false)}>AURA Match <Compass size={17}/></Link>
   <Link href="/watch" onClick={()=>setMenuOpen(false)}>Search watch <Check size={17}/></Link>
   <Link href="/visits" onClick={()=>setMenuOpen(false)}>Tentative visits <Check size={17}/></Link>
   <Link href="/planner" onClick={()=>setMenuOpen(false)}>My planner <Check size={17}/></Link>
   <Link href="/studio" onClick={()=>setMenuOpen(false)}>Listing Atelier <Check size={17}/></Link>
   <Link href="/finance" onClick={()=>setMenuOpen(false)}>Finance Desk <Wallet size={17}/></Link>
   <Link href="/account" onClick={()=>setMenuOpen(false)}>My account <UserRound size={17}/></Link>
   <a href={parentUrl+"/ecosystem"} rel="noopener noreferrer" target="_blank" onClick={()=>setMenuOpen(false)}>KhanHomes ecosystem <ArrowUpRight size={17}/></a>
  </nav>}
 </header>;
}
export function SiteFooter({mode}:{mode:"preview"|"live"}){
 return <footer className="site-footer">
  <div className="wrap footer-grid">
   <div className="footer-identity">
    <Brand/>
    <p>Find your place. Feel at home. A refined house-hunting experience connected to KhanHomes.</p>
    <span className="footer-trust">{mode==="preview"?"Preview catalog · Fictional homes and indicative prices":"Published listing catalog · Check details before decisions"}</span>
   </div>
   <nav aria-label="Discover links" className="footer-links"><strong>Explore</strong><Link href="/#homes">Search homes</Link><Link href="/match">AURA Match</Link><Link href="/watch">Search watch</Link><Link href="/visits">Visit plans</Link><Link href="/planner">Home notebook</Link><Link href="/studio">Listing Atelier</Link><Link href="/finance">Finance Desk</Link><Link href="/#connection">Connected living</Link><Link href="/account">My Discover account</Link></nav>
   <nav aria-label="KhanHomes links" className="footer-links"><strong>Connected to</strong><a target="_blank" rel="noopener noreferrer" href={parentUrl+"/ecosystem"}>KhanHomes ecosystem <ArrowUpRight size={14}/></a><a target="_blank" rel="noopener noreferrer" href={buildUrl}>KhanHomes Build <ArrowUpRight size={14}/></a><Link href="/api/health">System status</Link><a href="https://github.com/KuduKhan/khanhomes-discover" target="_blank" rel="noopener noreferrer">Project source <ArrowUpRight size={14}/></a></nav>
  </div>
  <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} KhanHomes Discover</span><span>Part of the KhanHomes ecosystem · No payment collection or unapproved listings</span></div>
 </footer>;
}
