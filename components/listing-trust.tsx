import {ArrowUpRight,BadgeCheck,CalendarClock,MapPin,ShieldCheck} from "lucide-react";
import {type Listing} from "@/lib/catalog";
export function ListingTrust({listing}:{listing:Listing}){
 const preview=listing.source==="demo";
 return <section className="listing-trust" aria-label="Listing trust and area details">
  <div className="listing-trust-header"><ShieldCheck size={21}/><div><span className="section-kicker">KNOW WHAT HAS BEEN CHECKED</span><h2>Listing transparency</h2></div></div>
  <div className="trust-grid">
   <div><BadgeCheck size={18}/><strong>{preview?"Demonstration":"Publisher-supplied listing"}</strong><p>{preview?"Property is fictional. This is not identity or ownership verification.":"Published by the signed KhanHomes interface; identity/representation verification status must be checked separately."}</p></div>
   <div><CalendarClock size={18}/><strong>{preview?"Availability unknown":listing.availability==="available"?"Reported available":"Availability not confirmed"}</strong><p>{preview?"No reservation or viewing can be made.":"A listing snapshot is not a guarantee that the property remains vacant. Reconfirm before acting."}</p></div>
   <div><MapPin size={18}/><strong>{listing.area}</strong><p>Only a general area is displayed; no exact occupied-home address, resident identity, or access instructions.</p></div>
  </div>
  <p className="trust-footer">Prices, availability and amenities in any real listing must be independently confirmed. Never transfer booking fees or deposits through an unverified channel. <a target="_blank" rel="noopener noreferrer" href="https://www.odpc.go.ke/">Learn about data privacy <ArrowUpRight size={13}/></a></p>
 </section>;
}
