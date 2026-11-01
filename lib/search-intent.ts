import {DEFAULT_FILTERS,type Filters} from "./filters";
/**
 * Transparent, deterministic natural-language filter extraction.
 * This is rule-based parsing, not an AI agent and never invents property data.
 */
const COUNTIES=["Nairobi","Mombasa","Kisumu","Kiambu","Nakuru","Machakos","Kajiado"];
const TERMS=["parking","balcony","garden","security","gym","lift","furnished","pet friendly","internet"] as const;
const AMENITY:Record<string,string>={parking:"Parking",balcony:"Balcony",garden:"Garden",security:"Security",gym:"Gym",lift:"Lift","pet friendly":"Pet friendly",internet:"Internet ready"};
function expandAmount(raw:string,suffix:string|undefined):number{
 const n=Number(raw.replaceAll(",",""));
 return Math.round(n*(suffix?.toLowerCase()==="m"?1000000:suffix?.toLowerCase()==="k"?1000:1));
}
export function interpretHomeQuery(input:string,previous:Filters=DEFAULT_FILTERS):{filters:Filters;interpreted:string[]}{
 let search=input.trim().slice(0,180);
 const f:Filters={...previous,amenities:[...previous.amenities]};
 const interpreted:string[]=[];
 const county=COUNTIES.find(c=>new RegExp("\\b"+c+"\\b","i").test(search));
 if(county){f.county=county;interpreted.push(county);search=search.replace(new RegExp("\\b"+county+"\\b","ig")," ");}
 const beds=search.match(/\b([0-9]|1[0-9])\s*(?:bedrooms?|beds?|br|bhk)\b/i);
 if(beds){f.minBeds=Number(beds[1]);interpreted.push(f.minBeds+"+ bedrooms");search=search.replace(beds[0]," ");}
 if(/\b(?:studio|bedsitter)\b/i.test(search)){f.kind="Studio";interpreted.push("Studio");search=search.replace(/\b(?:studio|bedsitter)\b/ig," ");}
 const budget=search.match(/\b(?:under|below|up\s*to|max(?:imum)?|budget(?: of)?)\s*(?:kes\s*|kshs?\s*)?([0-9][0-9,]*(?:\.\d+)?)\s*([km])?\b/i);
 if(budget){
  const amount=expandAmount(budget[1],budget[2]);
  if(amount>0&&amount<=1000000000000){
   f.maxPrice=amount;interpreted.push("Up to KES "+amount.toLocaleString("en-KE"));search=search.replace(budget[0]," ");
  }
 }
 if(/\b(?:for sale|buy|buying|purchase)\b/i.test(search)){f.type="sale";interpreted.push("For sale");search=search.replace(/\b(?:for sale|buy|buying|purchase)\b/ig," ");}
 else if(/\b(?:rent|rental|to let)\b/i.test(search)){f.type="rent";interpreted.push("For rent");search=search.replace(/\b(?:rent|rental|to let)\b/ig," ");}
 for(const term of TERMS){
  if(new RegExp("\\b"+term+"\\b","i").test(search)){
   if(term==="furnished"){f.furnished=true;interpreted.push("Furnished");}
   else if(term==="parking"){f.parking=true;interpreted.push("Parking");}
   else {const a=AMENITY[term];if(a&&!f.amenities.includes(a)){f.amenities.push(a);interpreted.push(a);}}
   search=search.replace(new RegExp("\\b"+term+"\\b","ig")," ");
  }
 }
 f.query=search.replace(/\b(?:find|me|a|an|home|house|apartment|property|in|with|and|near|please|want|looking|for)\b/gi," ").replace(/\s+/g," ").trim();
 return {filters:f,interpreted};
}
