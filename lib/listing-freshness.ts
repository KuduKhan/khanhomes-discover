import type {Listing,ListingStatus} from "./catalog";
/**
 * Public badges must age out. A stale signed snapshot is not an availability
 * guarantee, even if an upstream publisher once said "available".
 */
export function normalizeListingFreshness(
 status:ListingStatus,availability:Listing["availability"],updatedAt:string,now=Date.now()
):{status:ListingStatus;availability:Listing["availability"]}{
 const updated=Date.parse(updatedAt);
 const recent=Number.isFinite(updated)&&updated<=now+5*60*1000&&now-updated<=7*86400000;
 if(!recent)return {
  status:status==="availability-confirmed"?"listing-reviewed":status,
  availability:"unknown"
 };
 return {status,availability};
}
