"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {
 ArrowRight,ArrowUpRight,BadgeCheck,Building2,CheckCircle2,ChevronDown,Compass,
 GitCompareArrows,Heart,House,KeyRound,MapPin,Search,ShieldCheck,SlidersHorizontal,
 Sparkles,Users,X,Grid2X2,Rows3,MoveUpRight,Map as MapIcon
} from "lucide-react";
import {type Listing,PREVIEW_NOTICE,formatKes} from "@/lib/catalog";
import {DEFAULT_FILTERS,HOME_KINDS,POPULAR_AMENITIES,countActiveFilters,filterListings,uniqueCounties,type Filters,type SortOrder} from "@/lib/filters";
import {DiscoverTools} from "@/components/discover-tools";
import {AreaAtlas} from "@/components/area-atlas";
import {PropertyCard,PropertyPhoto} from "@/components/property-card";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
import {DISCOVER_FAVORITES_KEY,normalizeFavoriteIds,readStoredList} from "@/lib/local-preferences";

const parentUrl=process.env.NEXT_PUBLIC_KHANHOMES_URL||"https://khanhomes.vercel.app";
type Catalog={mode:"preview"|"live";listings:Listing[]};
export function DiscoveryExperience({catalog}:{catalog:Catalog}){
 const [filters,setFilters]=useState<Filters>(DEFAULT_FILTERS);
 const [saved,setSaved]=useState<string[]>([]);
 const [savedOnly,setSavedOnly]=useState(false);
 const [compared,setCompared]=useState<string[]>([]);
 const [compareVisible,setCompareVisible]=useState(false);
 const [filtersOpen,setFiltersOpen]=useState(false);
 const [view,setView]=useState<"grid"|"list"|"map">("grid");
 const [compareWarning,setCompareWarning]=useState("");
 const resultsRef=useRef<HTMLElement>(null);
 useEffect(()=>{
  const synchronize=()=>{
   try{setSaved(readStoredList(localStorage.getItem(DISCOVER_FAVORITES_KEY),normalizeFavoriteIds));}
   catch{setSaved([]);}
  };
  synchronize();
  const onStorage=(event:StorageEvent)=>{
   if(event.key===DISCOVER_FAVORITES_KEY||event.key===null)synchronize();
  };
  window.addEventListener("storage",onStorage);
  return()=>window.removeEventListener("storage",onStorage);
 },[]);
 const save=(id:string)=>{
  setSaved(old=>{
   const next=normalizeFavoriteIds(old.includes(id)?old.filter(x=>x!==id):[...old,id]);
   try{localStorage.setItem(DISCOVER_FAVORITES_KEY,JSON.stringify(next));}catch{}
   return next;
  });
 };
 const compare=(id:string)=>{
  setCompared(old=>{
   if(old.includes(id)){setCompareWarning("");return old.filter(x=>x!==id);}
   if(old.length>=3){setCompareWarning("Choose at most three homes. Remove one to compare another.");return old;}
   setCompareWarning("");return [...old,id];
  });
 };
 const choose=(key:keyof Filters,value:Filters[keyof Filters])=>setFilters(old=>({...old,[key]:value}));
 const clear=()=>{setFilters({...DEFAULT_FILTERS,amenities:[]});setSavedOnly(false)};
 const shown=useMemo(()=>{
  const data=filterListings(catalog.listings,filters);
  return savedOnly?data.filter(home=>saved.includes(home.id)):data;
 },[catalog.listings,filters,savedOnly,saved]);
 const counties=useMemo(()=>uniqueCounties(catalog.listings),[catalog.listings]);
 const chosen=catalog.listings.filter(home=>compared.includes(home.id));
 useEffect(()=>{if(compareVisible)document.getElementById("compare-homes")?.scrollIntoView({behavior:"smooth",block:"start"});},[compareVisible]);
 const featured=catalog.listings[0];
 return <div className="discovery-site">
  <a href="#main" className="skip-link">Skip to content</a>
  <SiteHeader/>
  <main id="main">
   <section className="hero-section">
    <div className="wrap hero-layout">
     <div className="hero-content">
      <span className="eyebrow"><span className="eyebrow-dot"/> ANOTHER WAY TO FEEL AT HOME</span>
      <h1>Find a place<br/>to <em>belong.</em></h1>
      <p className="hero-description">Homes worth discovering. Neighborhoods worth exploring. A calmer, more considered journey to your next address.</p>
      <form className="hero-search" role="search" onSubmit={e=>{e.preventDefault();resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"});}}>
       <Search size={21}/><label className="sr-only" htmlFor="hero-search-input">Search by location, home or amenity</label>
       <input id="hero-search-input" placeholder="Where would you love to live?" value={filters.query} onChange={e=>choose("query",e.target.value)} autoComplete="off"/>
       <button type="submit">Explore homes <ArrowRight size={17}/></button>
      </form>
      <div className="hero-areas"><span>Explore:</span>{["Nairobi","Mombasa","Kisumu"].map(area=><button type="button" key={area} onClick={()=>{choose("county",area);resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"});}}>{area}<ArrowUpRight size={12}/></button>)}</div>
      <div className="hero-assurance"><span><ShieldCheck size={17}/> Privacy-first</span><span><Sparkles size={17}/> Beautifully connected</span></div>
     </div>
     <div className="hero-feature">
      {featured&&<><PropertyPhoto src={featured.images[0]??""} title={featured.title} className="hero-photo"/>
      <div className="hero-photo-overlay" aria-hidden="true"/>
      <span className="hero-image-kicker"><Compass size={15}/> THE ART OF FINDING HOME</span>
      <div className="hero-feature-caption">
       <span>CONCEPT PROPERTY · {featured.county.toUpperCase()}</span>
       <h2>Good living starts<br/>with belonging.</h2>
       <p>{featured.title} · A curated visual preview</p>
      </div>
      <div className="hero-feature-floating"><span className="floating-icon"><House size={22}/></span><div><strong>Your place, your pace.</strong><small>Discover with confidence.</small></div><CheckCircle2 size={18}/></div>
      </>}
     </div>
    </div>
   </section>
   <div className="wrap announcement" role="note">
    <span className="notice-icon"><ShieldCheck size={17}/></span>
    <p>{catalog.mode==="preview"?PREVIEW_NOTICE:"Listings are published snapshots supplied by approved KhanHomes publishers. Independently confirm availability before acting."}</p>
    <span className="announcement-status">{catalog.mode==="preview"?"PREVIEW MODE":"PUBLISHED CATALOG"}</span>
   </div>

   <section className="homes-section wrap" id="homes" ref={resultsRef}>
    <div className="section-heading">
     <div><span className="section-kicker">EXPLORE OUR WORLD OF HOMES</span><h2>Discover homes that <em>fit you.</em></h2><p>Explore the details, compare your options, and keep the places you love close.</p></div>
     <span className="section-side-note"><MapPin size={17}/> Kenya-first discovery</span>
    </div>
    <div className="catalog-frame">
      <div className="discover-journey-bar" aria-label="Personal house-hunting tools">
       <Link href="/match"><span className="journey-icon"><Sparkles size={20}/></span><span><strong>AURA Match Studio</strong><small>Find your best-fit homes</small></span><ArrowRight size={16}/></Link>
       <Link href="/watch"><span className="journey-icon"><Heart size={20}/></span><span><strong>Saved Search Watch</strong><small>Check for newly appearing homes</small></span><ArrowRight size={16}/></Link>
       <Link href="/visits"><span className="journey-icon"><Compass size={20}/></span><span><strong>Plan your visits</strong><small>Private, tentative calendar</small></span><ArrowRight size={16}/></Link>
      </div>
      <DiscoverTools filters={filters} onFiltersChange={setFilters} counties={counties}/>
      <div className="catalog-toolbar">
       <div className="listing-tabs" role="group" aria-label="Purchase preference">
        <button type="button" aria-pressed={filters.type==="rent"} onClick={()=>choose("type","rent")}>For rent</button>
        <button type="button" aria-pressed={filters.type==="sale"} onClick={()=>choose("type","sale")}>For sale</button>
        <button type="button" aria-pressed={filters.type==="all"} onClick={()=>choose("type","all")}>All homes</button>
       </div>
       <div className="toolbar-actions">
        <button type="button" className={"saved-filter"+(savedOnly?" active":"")} onClick={()=>setSavedOnly(!savedOnly)} aria-pressed={savedOnly}><Heart size={17} fill={savedOnly?"currentColor":"none"}/> Saved <span>{saved.length}</span></button>
        <button type="button" className="filter-trigger" onClick={()=>setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} aria-controls="discovery-filters"><SlidersHorizontal size={17}/> Filters {countActiveFilters(filters)>0&&<span className="filter-count">{countActiveFilters(filters)}</span>} <ChevronDown size={15}/></button>
       </div>
      </div>
      <div id="discovery-filters" className={"filter-fields"+(filtersOpen?" is-open":"")} >
       <label className="filter-field"><span>Location</span><select aria-label="Filter by county" value={filters.county} onChange={e=>choose("county",e.target.value)}>{counties.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
       <label className="filter-field"><span>Maximum budget (KES)</span><select aria-label="Maximum budget" value={filters.maxPrice??0} onChange={e=>choose("maxPrice",Number(e.target.value)||null)}>
        <option value="0">Any budget</option>{(filters.type==="sale"?[10000000,20000000,50000000,100000000]:[25000,35000,50000,75000,100000,150000,250000]).map(p=><option key={p} value={p}>{formatKes(p)}</option>)}</select></label>
       <label className="filter-field"><span>Minimum bedrooms</span><select aria-label="Minimum bedrooms" value={filters.minBeds} onChange={e=>choose("minBeds",Number(e.target.value))}>{[0,1,2,3,4].map(n=><option key={n} value={n}>{n===0?"Any / studio":n+"+"}</option>)}</select></label>
       <label className="filter-field"><span>Property type</span><select aria-label="Property type" value={filters.kind} onChange={e=>choose("kind",e.target.value as Filters["kind"])}><option value="all">All property types</option>{HOME_KINDS.map(kind=><option key={kind} value={kind}>{kind}</option>)}</select></label>
       <label className="filter-field"><span>Minimum bathrooms</span><select aria-label="Minimum bathrooms" value={filters.minBaths} onChange={e=>choose("minBaths",Number(e.target.value))}>{[0,1,2,3,4].map(n=><option key={n} value={n}>{n===0?"Any bathrooms":n+"+"}</option>)}</select></label>
       <label className="filter-field"><span>Minimum floor area</span><select aria-label="Minimum floor area" value={filters.minSqm} onChange={e=>choose("minSqm",Number(e.target.value))}>{[0,40,70,100,150,200].map(n=><option key={n} value={n}>{n===0?"Any floor area":n+"+ m²"}</option>)}</select></label>
       <div className="filter-checkboxes">
        <label><input type="checkbox" checked={filters.parking} onChange={e=>choose("parking",e.target.checked)}/> Parking</label>
        <label><input type="checkbox" checked={filters.furnished} onChange={e=>choose("furnished",e.target.checked)}/> Furnished</label>
       </div>
       <div className="amenity-filter-group"><strong>Must-have amenities</strong><div>{POPULAR_AMENITIES.filter(x=>x!=="Parking").map(item=><label key={item}><input type="checkbox" checked={filters.amenities.includes(item)} onChange={e=>choose("amenities",e.target.checked?[...filters.amenities,item]:filters.amenities.filter(x=>x!==item))}/>{item}</label>)}</div></div>
       <button type="button" className="reset-filters" onClick={clear}>Reset filters <X size={14}/></button>
      </div>
      <div className="results-bar">
       <div className="results-summary"><strong>{shown.length} {shown.length===1?"home":"homes"}</strong><span>{catalog.mode==="preview"?"Illustrative collection":"Published and visible"}</span></div>
       <div className="sort-actions">
        <label className="sort-select"><span className="sr-only">Sort listings</span><select aria-label="Sort homes" value={filters.sort} onChange={e=>choose("sort",e.target.value as SortOrder)}>
         <option value="featured">Curated order</option><option value="newest">Recently updated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option>
        </select></label>
        <div className="view-choice" role="group" aria-label="Display layout">
         <button type="button" aria-label="Grid layout" aria-pressed={view==="grid"} onClick={()=>setView("grid")}><Grid2X2 size={16}/></button>
         <button type="button" aria-label="List layout" aria-pressed={view==="list"} onClick={()=>setView("list")}><Rows3 size={17}/></button>
         <button type="button" aria-label="Area map view" aria-pressed={view==="map"} onClick={()=>setView("map")}><MapIcon size={16}/></button>
        </div>
       </div>
      </div>
      {shown.length>0?(view==="map"?<AreaAtlas listings={catalog.listings} county={filters.county} onSelect={county=>choose("county",county)}/>:<div className={"property-grid "+(view==="list"?"property-list":"")}>
       {shown.map(home=><PropertyCard key={home.id} home={home} saved={saved.includes(home.id)} compared={compared.includes(home.id)}
         onSave={()=>save(home.id)} onCompare={()=>compare(home.id)} compact={view==="list"}/>)}
      </div>):<div className="empty-results"><span><Search size={31}/></span><h3>{catalog.mode==="live"&&!catalog.listings.length?"No homes have been published yet.":"No homes match these filters."}</h3><p>Adjust your criteria or clear your filters to explore other options.</p><button type="button" onClick={clear}>Clear filters <ArrowRight size={16}/></button></div>}
      {compareWarning&&<p className="compare-warning" role="status">{compareWarning}</p>}
      {catalog.mode==="preview"&&<p className="catalog-disclaimer"><ShieldCheck size={16}/> All preview homes and prices are fictional. No property shown here can be booked or purchased.</p>}
    </div>
   </section>

   <section className="connection-section" id="connection">
    <div className="wrap connection-layout">
     <div className="connection-copy">
      <span className="section-kicker">ONE HOME JOURNEY · TWO SPECIALIST EXPERIENCES</span>
      <h2>A home is just<br/>the <em>beginning.</em></h2>
      <p>Discover brings a thoughtful way to find a place. KhanHomes OS helps authorized owners and managers care for the people, properties and operations behind it.</p>
      <a href={parentUrl} target="_blank" rel="noopener noreferrer" className="connection-cta">Explore KhanHomes OS <ArrowUpRight size={17}/></a>
      <Link href="/studio" className="atelier-cta">Prepare a private listing draft <ArrowRight size={16}/></Link>
     </div>
     <div className="connection-steps" aria-label="Connected journey">
      <article><span><Search size={21}/></span><div><small>01 / DISCOVER</small><h3>Explore possibilities.</h3><p>Search, save and compare curated homes without the noise.</p></div></article>
      <article><span><Users size={21}/></span><div><small>02 / CONNECT</small><h3>Meet the right people.</h3><p>Approved enquiries and viewings will connect with authorized managers.</p></div></article>
      <article><span><KeyRound size={21}/></span><div><small>03 / BELONG</small><h3>Make space your own.</h3><p>After a verified lease, resident services remain within private KhanHomes OS.</p></div></article>
     </div>
    </div>
   </section>
   <section className="how-section wrap" id="how-it-works">
    <div className="section-heading"><div><span className="section-kicker">THE EXPERIENCE</span><h2>Effortless by <em>design.</em></h2><p>Everything you need to explore thoughtfully. Nothing you do not.</p></div></div>
    <div className="how-grid">
     <article><span><Compass size={22}/></span><small>01</small><h3>Discover with intention</h3><p>Choose a location, fine-tune your needs, and see options at your own pace.</p></article>
     <article><span><Heart size={22}/></span><small>02</small><h3>Save what matters</h3><p>Create a browser-local shortlist and compare up to three homes side by side.</p></article>
     <article><span><BadgeCheck size={22}/></span><small>03</small><h3>Choose with clarity</h3><p>Review published details and verification labels before considering a real viewing.</p></article>
    </div>
   </section>
   <section className="closing-section">
    <div className="wrap closing-panel"><div><span>KHANHOMES DISCOVER</span><h2>Somewhere beautiful<br/>begins with <em>home.</em></h2><p>Find a space that feels like the beginning of something wonderful.</p></div><button type="button" onClick={()=>resultsRef.current?.scrollIntoView({behavior:"smooth"})}>Explore homes <ArrowRight size={18}/></button><span className="closing-glyph" aria-hidden="true"><Building2 size={165} strokeWidth={.65}/></span></div>
   </section>
  </main>
  {compared.length>0&&<div className="compare-dock" role="region" aria-label="Compare homes">
   <div className="compare-dock-inner"><div className="compare-indicator"><GitCompareArrows size={20}/><span><strong>{compared.length} of 3 selected</strong><small>Compare your favorites</small></span></div>
    <div className="compared-titles">{chosen.map(home=><span key={home.id}>{home.title}<button onClick={()=>compare(home.id)} aria-label={"Remove "+home.title} type="button"><X size={13}/></button></span>)}</div>
    <button type="button" className="compare-open" disabled={compared.length<2} onClick={()=>setCompareVisible(true)}>Compare <ArrowRight size={16}/></button>
    <button type="button" className="compare-dismiss" onClick={()=>{setCompared([]);setCompareVisible(false)}} aria-label="Clear comparison"><X size={18}/></button>
   </div>
  </div>}
  {compareVisible&&chosen.length>1&&<section className="wrap compare-section" id="compare-homes" aria-label="Home comparison">
   <div className="compare-heading"><h2>Side by side. <em>At a glance.</em></h2><button onClick={()=>setCompareVisible(false)} type="button">Close <X size={16}/></button></div>
   <div className="compare-table-scroll"><table><caption>Comparison of selected {catalog.mode==="preview"?"fictional preview":"published"} homes</caption><thead><tr><th scope="col">Detail</th>{chosen.map(home=><th scope="col" key={home.id}><Link href={"/homes/"+home.slug}>{home.title} <MoveUpRight size={13}/></Link></th>)}</tr></thead>
   <tbody><tr><th scope="row">Price</th>{chosen.map(h=><td key={h.id}>{formatKes(h.priceKes)} {h.type==="rent"?"/ mo":""}</td>)}</tr>
   <tr><th scope="row">Location</th>{chosen.map(h=><td key={h.id}>{h.area}</td>)}</tr>
   <tr><th scope="row">Bedrooms</th>{chosen.map(h=><td key={h.id}>{h.beds===0?"Studio":h.beds}</td>)}</tr>
   <tr><th scope="row">Bathrooms</th>{chosen.map(h=><td key={h.id}>{h.baths}</td>)}</tr>
   <tr><th scope="row">Floor area</th>{chosen.map(h=><td key={h.id}>{h.sizeSqm} m²</td>)}</tr>
   <tr><th scope="row">Parking</th>{chosen.map(h=><td key={h.id}>{h.parking?"Yes":"No"}</td>)}</tr>
   <tr><th scope="row">Furnished</th>{chosen.map(h=><td key={h.id}>{h.furnished?"Yes":"No"}</td>)}</tr></tbody></table></div>
   </section>}
  <SiteFooter mode={catalog.mode}/>
 </div>;
}
