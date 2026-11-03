/**
 * Shared browser-only parsing for Discover's existing local workspaces.
 * Never trust stored JSON: it may come from an obsolete version or manual edits.
 * No network, cookies, account sharing or persistence are introduced here.
 */
export const DISCOVER_FAVORITES_KEY="kh-discovery-saved-v1";

export function readStoredList<T>(raw:string|null,normalize:(data:unknown)=>T[]):T[]{
 try{return normalize(JSON.parse(raw??"[]"));}
 catch{return [];}
}

export function normalizeFavoriteIds(raw:unknown):string[]{
 if(!Array.isArray(raw))return [];
 const seen=new Set<string>(),ids:string[]=[];
 for(const value of raw){
  if(typeof value!=="string"||!/^[-A-Za-z0-9_]{3,90}$/.test(value)||seen.has(value))continue;
  seen.add(value);ids.push(value);
  if(ids.length===100)break;
 }
 return ids;
}
