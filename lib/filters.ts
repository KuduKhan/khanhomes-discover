import type {Listing,ListingType,PropertyKind} from "./catalog";

export type SortOrder="featured"|"price-low"|"price-high"|"newest";
export type Filters={
 query:string;type:ListingType|"all";county:string;maxPrice:number|null;
 minBeds:number;minBaths:number;minSqm:number;kind:PropertyKind|"all";
 parking:boolean;furnished:boolean;amenities:string[];sort:SortOrder;
};
export const DEFAULT_FILTERS:Filters={
 query:"",type:"rent",county:"All locations",maxPrice:null,
 minBeds:0,minBaths:0,minSqm:0,kind:"all",parking:false,furnished:false,amenities:[],sort:"featured"
};
export const HOME_KINDS:readonly PropertyKind[]=["Apartment","Studio","Townhouse","Maisonette","Villa"];
export const POPULAR_AMENITIES=["Security","Balcony","Parking","Lift","Garden","Pet friendly","Internet ready","Gym","Air conditioning"] as const;
export function filterListings(listings:readonly Listing[],filters:Filters):Listing[]{
 const q=filters.query.trim().toLocaleLowerCase("en");
 const filtered=listings.filter(item=>{
  if(filters.type!=="all" && item.type!==filters.type)return false;
  if(filters.county!=="All locations"&&item.county!==filters.county)return false;
  if(filters.kind!=="all" && item.kind!==filters.kind)return false;
  if(filters.maxPrice!==null && item.priceKes>filters.maxPrice)return false;
  if(item.beds<filters.minBeds || item.baths<filters.minBaths || item.sizeSqm<filters.minSqm)return false;
  if(filters.parking&&!item.parking||filters.furnished&&!item.furnished)return false;
  if(filters.amenities.some(x=>!item.amenities.some(a=>a.toLowerCase()===x.toLowerCase())))return false;
  if(q&&![item.title,item.area,item.county,item.kind,item.description,...item.amenities].join(" ").toLocaleLowerCase("en").includes(q))return false;
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
export function countActiveFilters(f:Filters):number{
 return Number(Boolean(f.query.trim()))+Number(f.county!=="All locations")+Number(f.maxPrice!==null)+
  Number(f.minBeds>0)+Number(f.minBaths>0)+Number(f.minSqm>0)+Number(f.kind!=="all")+
  Number(f.parking)+Number(f.furnished)+f.amenities.length;
}
export function serializeFilters(f:Filters):string{
 const p=new URLSearchParams();
 if(f.query.trim())p.set("q",f.query.trim().slice(0,120));
 if(f.type!=="rent")p.set("type",f.type);
 if(f.county!=="All locations")p.set("county",f.county);
 if(f.maxPrice!==null)p.set("max",String(f.maxPrice));
 if(f.minBeds)p.set("beds",String(f.minBeds));
 if(f.minBaths)p.set("baths",String(f.minBaths));
 if(f.minSqm)p.set("size",String(f.minSqm));
 if(f.kind!=="all")p.set("kind",f.kind);
 if(f.parking)p.set("parking","1");
 if(f.furnished)p.set("furnished","1");
 if(f.amenities.length)p.set("amenities",f.amenities.join(","));
 if(f.sort!=="featured")p.set("sort",f.sort);
 return p.toString();
}
const integer=(v:string|null,max:number):number=>{
 const n=Number(v);
 return v!==null&&/^\d+$/.test(v)&&Number.isSafeInteger(n)&&n>=0&&n<=max?n:0;
};
export function parseFilters(params:URLSearchParams,counties:readonly string[]):Filters{
 const types=["rent","sale","all"];
 const sorts=["featured","price-low","price-high","newest"];
 const type=params.get("type"),sort=params.get("sort"),kind=params.get("kind");
 const county=params.get("county"),amenities=params.get("amenities");
 const budget=integer(params.get("max"),1000000000000);
 return {
  query:(params.get("q")??"").slice(0,120),
  type:types.includes(type??"")?type as Filters["type"]:"rent",
  county:county&&counties.includes(county)?county:"All locations",
  maxPrice:budget>0?budget:null,
  minBeds:integer(params.get("beds"),30),minBaths:integer(params.get("baths"),30),
  minSqm:integer(params.get("size"),100000),
  kind:HOME_KINDS.includes(kind as PropertyKind)?kind as PropertyKind:"all",
  parking:params.get("parking")==="1",furnished:params.get("furnished")==="1",
  amenities:amenities?Array.from(new Set(amenities.split(",").filter(x=>POPULAR_AMENITIES.includes(x as typeof POPULAR_AMENITIES[number])))).slice(0,9):[],
  sort:sorts.includes(sort??"")?sort as SortOrder:"featured"
 };
}
