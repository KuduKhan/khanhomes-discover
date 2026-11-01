import {createHmac,timingSafeEqual} from "node:crypto";
import {z} from "zod";

export const publicListingSchema=z.object({
 sourceOrgId:z.string().uuid(),
 sourcePropertyId:z.string().uuid(),
 sourceUnitId:z.string().uuid(),
 sourceUpdatedAt:z.string().datetime({offset:true}),
 publicationApproved:z.literal(true),
 slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
 title:z.string().trim().min(5).max(120),
 area:z.string().trim().min(3).max(100),
 county:z.string().trim().min(2).max(70),
 kind:z.enum(["Apartment","Studio","Townhouse","Maisonette","Villa"]),
 type:z.enum(["rent","sale"]),
 priceKes:z.number().int().positive().max(1000000000000),
 beds:z.number().int().min(0).max(30),
 baths:z.number().int().min(1).max(30),
 sizeSqm:z.number().int().min(10).max(100000),
 furnished:z.boolean(),
 parking:z.boolean(),
 amenities:z.array(z.string().trim().min(2).max(40)).max(24),
 description:z.string().trim().min(30).max(1600),
 images:z.array(z.string().url().max(2048)).min(1).max(8),
 availability:z.enum(["available","reserved","unknown"]),
 verification:z.enum(["listing-reviewed","availability-confirmed"]),
 availabilityConfirmedAt:z.string().datetime({offset:true}).optional()
}).strict().superRefine((v,ctx)=>{
 if(v.verification==="availability-confirmed"){
  if(!v.availabilityConfirmedAt || Math.abs(Date.parse(v.sourceUpdatedAt)-Date.parse(v.availabilityConfirmedAt))>7*86400000)
   ctx.addIssue({code:"custom",message:"Availability verification needs recent, recorded confirmation",path:["availabilityConfirmedAt"]});
 }
});
export const publishEventSchema=z.object({
 version:z.literal(1),
 event:z.enum(["listing.published","listing.withdrawn"]),
 listing:publicListingSchema,
}).strict();
export type PublishEvent=z.infer<typeof publishEventSchema>;
export function signPublication(secret:string,timestamp:string,eventId:string,rawBody:string){
 return createHmac("sha256",secret).update(timestamp+"."+eventId+"."+rawBody).digest("hex");
}
export function verifyPublicationSignature(args:{
 secret:string;timestamp:string|null;eventId:string|null;signature:string|null;body:string;nowSeconds?:number;
}):boolean{
 const {secret,timestamp,eventId,body}=args;
 if(!secret||!timestamp||!eventId||!args.signature)return false;
 if(!/^\d{10}$/.test(timestamp)||!/^[0-9a-fA-F-]{36}$/.test(eventId))return false;
 const incoming=args.signature.match(/^sha256=([0-9a-f]{64})$/);
 if(!incoming)return false;
 const now=args.nowSeconds??Math.floor(Date.now()/1000);
 if(Math.abs(now-Number(timestamp))>300)return false;
 const expected=Buffer.from(signPublication(secret,timestamp,eventId,body),"hex");
 const supplied=Buffer.from(incoming[1],"hex");
 return supplied.length===expected.length&&timingSafeEqual(supplied,expected);
}
export function validatePublishedMedia(images:string[],allowedHosts:string[]):boolean{
 const allowed=new Set(allowedHosts.map(x=>x.trim().toLowerCase()).filter(Boolean));
 return images.every(raw=>{
  try{
   const u=new URL(raw);
   return u.protocol==="https:"&&!u.username&&!u.password&&allowed.has(u.hostname.toLowerCase())&&u.port==="";
  }catch{return false;}
 });
}
