/** A private, browser-local note-taking aid, NOT an inspection certification. */
export const HUNT_PLANNER_KEY="kh-discover-hunt-planner-v1";
export const HUNT_CHECKLIST=[
 {id:"water",question:"Water supply and pressure",hint:"Ask about reliability and verify taps."},
 {id:"power",question:"Electricity and backup",hint:"Ask about outages and backup costs."},
 {id:"security",question:"Safety and entry",hint:"Check doors, lighting and access."},
 {id:"noise",question:"Noise and surroundings",hint:"Visit during relevant hours."},
 {id:"ventilation",question:"Ventilation and natural light",hint:"Observe airflow and daylight."},
 {id:"condition",question:"Walls, floors and fixtures",hint:"Look for leaks, damage and repairs."},
 {id:"internet",question:"Internet availability",hint:"Verify provider coverage, not claims."},
 {id:"transport",question:"Transport and access",hint:"Check travel routes yourself."},
 {id:"charges",question:"All charges disclosed",hint:"Confirm rent, service, utilities and deposits."},
 {id:"documentation",question:"Representative and terms verified",hint:"Verify authorization independently."}
] as const;
export type CheckId=typeof HUNT_CHECKLIST[number]["id"];
export type HomeAssessment={
 listingId:string;notes:string;plannedFor:string;checklist:CheckId[];
 rating:number;updatedAt:string;
};
const validIds=new Set<string>(HUNT_CHECKLIST.map(x=>x.id));
export function safeAssessments(raw:unknown):HomeAssessment[]{
 if(!Array.isArray(raw))return [];
 const out:HomeAssessment[]=[];
 for(const item of raw){
  if(!item||typeof item!=="object")continue;
  const x=item as Record<string,unknown>;
  if(typeof x.listingId!=="string"||!/^[a-zA-Z0-9-]{3,90}$/.test(x.listingId))continue;
  if(out.some(y=>y.listingId===x.listingId))continue;
  const date=typeof x.plannedFor==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x.plannedFor)?x.plannedFor:"";
  const list=Array.isArray(x.checklist)?Array.from(new Set(x.checklist.filter(
    (v):v is CheckId=>typeof v==="string"&&validIds.has(v)))).slice(0,HUNT_CHECKLIST.length):[];
  const rating=typeof x.rating==="number"&&Number.isInteger(x.rating)?Math.max(0,Math.min(5,x.rating)):0;
  const notes=typeof x.notes==="string"?x.notes.slice(0,600):"";
  const updatedAt=typeof x.updatedAt==="string"&&Number.isFinite(Date.parse(x.updatedAt))?x.updatedAt:new Date(0).toISOString();
  out.push({listingId:x.listingId,plannedFor:date,notes,checklist:list,rating,updatedAt});
  if(out.length>=40)break;
 }
 return out;
}
export function initialAssessment(listingId:string):HomeAssessment{
 return {listingId,notes:"",plannedFor:"",checklist:[],rating:0,updatedAt:new Date(0).toISOString()};
}
export function assessmentCompletion(assessment:HomeAssessment):number{
 return Math.round(assessment.checklist.length/HUNT_CHECKLIST.length*100);
}
export function exportSafePlanner(assessments:readonly HomeAssessment[],allowedListingIds:readonly string[]):string{
 const allowed=new Set(allowedListingIds);
 return JSON.stringify({
  product:"KhanHomes Discover",
  exportType:"user-entered-local-home-hunt-notes",
  generatedAt:new Date().toISOString(),
  disclaimer:"User-entered impressions only. Not a property inspection or viewing confirmation.",
  assessments:assessments.filter(x=>allowed.has(x.listingId))
 },null,2);
}
