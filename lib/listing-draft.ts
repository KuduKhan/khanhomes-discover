/** Local listing preparation only. It has NO authority to publish a KhanHomes unit. */
export const LISTING_DRAFT_KEY="kh-discover-listing-atelier-v1";
export const DRAFT_KINDS=["Apartment","Studio","Townhouse","Maisonette","Villa"] as const;
export type DraftKind=typeof DRAFT_KINDS[number];
export type DraftType="rent"|"sale";
export const DRAFT_AMENITIES=["Parking","Security","Balcony","Lift","Garden","Pet friendly","Internet ready","Gym","Air conditioning","Terrace"] as const;
export type DraftAmenity=typeof DRAFT_AMENITIES[number];
export type ListingDraft={
 id:string;title:string;area:string;county:string;type:DraftType;kind:DraftKind;
 priceKes:number;beds:number;baths:number;sizeSqm:number;furnished:boolean;parking:boolean;
 amenities:DraftAmenity[];description:string;charges:string;
 representationChecked:boolean;mediaRightsChecked:boolean;availabilityChecked:boolean;
 updatedAt:string;
};
const text=(value:unknown,max:number):string=>typeof value==="string"?value.trim().slice(0,max):"";
const whole=(value:unknown,min:number,max:number,def:number):number=>
 typeof value==="number"&&Number.isSafeInteger(value)&&value>=min&&value<=max?value:def;
const validDraftId=(s:string)=>/^[0-9a-zA-Z-]{8,80}$/.test(s);
export function blankListingDraft(id:string,now=new Date()):ListingDraft{
 if(!validDraftId(id))throw new Error("Invalid draft identifier");
 return {id,title:"",area:"",county:"Nairobi",type:"rent",kind:"Apartment",priceKes:0,beds:1,baths:1,sizeSqm:0,
 furnished:false,parking:false,amenities:[],description:"",charges:"",
 representationChecked:false,mediaRightsChecked:false,availabilityChecked:false,updatedAt:now.toISOString()};
}
export function normalizeDrafts(raw:unknown):ListingDraft[]{
 if(!Array.isArray(raw))return [];
 const result:ListingDraft[]=[];
 for(const row of raw){
  if(!row||typeof row!=="object"||Array.isArray(row))continue;
  const v=row as Record<string,unknown>;
  if(typeof v.id!=="string"||!validDraftId(v.id)||result.some(x=>x.id===v.id))continue;
  if(typeof v.updatedAt!=="string"||!Number.isFinite(Date.parse(v.updatedAt)))continue;
  const amenities:Array<DraftAmenity>=Array.isArray(v.amenities)?
   Array.from(new Set(v.amenities.filter((x):x is DraftAmenity=>typeof x==="string"&&DRAFT_AMENITIES.includes(x as DraftAmenity)))).slice(0,10):[];
  result.push({
   id:v.id,title:text(v.title,120),area:text(v.area,100),county:text(v.county,70),
   type:v.type==="sale"?"sale":"rent",
   kind:DRAFT_KINDS.includes(v.kind as DraftKind)?v.kind as DraftKind:"Apartment",
   priceKes:whole(v.priceKes,0,1000000000000,0),
   beds:whole(v.beds,0,30,0),baths:whole(v.baths,1,30,1),
   sizeSqm:whole(v.sizeSqm,0,100000,0),
   furnished:v.furnished===true,parking:v.parking===true,amenities,
   description:text(v.description,1600),charges:text(v.charges,500),
   representationChecked:v.representationChecked===true,
   mediaRightsChecked:v.mediaRightsChecked===true,
   availabilityChecked:v.availabilityChecked===true,
   updatedAt:v.updatedAt
  });
  if(result.length===20)break;
 }
 return result;
}
export type ReadinessCheck={key:string;label:string;done:boolean;explanation:string};
export function evaluateDraft(draft:ListingDraft):{score:number;checks:ReadinessCheck[]}{
 const checks:ReadinessCheck[]=[
  {key:"title",label:"Descriptive headline",done:draft.title.length>=8,explanation:"Clear, truthful public property name"},
  {key:"area",label:"General location",done:draft.area.length>=3&&draft.county.length>=2,explanation:"Do not expose exact occupied-home addresses"},
  {key:"price",label:"Advertised price",done:draft.priceKes>0,explanation:"Confirm price, currency and billing period"},
  {key:"space",label:"Unit specifications",done:draft.sizeSqm>=10&&draft.baths>=1,explanation:"Floor area and rooms must be checked"},
  {key:"story",label:"Detailed description",done:draft.description.length>=80,explanation:"Disclose real attributes; avoid resident details"},
  {key:"features",label:"Key amenities",done:draft.amenities.length>=2,explanation:"Confirm advertised features are available"},
  {key:"charges",label:"Charges disclosed",done:draft.charges.length>=15,explanation:"Rent, deposit, service, utilities or exclusions"},
  {key:"representation",label:"Representation review",done:draft.representationChecked,explanation:"Your checkbox is not independent authorization"},
  {key:"media",label:"Media-rights preparation",done:draft.mediaRightsChecked,explanation:"No approved property photos are uploaded here"},
  {key:"availability",label:"Availability review",done:draft.availabilityChecked,explanation:"An expiring lease does not imply vacant inventory"}
 ];
 return {score:Math.round(checks.filter(x=>x.done).length/checks.length*100),checks};
}
/** Export remains incomplete/unsigned and cannot be accepted by the public publisher endpoint. */
export function exportLocalDraft(draft:ListingDraft,now=new Date()):string{
 const sanitized=normalizeDrafts([draft])[0];
 if(!sanitized)throw new Error("Invalid local draft");
 const visible=[sanitized.title,sanitized.area,sanitized.county,sanitized.description,sanitized.charges].join(" ");
 if(/(?:[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i.test(visible)||
    /(?:\+?\d[\d ().-]{8,}\d)/.test(visible))
  throw new Error("Remove email addresses and phone numbers from public-facing text before export");
 return JSON.stringify({
  format:"khanhomes-discover-local-draft",schemaVersion:1,draftOnly:true,
  published:false,approved:false,
  generatedAt:now.toISOString(),
  notice:"LOCAL PREPARATION ONLY. This file is not an approved listing or publishing authorization.",
  draft:sanitized
 },null,2)+"\n";
}
