import type {Listing,ListingType} from "./catalog";
export type SortOrder = "featured"|"price-low"|"price-high"|"newest";
export type Filters = {query:string;type:ListingType|"all";county:string;maxPrice:number|null;minBeds:number;parking:boolean;furnished:boolean;sort:SortOrder};
export const DEFAULT_FILTERS: Filters = {query:"",type:"rent",county:"All locations",maxPrice:null,minBeds:0,parking:false,furnished:false,sort:"featured"};
export function filterListings(listings:readonly Listing[], filters:Filters):Listing[]{
  const q=filters.query.trim().toLocaleLowerCase("en");
  const filtered=listings.filter(item=>{
    if(filters.type!=="all" && item.type!==filters.type)return false;
    if(filters.county!=="All locations" && item.county!==filters.county)return false;
    if(filters.maxPrice!==null && item.priceKes>filters.maxPrice)return false;
    if(item.beds<filters.minBeds || filters.parking&&!item.parking || filters.furnished&&!item.furnished)return false;
    if(q && ![item.title,item.area,item.county,item.kind,item.description,...item.amenities].join(" ").toLocaleLowerCase("en").includes(q))return false;
    return true;
  });
  if(filters.sort==="price-low")return filtered.sort((a,b)=>a.priceKes-b.priceKes);
  if(filters.sort==="price-high")return filtered.sort((a,b)=>b.priceKes-a.priceKes);
  if(filters.sort==="newest")return filtered.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
  return filtered;
}
export function uniqueCounties(listings:readonly Listing[]):string[]{
  return ["All locations",...Array.from(new Set(listings.map(item=>item.county))).sort()];
}
