import {NextRequest,NextResponse} from "next/server";
import {discoveryClient} from "@/lib/public-catalog";
import {authenticatedSeeker,privateRequestsEnabled,requestDateIsValid,seekerRequestSchema,validSameOrigin} from "@/lib/seeker-request";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const fail=(message:string,status:number)=>NextResponse.json({error:message},{status,headers});
/** Verified seeker requests only. Source managers must use a separate authorized review integration. */
export async function POST(request:NextRequest){
 if(!privateRequestsEnabled())return fail("Private requests are not enabled",503);
 if(!validSameOrigin(request))return fail("Invalid request origin",403);
 const seeker=await authenticatedSeeker(request);
 if(!seeker)return fail("A confirmed Discover account is required",401);
 if(Number(request.headers.get("content-length")??0)>4096)return fail("Request too large",413);
 let body:unknown;
 try{
  const raw=await request.text();
  if(Buffer.byteLength(raw,"utf8")>4096)return fail("Request too large",413);
  body=JSON.parse(raw);
 }catch{return fail("Invalid JSON",400);}
 const parsed=seekerRequestSchema.safeParse(body);
 if(!parsed.success||!parsed.data||!requestDateIsValid(parsed.data))return fail("Invalid request details or date",422);
 const v=parsed.data;
 const {data,error}=await discoveryClient().rpc("submit_discover_seeker_request",{
  p_request_id:v.requestId,p_seeker_id:seeker.id,p_listing_id:v.listingId,
  p_kind:v.kind,p_preferred_at:v.kind==="viewing"?v.preferredAt:null,p_message:v.message,p_consent:v.consent
 });
 if(error){
  // No private SQL messages, identities or request metadata returned to untrusted clients.
  return fail("Request was not accepted. Confirm the listing is available and try later.",409);
 }
 return NextResponse.json({ok:true,state:data},{status:202,headers});
}
export async function GET(request:NextRequest){
 if(!privateRequestsEnabled())return fail("Private requests are not enabled",503);
 const seeker=await authenticatedSeeker(request);
 if(!seeker)return fail("A confirmed Discover account is required",401);
 const {data,error}=await discoveryClient().from("discovery_seeker_requests")
  .select("id,kind,preferred_at,status,created_at,listing_id")
  .eq("seeker_id",seeker.id).order("created_at",{ascending:false}).limit(25);
 if(error)return fail("Requests are temporarily unavailable",503);
 return NextResponse.json({requests:data??[]},{headers});
}
