import {filterListings,parseFilters} from "./filters";
import type {Listing} from "./catalog";
import type {SavedSearch} from "./saved-searches";
export const WATCH_KEY="kh-discover-search-watch-v1";
export type WatchSnapshot={searchId:string;seenIds:string[];checkedAt:string};
export function normalizeWatchSnapshots(raw:unknown):WatchSnapshot[]{
 if(!Array.isArray(raw))return [];
 const result:WatchSnapshot[]=[];
 for(const item of raw){
  if(!item||typeof item!=="object")continue;
  const x=item as Record<string,unknown>;
  if(typeof x.searchId!=="string"||!/^[a-zA-Z0-9-]{8,80}$/.test(x.searchId)||
    typeof x.checkedAt!=="string"||!Number.isFinite(Date.parse(x.checkedAt))||
    !Array.isArray(x.seenIds))continue;
  const seenIds=Array.from(new Set(x.seenIds.filter((id):id is string=>typeof id==="string"&&/^[A-Za-z0-9-]{3,90}$/.test(id)))).slice(0,200);
  if(!result.some(y=>y.searchId===x.searchId))result.push({searchId:x.searchId,checkedAt:x.checkedAt,seenIds});
  if(result.length>=12)break;
 }
 return result;
}
export function matchingSavedSearch(entry:SavedSearch,catalog:readonly Listing[],counties:readonly string[]):Listing[]{
 return filterListings(catalog,parseFilters(new URLSearchParams(entry.query),counties));
}
export function newSinceSnapshot(entry:SavedSearch,snapshot:WatchSnapshot|undefined,catalog:readonly Listing[],counties:readonly string[]){
 if(!snapshot)return {initialized:false,matches:matchingSavedSearch(entry,catalog,counties),newHomes:[] as Listing[]};
 const matches=matchingSavedSearch(entry,catalog,counties);
 const old=new Set(snapshot.seenIds);
 return {initialized:true,matches,newHomes:matches.filter(x=>!old.has(x.id))};
}
/** Manual foreground refresh; no notification, email, push or background polling. */
export function checkSavedSearch(entry:SavedSearch,existing:readonly WatchSnapshot[],catalog:readonly Listing[],counties:readonly string[],checkedAt=new Date()):WatchSnapshot[]{
 const snapshot={searchId:entry.id,seenIds:matchingSavedSearch(entry,catalog,counties).map(x=>x.id).slice(0,200),checkedAt:checkedAt.toISOString()};
 return [snapshot,...existing.filter(x=>x.searchId!==entry.id)].slice(0,12);
}
