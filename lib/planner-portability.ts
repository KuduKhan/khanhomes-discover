import {safeAssessments,type HomeAssessment} from "./hunt-planner";

/** Validates a device-local export without trusting its content or modifying state. */
export function parsePlannerImport(raw:string,allowedListingIds:readonly string[]):HomeAssessment[]{
 if(raw.length>100_000)throw new Error("This file is too large for a home-hunt notebook.");
 let value:unknown;
 try{value=JSON.parse(raw);}catch{throw new Error("Choose a valid KhanHomes Discover JSON export.");}
 if(!value||typeof value!=="object")throw new Error("Invalid home-hunt export.");
 const doc=value as Record<string,unknown>;
 if(doc.product!=="KhanHomes Discover"||doc.exportType!=="user-entered-local-home-hunt-notes"||!Array.isArray(doc.assessments))
  throw new Error("This is not a KhanHomes Discover home-hunt export.");
 if(doc.assessments.length>40)throw new Error("The export contains too many homes.");
 const allowed=new Set(allowedListingIds);
 const imported=safeAssessments(doc.assessments);
 if(imported.length!==doc.assessments.length)throw new Error("The export contains invalid or duplicate entries.");
 const result=imported.filter(x=>allowed.has(x.listingId));
 if(result.length===0)throw new Error("None of the imported homes are available in this catalog.");
 return result;
}
/** Keep newer edits, rather than replacing newer notes with older backups. */
export function mergePlannerImport(existing:readonly HomeAssessment[],imported:readonly HomeAssessment[]):HomeAssessment[]{
 const next=new Map(existing.map(x=>[x.listingId,x]));
 for(const incoming of imported){
  const current=next.get(incoming.listingId);
  if(!current||Date.parse(incoming.updatedAt)>Date.parse(current.updatedAt))next.set(incoming.listingId,incoming);
 }
 return Array.from(next.values()).slice(0,40);
}
