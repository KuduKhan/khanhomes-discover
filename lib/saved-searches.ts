import {DEFAULT_FILTERS,parseFilters,serializeFilters,type Filters} from "./filters";
export const SEARCHES_KEY="kh-discover-saved-searches-v2";
export type SavedSearch={id:string;label:string;query:string;savedAt:string};
export function normalizeSavedSearches(input:unknown):SavedSearch[]{
 if(!Array.isArray(input))return [];
 const out:SavedSearch[]=[];
 for(const row of input){
  if(!row||typeof row!=="object")continue;
  const r=row as Record<string,unknown>;
  if(typeof r.id!=="string"||!/^[a-zA-Z0-9-]{8,80}$/.test(r.id)||
   typeof r.label!=="string"||!r.label.trim()||r.label.length>70||
   typeof r.query!=="string"||r.query.length>1000||
   typeof r.savedAt!=="string"||!Number.isFinite(Date.parse(r.savedAt)))continue;
  if(!out.some(x=>x.id===r.id))out.push({id:r.id,label:r.label.trim(),query:r.query,savedAt:r.savedAt});
  if(out.length===12)break;
 }
 return out;
}
export function makeSavedSearch(label:string,filters:Filters,id:string,now=new Date()):SavedSearch{
 const text=label.trim().slice(0,70);
 if(!text)throw new Error("A saved search requires a label");
 if(!/^[a-zA-Z0-9-]{8,80}$/.test(id))throw new Error("Invalid saved search identifier");
 return {id,label:text,query:serializeFilters(filters),savedAt:now.toISOString()};
}
export function restoreSavedSearch(entry:SavedSearch,counties:readonly string[]):Filters{
 return parseFilters(new URLSearchParams(entry.query),counties);
}
export function defaultSearch():Filters{return {...DEFAULT_FILTERS,amenities:[]};}
