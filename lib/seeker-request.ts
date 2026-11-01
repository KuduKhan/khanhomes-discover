import {z} from "zod";
import {discoveryClient,discoveryBackendConfigured} from "@/lib/public-catalog";
export const seekerRequestSchema=z.object({
 requestId:z.string().uuid(),
 listingId:z.string().uuid(),
 kind:z.enum(["viewing","enquiry"]),
 preferredAt:z.string().datetime({offset:true}).optional(),
 message:z.string().trim().min(20).max(500),
 consent:z.literal(true)
}).strict().superRefine((v,ctx)=>{
 if(v.kind==="viewing"&&!v.preferredAt)ctx.addIssue({code:"custom",message:"Preferred viewing time is required",path:["preferredAt"]});
 if(v.kind==="enquiry"&&v.preferredAt)ctx.addIssue({code:"custom",message:"Enquiry must not include an appointment",path:["preferredAt"]});
});
export type SeekerRequest=z.infer<typeof seekerRequestSchema>;
export function privateRequestsEnabled():boolean{
 return process.env.DISCOVER_ENABLE_PRIVATE_REQUESTS==="true"&&discoveryBackendConfigured();
}
export function validSameOrigin(request:Request):boolean{
 const origin=request.headers.get("origin");
 if(!origin)return false;
 try{
  const o=new URL(origin),r=new URL(request.url);
  return o.protocol==="https:"||o.hostname==="localhost"||o.hostname==="127.0.0.1"?
   o.origin===r.origin:false;
 }catch{return false;}
}
export async function authenticatedSeeker(request:Request):Promise<{id:string}|null>{
 const header=request.headers.get("authorization")??"";
 const bearer=header.match(/^Bearer ([A-Za-z0-9._~-]{40,4096})$/);
 if(!bearer||!privateRequestsEnabled())return null;
 try{
  const {data:{user},error}=await discoveryClient().auth.getUser(bearer[1]);
  if(error||!user?.id||!user.email_confirmed_at)return null;
  return {id:user.id};
 }catch{return null;}
}
export function requestDateIsValid(request:SeekerRequest,now=Date.now()):boolean{
 if(request.kind==="enquiry")return true;
 if(!request.preferredAt)return false;
 const time=Date.parse(request.preferredAt);
 return Number.isFinite(time) && time>=now+4*3600000&&time<=now+30*86400000;
}
