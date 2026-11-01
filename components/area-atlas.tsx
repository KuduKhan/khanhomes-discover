"use client";
import Link from "next/link";
import {ArrowUpRight,Compass,Map,MapPin,ShieldCheck} from "lucide-react";
import {formatKes,type Listing} from "@/lib/catalog";
type Props={listings:readonly Listing[];county:string;onSelect:(county:string)=>void};
const CITIES=[
 {name:"Nairobi",x:50,y:57},
 {name:"Mombasa",x:76,y:84},
 {name:"Kisumu",x:26,y:55}
] as const;
/** Coarse county overview — not a geocoded location of an occupied private home. */
export function AreaAtlas({listings,county,onSelect}:Props){
 const regions=CITIES.map(city=>{
  const homes=listings.filter(x=>x.county===city.name);
  const from=Math.min(...homes.map(x=>x.priceKes));
  return {...city,count:homes.length,from:Number.isFinite(from)?from:null};
 });
 return <section className="area-atlas" aria-label="Interactive Kenya area overview">
  <div className="atlas-intro">
   <div><span className="section-kicker">DISCOVER BY AREA</span><h3><Compass size={20}/> Find your neighborhood.</h3><p>Choose a city to filter homes. Markers represent broad city regions, <strong>not exact home addresses</strong>. No geocoded unit positions are shown.</p></div>
   <span className="atlas-privacy"><ShieldCheck size={17}/> Location privacy by design</span>
  </div>
  <div className="atlas-layout">
   <div className="atlas-map" role="group" aria-label="Schematic region selector, not a geographic navigation map">
    <div className="atlas-orbit atlas-orbit-one"/><div className="atlas-orbit atlas-orbit-two"/>
    <svg aria-hidden="true" className="atlas-contour" viewBox="0 0 360 390" fill="none">
     <path d="M93 24 160 11 216 24 282 52 309 108 296 165 316 220 277 301 217 373 167 354 129 310 88 270 56 203 76 150 61 103Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="7 9" opacity=".35"/>
     <path d="M20 80C110 45 177 90 343 18M12 180C132 102 226 156 358 90M5 277C128 217 244 230 362 158M38 349C156 287 240 328 358 243" stroke="currentColor" strokeWidth=".9" opacity=".18"/>
    </svg>
    {regions.map(place=><button type="button" key={place.name}
       className={"atlas-marker"+(county===place.name?" is-active":"")}
       style={{left:place.x+"%",top:place.y+"%"}} onClick={()=>onSelect(county===place.name?"All locations":place.name)}
       aria-label={"Filter "+place.name+", "+place.count+" homes"} aria-pressed={county===place.name}>
       <span className="atlas-count">{place.count}</span><span className="atlas-label">{place.name}</span>
    </button>)}
    <span className="atlas-watermark"><Map size={16}/> SCHEMATIC REGION VIEW</span>
   </div>
   <div className="atlas-cities">
    <div className="atlas-cities-top"><strong>Explore Kenyan cities</strong><span>Preview regions</span></div>
    {regions.map(place=><button type="button" key={place.name} className={"atlas-city"+(county===place.name?" is-active":"")} onClick={()=>onSelect(county===place.name?"All locations":place.name)}>
      <span className="atlas-city-icon"><MapPin size={18}/></span><span className="atlas-city-copy"><strong>{place.name}</strong><small>{place.count} {place.count===1?"preview home":"preview homes"}{place.from!==null?" · from "+formatKes(place.from):""}</small></span><ArrowUpRight size={17}/>
    </button>)}
    <p className="atlas-note">This abstract overview is not a street map, route planner, commute calculation, or availability verification. Actual published listings require consented area/location disclosure.</p>
    <Link href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="atlas-external">Explore detailed public maps <ArrowUpRight size={16}/></Link>
   </div>
  </div>
 </section>;
}
