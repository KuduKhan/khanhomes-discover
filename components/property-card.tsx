"use client";
import Link from "next/link";
import {ArrowUpRight,Bath,BedDouble,Check,Heart,GitCompareArrows,MapPin,Square,CarFront} from "lucide-react";
import {type Listing,formatKes,statusText} from "@/lib/catalog";
export function PropertyPhoto({src,title,className=""}:{src:string;title:string;className?:string}){
 return <div role="img" aria-label={"Illustration for "+title} className={"property-photo "+className}
  style={{backgroundImage:`linear-gradient(180deg, rgba(12,37,38,.02),rgba(12,37,38,.11)),url(${JSON.stringify(src)})`}}/>;
}
export function PropertyCard({home,saved,compared,onSave,onCompare,compact=false}:{home:Listing;saved:boolean;compared:boolean;onSave:()=>void;onCompare:()=>void;compact?:boolean}){
 return <article className={"property-card"+(compact?" property-card-compact":"")}>
   <div className="property-visual">
     <Link href={"/homes/"+home.slug} className="property-photo-link" aria-label={"View "+home.title+" details"}>
      <PropertyPhoto src={home.images[0]??""} title={home.title}/>
     </Link>
     <div className="photo-topline"><span className="image-type">{home.type==="rent"?"FOR RENT":"FOR SALE"}</span><span className="image-state">{statusText(home.status)}</span></div>
     <button type="button" className={"save-btn"+(saved?" is-saved":"")} onClick={onSave} aria-label={(saved?"Remove saved ":"Save ")+home.title} aria-pressed={saved} title={saved?"Remove from saved":"Save home"}>
      <Heart size={18} fill={saved?"currentColor":"none"}/>
     </button>
   </div>
   <div className="property-copy">
     <div className="property-price-line"><strong>{formatKes(home.priceKes)}</strong><span>{home.type==="rent"?"/ month":"asking"}</span></div>
     <h3><Link href={"/homes/"+home.slug}>{home.title} <ArrowUpRight size={17}/></Link></h3>
     <p className="property-location"><MapPin size={14}/>{home.area}</p>
     <div className="property-specs">
      <span><BedDouble size={16}/>{home.beds===0?"Studio":home.beds+" beds"}</span>
      <span><Bath size={16}/>{home.baths} baths</span>
      <span><Square size={15}/>{home.sizeSqm} m²</span>
      {home.parking&&<span className="parking-indicator" title="Parking listed"><CarFront size={15}/></span>}
     </div>
     <div className="property-bottom">
       <span className="concept-note"><Check size={13}/>{home.source==="demo"?"Fictional sample":"Published snapshot"}</span>
       <button type="button" className={"compare-btn"+(compared?" is-compared":"")} aria-pressed={compared} onClick={onCompare}>
         <GitCompareArrows size={15}/>{compared?"Comparing":"Compare"}
       </button>
     </div>
   </div>
 </article>;
}
