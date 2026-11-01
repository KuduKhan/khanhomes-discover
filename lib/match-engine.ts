import type {Listing,ListingType} from "./catalog";

/** Pure, explainable preference ranking. Scores are NOT availability or approval probabilities. */
export type MatchWeights={location:number;budget:number;space:number;features:number};
export type MatchPreferences={
 type:ListingType;county:string;maxPriceKes:number|null;minBeds:number;minSqm:number;
 parking:boolean;furnished:boolean;amenities:string[];weights:MatchWeights;
};
export const MATCH_STORAGE_KEY="kh-discover-aura-match-v1";
export const DEFAULT_MATCH_PREFERENCES:MatchPreferences={
 type:"rent",county:"Any county",maxPriceKes:null,minBeds:0,minSqm:0,parking:false,
 furnished:false,amenities:[],weights:{location:4,budget:5,space:3,features:3}
};
const ratio=(x:number)=>Math.max(0,Math.min(1,x));
const whole=(x:unknown,min:number,max:number,def:number):number=>
 typeof x==="number"&&Number.isInteger(x)&&x>=min&&x<=max?x:def;
const safeAmount=(x:unknown):number|null=>
 typeof x==="number"&&Number.isSafeInteger(x)&&x>=1&&x<=1000000000000?x:null;
export function normalizeMatchPreferences(raw:unknown,knownCounties:readonly string[]):MatchPreferences{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return {...DEFAULT_MATCH_PREFERENCES,amenities:[],weights:{...DEFAULT_MATCH_PREFERENCES.weights}};
 const v=raw as Record<string,unknown>;
 const weights=v.weights&&typeof v.weights==="object"&&!Array.isArray(v.weights)?v.weights as Record<string,unknown>:{};
 const counties=new Set(knownCounties);
 const amenities=Array.isArray(v.amenities)?Array.from(new Set(v.amenities.filter(
  (x):x is string=>typeof x==="string"&&x.length>=2&&x.length<=40
 ))).slice(0,12):[];
 return {
  type:v.type==="sale"?"sale":"rent",
  county:typeof v.county==="string"&&counties.has(v.county)?v.county:"Any county",
  maxPriceKes:safeAmount(v.maxPriceKes),
  minBeds:whole(v.minBeds,0,30,0),minSqm:whole(v.minSqm,0,100000,0),
  parking:v.parking===true,furnished:v.furnished===true,amenities,
  weights:{
   location:whole(weights.location,1,5,4),
   budget:whole(weights.budget,1,5,5),
   space:whole(weights.space,1,5,3),
   features:whole(weights.features,1,5,3)
  }
 };
}
export type MatchFactor={key:keyof MatchWeights;label:string;score:number;weight:number;explanation:string};
export type HomeMatch={home:Listing;score:number;factors:MatchFactor[];highlights:string[];tradeoffs:string[]};
function matchesFeature(home:Listing,feature:string):boolean{
 return home.amenities.some(x=>x.toLowerCase()===feature.toLowerCase())||
  feature==="Parking"&&home.parking||feature==="Furnished"&&home.furnished;
}
export function rankHomeMatches(listings:readonly Listing[],preferences:MatchPreferences):HomeMatch[]{
 const {type,county,maxPriceKes,minBeds,minSqm,parking,furnished,amenities,weights}=preferences;
 return listings.filter(x=>x.type===type&&x.availability!=="reserved").map(home=>{
  const highlights:string[]=[],tradeoffs:string[]=[];
  const matchedCounty=county==="Any county"||county===home.county;
  const locationScore=county==="Any county"?1:matchedCounty?1:.28;
  if(county!=="Any county")(matchedCounty?highlights:tradeoffs).push(matchedCounty?"Preferred county":"Outside preferred county");
  const budgetScore=maxPriceKes===null?1:home.priceKes<=maxPriceKes?
   ratio(1-.18*home.priceKes/maxPriceKes):
   ratio(1-1.25*(home.priceKes-maxPriceKes)/maxPriceKes);
  if(maxPriceKes!==null){
   if(home.priceKes<=maxPriceKes)highlights.push("Within stated budget");
   else tradeoffs.push("Above stated budget");
  }
  const bedScore=minBeds===0?1:ratio(home.beds/minBeds);
  const sizeScore=minSqm===0?1:ratio(home.sizeSqm/minSqm);
  const spaceScore=(bedScore+sizeScore)/2;
  if(minBeds>0)(home.beds>=minBeds?highlights:tradeoffs).push(home.beds>=minBeds?"Bedroom need met":"Fewer bedrooms than requested");
  if(minSqm>0)(home.sizeSqm>=minSqm?highlights:tradeoffs).push(home.sizeSqm>=minSqm?"Floor area met":"Smaller than preferred");
  const wishList=Array.from(new Set([...amenities,...(parking?["Parking"]:[]),...(furnished?["Furnished"]:[])]));
  const matched=wishList.filter(x=>matchesFeature(home,x));
  const featuresScore=wishList.length?matched.length/wishList.length:1;
  if(wishList.length){
   if(matched.length)highlights.push(matched.length+" of "+wishList.length+" requested features");
   if(matched.length<wishList.length)tradeoffs.push("Missing "+wishList.filter(x=>!matchesFeature(home,x)).join(", "));
  }
  const factors:MatchFactor[]=[
   {key:"location",label:"Location",score:Math.round(locationScore*100),weight:weights.location,
    explanation:county==="Any county"?"No county preference":matchedCounty?"Preferred county":"A different county"},
   {key:"budget",label:"Budget",score:Math.round(budgetScore*100),weight:weights.budget,
    explanation:maxPriceKes===null?"No budget selected":home.priceKes<=maxPriceKes?"Within your maximum":"Above your maximum"},
   {key:"space",label:"Space",score:Math.round(spaceScore*100),weight:weights.space,
    explanation:minBeds===0&&minSqm===0?"No size constraints":(home.beds>=minBeds&&home.sizeSqm>=minSqm)?"Space preferences met":"Some space preferences unmet"},
   {key:"features",label:"Features",score:Math.round(featuresScore*100),weight:weights.features,
    explanation:wishList.length===0?"No features requested":matched.length+" of "+wishList.length+" found"}
  ];
  const total=weights.location+weights.budget+weights.space+weights.features;
  const score=Math.round(factors.reduce((sum,x)=>sum+x.score*x.weight,0)/total);
  return {home,score,factors,highlights,tradeoffs};
 }).sort((a,b)=>b.score-a.score||a.home.priceKes-b.home.priceKes||a.home.slug.localeCompare(b.home.slug));
}
