/** Server-side only. Discovery never queries KhanHomes' private operational tables. */
import { createClient } from "@supabase/supabase-js";
import { PREVIEW_LISTINGS,type Listing,type PropertyKind,type ListingStatus,type ListingType } from "@/lib/catalog";

export type CatalogResponse={mode:"preview"|"live";listings:Listing[]};
export function discoveryBackendConfigured(): boolean {
 return Boolean(process.env.DISCOVERY_SUPABASE_URL && process.env.DISCOVERY_SUPABASE_SERVICE_ROLE_KEY);
}
export function discoveryClient() {
 const url=process.env.DISCOVERY_SUPABASE_URL;
 const key=process.env.DISCOVERY_SUPABASE_SERVICE_ROLE_KEY;
 if(!url || !key)throw new Error("Discovery backend is not configured");
 return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false},global:{headers:{"X-Client-Info":"khanhomes-discovery/0.1"}}});
}
type Row = {
 id:string;slug:string;title:string;area:string;county:string;kind:string;listing_type:string;
 price_kes:number;beds:number;baths:number;size_sqm:number;furnished:boolean;parking:boolean;
 amenities:string[];description:string;images:string[];verification:string;availability:string;source_updated_at:string;
};
function publicRow(row:Row): Listing{
 return {
  id:row.id,slug:row.slug,title:row.title,area:row.area,county:row.county,
  kind:row.kind as PropertyKind,type:row.listing_type as ListingType,
  priceKes:Number(row.price_kes),beds:row.beds,baths:row.baths,sizeSqm:row.size_sqm,
  furnished:row.furnished,parking:row.parking,
  amenities:Array.isArray(row.amenities)?row.amenities:[],
  description:row.description,images:Array.isArray(row.images)?row.images:[],
  status:row.verification as ListingStatus,availability:row.availability as Listing["availability"],
  updatedAt:row.source_updated_at,source:"khanhomes"
 };
}
export async function getPublicCatalog():Promise<CatalogResponse>{
 const url=process.env.DISCOVERY_SUPABASE_URL;
 const key=process.env.DISCOVERY_SUPABASE_SERVICE_ROLE_KEY;
 if(!url && !key)return {mode:"preview",listings:PREVIEW_LISTINGS};
 if(!url || !key)throw new Error("Incomplete Discovery backend configuration");
 const {data,error}=await discoveryClient().from("discovery_listings")
  .select("id,slug,title,area,county,kind,listing_type,price_kes,beds,baths,size_sqm,furnished,parking,amenities,description,images,verification,availability,source_updated_at")
  .eq("status","published").order("source_updated_at",{ascending:false}).limit(100);
 if(error)throw new Error("Published listing catalog unavailable");
 return {mode:"live",listings:(data??[]).map(item=>publicRow(item as Row))};
}
