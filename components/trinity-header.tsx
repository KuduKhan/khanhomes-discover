"use client";
/**
 * Trinity Header v2.0 — identical component in KhanHomes, Discover and Build.
 * Public navigation only. Authenticated workspace permissions stay app-local.
 */
import Image from "next/image";
import Link from "next/link";
import {useEffect,useId,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {ArrowUpRight,Building2,Check,ChevronDown,Compass,HardHat,Menu,Moon,Palette,Sun,X} from "lucide-react";
import {productOrigins} from "@/lib/product-origins";

type Product="home"|"discover"|"build";
type Atmosphere="aurora"|"daybreak"|"midnight";
type Theme="light"|"dark"|"system";
type Item={label:string;href:string};
const products=[
 {id:"home",label:"KhanHomes",detail:"Property management",Icon:Building2},
 {id:"discover",label:"Discover",detail:"Find your next home",Icon:Compass},
 {id:"build",label:"Build",detail:"Construction intelligence",Icon:HardHat}
] as const;
const atmosphereChoices=[
 {id:"aurora",label:"Aurora",color:"#147b69"},
 {id:"daybreak",label:"Daybreak",color:"#386d52"},
 {id:"midnight",label:"Midnight",color:"#246481"}
] as const;
const menus:Record<Product,{name:string;navigation:string;primary:Item[];more:Item[];cta:Item}>={
 home:{name:"Management",navigation:"Main navigation",primary:[
  {label:"Spaces",href:"/#spaces"},{label:"Experience",href:"/#experience"},{label:"Features",href:"/#features"}
 ],more:[{label:"Ecosystem",href:"/ecosystem"},{label:"Roadmap",href:"/#roadmap"},{label:"Explore demo",href:"/dashboard"}],
 cta:{label:"Open workspace",href:"/workspace"}},
 discover:{name:"Discover",navigation:"Primary",primary:[
  {label:"Explore homes",href:"/#homes"},{label:"AURA Match",href:"/match"},{label:"Visit plans",href:"/visits"},{label:"Notebook",href:"/planner"}
 ],more:[{label:"Search watch",href:"/watch"},{label:"Listing Atelier",href:"/studio"},{label:"Finance Desk",href:"/finance"}],
 cta:{label:"My account",href:"/account"}},
 build:{name:"Build",navigation:"Build navigation",primary:[
  {label:"Capabilities",href:"/#capabilities"},{label:"Our approach",href:"/#trust"}
 ],more:[],cta:{label:"Secure workspace",href:"/workspace"}}
};
function getSaved(product:Product){
 try{
  const key=product==="discover"?"kh-discovery-style":"kh-family-appearance-v1";
  const value:unknown=JSON.parse(localStorage.getItem(key)||"{}");
  const data=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
  return {
   atmosphere:(atmosphereChoices.some(x=>x.id===data.atmosphere)?data.atmosphere:"aurora") as Atmosphere,
   theme:(data.theme==="dark"||data.theme==="light"||data.theme==="system"?data.theme:"light") as Theme
  };
 }catch{return {atmosphere:"aurora" as Atmosphere,theme:"light" as Theme};}
}
function apply(product:Product,atmosphere:Atmosphere,theme:Theme){
 const root=document.documentElement;
 const resolved=theme==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):theme;
 if(product==="discover"){root.dataset.atmosphere=atmosphere;root.dataset.theme=resolved;}
 else{root.dataset.familyAtmosphere=atmosphere;root.dataset.familyTheme=resolved;}
}
function LocalLink({item,onClick,current}:{item:Item;onClick?:()=>void;current?:boolean}){
 return <Link href={item.href} onClick={onClick} aria-current={current?"page":undefined}>{item.label}</Link>;
}
export function TrinityHeader({product}:{product:Product}){
 const pathname=usePathname();
 const menu=menus[product];
 const [productOpen,setProductOpen]=useState(false);
 const [moreOpen,setMoreOpen]=useState(false);
 const [appearanceOpen,setAppearanceOpen]=useState(false);
 const [mobileOpen,setMobileOpen]=useState(false);
 const [atmosphere,setAtmosphere]=useState<Atmosphere>("aurora");
 const [theme,setTheme]=useState<Theme>("light");
 const rootRef=useRef<HTMLElement>(null);
 const productButton=useRef<HTMLButtonElement>(null);
 const appearanceButton=useRef<HTMLButtonElement>(null);
 const menuButton=useRef<HTMLButtonElement>(null);
 const productId=useId(),appearanceId=useId(),mobileId=useId(),moreId=useId();
 const close=()=>{setProductOpen(false);setMoreOpen(false);setAppearanceOpen(false);setMobileOpen(false);};
 useEffect(()=>{
  const stored=getSaved(product);
  setAtmosphere(stored.atmosphere);setTheme(stored.theme);
  apply(product,stored.atmosphere,stored.theme);
  const media=window.matchMedia("(prefers-color-scheme: dark)");
  const sync=()=>{const current=getSaved(product);if(current.theme==="system")apply(product,current.atmosphere,"system");};
  media.addEventListener("change",sync);
  return()=>media.removeEventListener("change",sync);
 },[product]);
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{
   if(!rootRef.current?.contains(event.target as Node))close();
  };
  const escape=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){
    if(appearanceOpen)appearanceButton.current?.focus();
    else if(productOpen)productButton.current?.focus();
    else if(mobileOpen)menuButton.current?.focus();
    close();
   }
  };
  const mq=window.matchMedia("(min-width: 1121px)");
  const dismiss=()=>{if(mq.matches)setMobileOpen(false);};
  document.addEventListener("pointerdown",outside);
  document.addEventListener("keydown",escape);
  mq.addEventListener("change",dismiss);
  return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);mq.removeEventListener("change",dismiss);};
 },[appearanceOpen,productOpen,mobileOpen]);
 const update=(a:Atmosphere,t:Theme)=>{
  setAtmosphere(a);setTheme(t);apply(product,a,t);
  try{localStorage.setItem(product==="discover"?"kh-discovery-style":"kh-family-appearance-v1",JSON.stringify({atmosphere:a,theme:t}));}catch{}
 };
 const isCurrent=(href:string)=>!href.includes("#")&&pathname===href;
 const active=products.find(p=>p.id===product)!;
 return <header ref={rootRef} className="trinity-header site-header khx-top" data-trinity-product={product} data-trinity-version="2.0">
  <div className="trinity-inner header-inner">
   <Link href="/" className="trinity-brand brand khx-brand" aria-label={"KhanHomes "+menu.name+" home"}>
    <span className="trinity-logo-wrap brand-mark"><Image className="kh-emblem" src="/brand/khanhomes-mark.svg" alt="" width={34} height={34} priority/></span>
    <span className="trinity-brand-copy"><span className="trinity-wordmark">Khan<span>Homes</span></span><span className="trinity-brand-tagline">PROPERTY INTELLIGENCE</span></span>
   </Link>
   <nav className="trinity-product-tabs" aria-label="KhanHomes products">
    {products.map(({id,label})=><a key={id} href={productOrigins[id]} aria-current={id===product?"page":undefined}>{label}</a>)}
   </nav>
   <nav className="trinity-product-nav" aria-label="KhanHomes product switcher">
    <button ref={productButton} type="button" className="trinity-product-button" aria-label="Switch KhanHomes product"
      aria-expanded={productOpen} aria-controls={productId}
      onClick={()=>{setProductOpen(!productOpen);setAppearanceOpen(false);setMoreOpen(false);}}>
      <active.Icon size={17} aria-hidden="true"/><span>{menu.name}</span><ChevronDown size={15} aria-hidden="true"/>
    </button>
    {productOpen&&<div id={productId} className="trinity-popover trinity-product-popover">
     <strong className="trinity-popover-kicker">KHANHOMES ECOSYSTEM</strong>
     {products.map(({id,label,detail,Icon})=><a key={id} className="trinity-product-option" href={productOrigins[id]} aria-current={id===product?"page":undefined} aria-label={id==="home"?"KhanHomes management":id==="discover"?"KhanHomes Discover":"KhanHomes Build"} onClick={close}>
       <Icon size={19}/><span><strong>{label}</strong><small>{detail}</small></span>{id===product?<Check size={17}/>:<ArrowUpRight size={15}/>}
     </a>)}
     <span className="trinity-popover-note">Independent apps · No session transfer</span>
    </div>}
   </nav>
   <nav className="trinity-primary desktop-nav site-links" aria-label={menu.navigation}>
    {menu.primary.map(item=><LocalLink key={item.href} item={item} current={isCurrent(item.href)}/>)}
    {menu.more.length>0&&<div className="trinity-more">
     <button type="button" aria-expanded={moreOpen} aria-controls={moreId}
      onClick={()=>{setMoreOpen(!moreOpen);setProductOpen(false);setAppearanceOpen(false);}}>
      More <ChevronDown size={15}/>
     </button>
     {moreOpen&&<div className="trinity-popover trinity-more-popover" id={moreId}>
      {menu.more.map(item=><LocalLink key={item.href} item={item} current={isCurrent(item.href)} onClick={()=>setMoreOpen(false)}/>)}
     </div>}
    </div>}
   </nav>
   <div className="trinity-actions header-actions">
    <div className="trinity-appearance">
     <button ref={appearanceButton} type="button" className="trinity-icon-button" aria-label="Open Appearance Studio"
      aria-expanded={appearanceOpen} aria-controls={appearanceId} title="Appearance Studio"
      onClick={()=>{setAppearanceOpen(!appearanceOpen);setProductOpen(false);setMoreOpen(false);}}>
      <Palette size={19}/><span className="trinity-sr-only">Appearance</span>
     </button>
     {appearanceOpen&&<div id={appearanceId} className="trinity-popover trinity-appearance-popover">
      <strong className="trinity-popover-title">Appearance Studio</strong>
      <span className="trinity-popover-subtitle">Personalize colors without changing brand identity.</span>
      <div role="group" aria-label="Atmosphere colors" className="trinity-swatches">
       {atmosphereChoices.map(choice=><button key={choice.id} type="button" className="trinity-swatch"
        aria-label={"Apply "+choice.label+" atmosphere"} aria-pressed={atmosphere===choice.id} onClick={()=>update(choice.id,theme)}>
        <span className="trinity-swatch-sample" style={{background:choice.color}}/><span>{choice.label}</span>{atmosphere===choice.id&&<Check size={14}/>}
       </button>)}
      </div>
      <div role="group" aria-label="Color mode" className="trinity-modes">
       {(["light","dark","system"] as const).map(mode=><button type="button" key={mode} aria-label={"Use "+mode+" mode"}
         aria-pressed={theme===mode} onClick={()=>update(atmosphere,mode)}>{mode==="light"?<Sun size={14}/>:mode==="dark"?<Moon size={14}/>:<Palette size={14}/>} {mode[0].toUpperCase()+mode.slice(1)}</button>)}
      </div>
     </div>}
    </div>
    <Link href={menu.cta.href} className="trinity-cta header-cta"><span>{menu.cta.label}</span><ArrowUpRight size={16}/></Link>
    <button ref={menuButton} type="button" className="trinity-mobile-trigger mobile-menu-trigger"
     aria-label={mobileOpen?"Close navigation":"Open navigation"} aria-expanded={mobileOpen} aria-controls={mobileId}
     onClick={()=>{setMobileOpen(!mobileOpen);setProductOpen(false);setAppearanceOpen(false);}}>
      {mobileOpen?<X size={21}/>:<Menu size={21}/>}
    </button>
   </div>
  </div>
  {mobileOpen&&<nav id={mobileId} className="trinity-mobile-panel mobile-menu" aria-label="Mobile navigation">
    <span className="trinity-popover-kicker">{menu.name.toUpperCase()} NAVIGATION</span>
    {[...menu.primary,...menu.more].map(item=><LocalLink key={item.href} item={item} onClick={()=>setMobileOpen(false)} current={isCurrent(item.href)}/>)}
    <Link href={menu.cta.href} className="trinity-mobile-cta" onClick={()=>setMobileOpen(false)}>{menu.cta.label}<ArrowUpRight size={16}/></Link>
  </nav>}
 </header>;
}
