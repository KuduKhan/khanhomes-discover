import {z} from "zod";
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
export function requestDateIsValid(request:SeekerRequest,now=Date.now()):boolean{
 if(request.kind==="enquiry")return true;
 if(!request.preferredAt)return false;
 const time=Date.parse(request.preferredAt);
 return Number.isFinite(time) && time>=now+4*3600000&&time<=now+30*86400000;
}
