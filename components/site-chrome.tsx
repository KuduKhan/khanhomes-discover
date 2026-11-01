"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {ArrowUpRight,Check,Compass,Menu,Moon,Sun,SunMedium,Waves,MoonStar,X} from "lucide-react";
import {Brand} from "@/components/brand";

const atmospheres=[{id:"aurora",label:"Aurora",Icon:Waves},{id:"daybreak",label:"Daybreak",Icon:SunMedium},{id:"midnight",label:"Midnight",Icon:MoonStar}] as const;
type Atmosphere=(typeof atmospheres)[number]["id"];
type Theme="light"|"dark";
const parentUrl=process.env.NEXT_PUBLIC_KHANHOMES_URL||"https://khanhomes.vercel.app";
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
    <Link href="/#how-it-works">How it works</Link>
    <a href={parentUrl} target="_blank" rel="noopener noreferrer">KhanHomes OS <ArrowUpRight size={14}/></a>
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
   <Link href="/#how-it-works" onClick={()=>setMenuOpen(false)}>How it works <Check size={17}/></Link>
   <a href={parentUrl} rel="noopener noreferrer" target="_blank" onClick={()=>setMenuOpen(false)}>KhanHomes OS <ArrowUpRight size={17}/></a>
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
   <nav aria-label="Discover links" className="footer-links"><strong>Explore</strong><Link href="/#homes">Search homes</Link><Link href="/#how-it-works">The journey</Link><Link href="/#connection">Connected living</Link></nav>
   <nav aria-label="KhanHomes links" className="footer-links"><strong>Connected to</strong><a target="_blank" rel="noopener noreferrer" href={parentUrl}>KhanHomes OS <ArrowUpRight size={14}/></a><Link href="/api/health">System status</Link><a href="https://github.com/KuduKhan/khanhomes-discovery" target="_blank" rel="noopener noreferrer">Project source <ArrowUpRight size={14}/></a></nav>
  </div>
  <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} KhanHomes Discover</span><span>An independent KhanHomes experience · No payment collection or unapproved listings</span></div>
 </footer>;
}
