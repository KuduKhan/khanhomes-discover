import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {ArrowLeft,ArrowRight,ArrowUpRight,Bath,BedDouble,CarFront,Check,Heart,MapPin,ShieldCheck,Square,CheckCircle2,Clock3} from "lucide-react";
import {getPublicCatalog} from "@/lib/public-catalog";
import {formatKes,statusText} from "@/lib/catalog";
import {PropertyPhoto} from "@/components/property-card";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
import {SaveHomeButton} from "@/components/save-home-button";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 const catalog=await getPublicCatalog();
 const home=catalog.listings.find(x=>x.slug===slug);
 if(!home)return {title:"Home not found"};
 return {title:home.title,description:home.source==="demo"?"Fictional concept property. Not a real listing.":home.description.slice(0,155)};
}
export default async function PropertyPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const catalog=await getPublicCatalog();
 const home=catalog.listings.find(x=>x.slug===slug);
 if(!home)notFound();
 return <div className="discovery-site detail-page"><a className="skip-link" href="#main">Skip to content</a><SiteHeader/><main id="main" className="wrap detail-main">
  <div className="detail-breadcrumb"><Link href="/#homes"><ArrowLeft size={15}/> All homes</Link><span>/</span><span>{home.county}</span><span>/</span><strong>{home.title}</strong></div>
  <div className="detail-title-row">
   <div><span className="section-kicker">{home.type==="rent"?"RENTAL CONCEPT":"PROPERTY CONCEPT"} · {home.kind.toUpperCase()}</span><h1>{home.title}</h1><p><MapPin size={17}/>{home.area} · {home.county}</p></div>
   <SaveHomeButton id={home.id}/>
  </div>
  <div className="detail-gallery">
   <PropertyPhoto src={home.images[0]??""} title={home.title} className="detail-photo-main"/>
   <div className="detail-secondary">
    <PropertyPhoto src={home.images[1]??home.images[0]??""} title={home.title+" room view"}/>
    <PropertyPhoto src={home.images[2]??home.images[0]??""} title={home.title+" second view"}/>
   </div>
   <span className="detail-gallery-note">{home.source==="demo"?"Illustrative photographs · Not an actual property":"Approved published property imagery"}</span>
  </div>
  <div className="detail-body">
   <div className="detail-content">
    <div className="detail-stats">
     <span><BedDouble size={21}/><strong>{home.beds===0?"Studio":home.beds+" beds"}</strong></span>
     <span><Bath size={21}/><strong>{home.baths} baths</strong></span>
     <span><Square size={20}/><strong>{home.sizeSqm} m²</strong></span>
     <span><CarFront size={21}/><strong>{home.parking?"Parking":"No parking listed"}</strong></span>
    </div>
    <section className="detail-section"><span className="section-kicker">GET TO KNOW THE SPACE</span><h2>A little more about this home.</h2><p>{home.description}</p></section>
    <section className="detail-section"><span className="section-kicker">THE LITTLE EXTRAS</span><h2>Features & amenities.</h2><div className="amenity-grid">{home.amenities.map(a=><span key={a}><CheckCircle2 size={18}/>{a}</span>)}<span><CheckCircle2 size={18}/>{home.furnished?"Furnished":"Unfurnished"}</span></div></section>
    <section className="detail-section status-explainer"><ShieldCheck size={23}/><div><h3>Designed for clarity.</h3><p>{home.source==="demo"?"This fictional home is a UI demonstration. No enquiry, viewing, booking or payment is available.": "Information is a publisher-supplied public snapshot. Confirm current availability and terms independently; an online publication alone is not proof of title, representation or occupancy."}</p></div></section>
   </div>
   <aside className="detail-aside" aria-label="Listing price and status">
    <span className="detail-aside-label">{home.type==="rent"?"MONTHLY RENT":"ASKING PRICE"} · {home.source==="demo"?"FICTIONAL":"PUBLISHED"}</span>
    <div className="detail-price">{formatKes(home.priceKes)}{home.type==="rent"&&<span> / month</span>}</div>
    <div className="detail-trust"><Check size={16}/>{statusText(home.status)}</div>
    <p className="detail-aside-notice">{home.source==="demo"?"Preview only. Real viewings and applications are not enabled.":"Booking a viewing requires an approved, verified manager workflow. Not available through this page yet."}</p>
    <button type="button" className="detail-book-disabled" disabled><Clock3 size={18}/> Viewing requests not yet enabled</button>
    <Link className="detail-back" href="/#homes">Continue exploring homes <ArrowRight size={16}/></Link>
    <div className="detail-fee-note"><ShieldCheck size={17}/> KhanHomes Discovery does not collect deposits or booking fees.</div>
   </aside>
  </div>
  <section className="detail-outro"><div><Heart size={23}/><h2>The right place is worth finding.</h2><p>Explore more possibilities with a calmer, clearer view of what matters.</p></div><Link href="/#homes">See more homes <ArrowUpRight size={17}/></Link></section>
 </main><SiteFooter mode={catalog.mode}/></div>;
}
