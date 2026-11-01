/**
 * Tentative, user-planned calendar entries, never confirmed agent bookings.
 * All times are formatted explicitly in Africa/Nairobi local civil time.
 */
export type TentativeVisit={id:string;listingId:string;day:string;time:string;note:string};
export const TENTATIVE_VISITS_KEY="kh-discover-tentative-visits-v1";
const DAY_RE=/^\d{4}-\d{2}-\d{2}$/;const TIME_RE=/^(?:[01]\d|2[0-3]):[0-5]\d$/;
export function normalizeTentativeVisits(raw:unknown):TentativeVisit[]{
 if(!Array.isArray(raw))return [];
 const result:TentativeVisit[]=[];
 for(const item of raw){
  if(!item||typeof item!=="object")continue;
  const x=item as Record<string,unknown>;
  if(typeof x.id!=="string"||!/^[A-Za-z0-9-]{8,80}$/.test(x.id)||
   typeof x.listingId!=="string"||!/^[A-Za-z0-9-]{3,90}$/.test(x.listingId)||
   typeof x.day!=="string"||!DAY_RE.test(x.day)||!realDate(x.day)||
   typeof x.time!=="string"||!TIME_RE.test(x.time))continue;
  const note=typeof x.note==="string"?x.note.slice(0,240):"";
  if(!result.some(v=>v.id===x.id))result.push({id:x.id,listingId:x.listingId,day:x.day,time:x.time,note});
  if(result.length===30)break;
 }
 return result;
}
function realDate(day:string):boolean{
 const d=new Date(day+"T00:00:00Z");
 return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===day;
}
const esc=(value:string)=>value.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
const stamp=(day:string,time:string)=>day.replaceAll("-","")+"T"+time.replace(":","")+"00";
function inOneHour(day:string,time:string):{day:string;time:string}{
 const start=Date.parse(day+"T"+time+":00+03:00");
 const end=new Date(start+3600000);const local=new Date(end.getTime()+3*3600000);
 return {day:local.toISOString().slice(0,10),time:local.toISOString().slice(11,16)};
}
export function buildTentativeIcs(visits:readonly TentativeVisit[],titles:ReadonlyMap<string,string>,now=new Date()):string{
 const valid=normalizeTentativeVisits(visits).filter(x=>titles.has(x.listingId));
 const generated=now.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//KhanHomes Discover//Personal Hunt Planner//EN",
  "CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:Personal viewing ideas (unconfirmed)",
  "BEGIN:VTIMEZONE","TZID:Africa/Nairobi","BEGIN:STANDARD","DTSTART:19700101T000000","TZOFFSETFROM:+0300","TZOFFSETTO:+0300","TZNAME:EAT","END:STANDARD","END:VTIMEZONE"];
 for(const visit of valid){
  const end=inOneHour(visit.day,visit.time);
  lines.push("BEGIN:VEVENT","UID:"+esc(visit.id)+"@khanhomes-discover.local",
   "DTSTAMP:"+generated,
   "DTSTART;TZID=Africa/Nairobi:"+stamp(visit.day,visit.time),
   "DTEND;TZID=Africa/Nairobi:"+stamp(end.day,end.time),
   "SUMMARY:"+esc("Tentative visit idea: "+titles.get(visit.listingId)),
   "DESCRIPTION:"+esc("PERSONAL REMINDER ONLY. Not booked or confirmed by any agent. Independently arrange a viewing. "+visit.note),
   "STATUS:TENTATIVE","TRANSP:TRANSPARENT","END:VEVENT");
 }
 return lines.join("\r\n")+"\r\n";
}
export function hasVisitClash(a:TentativeVisit,b:TentativeVisit):boolean{
 if(a.id===b.id)return false;
 const x=Date.parse(a.day+"T"+a.time+":00+03:00");
 const y=Date.parse(b.day+"T"+b.time+":00+03:00");
 return Math.abs(x-y)<3600000;
}
