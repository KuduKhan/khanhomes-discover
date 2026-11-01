import {NextRequest,NextResponse} from "next/server";
import {discoveryClient} from "@/lib/public-catalog";
import {listingReportSchema} from "@/lib/listing-report";
import {validSameOrigin} from "@/lib/seeker-request";
import {authenticatedSeeker,privateRequestsEnabled} from "@/lib/server-seeker-auth";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"};
const fail=(message:string,status:number)=>NextResponse.json({error:message},{status,headers});
export async function POST(request:NextRequest){
 if(!privateRequestsEnabled())return fail("Listing reports are not enabled",503);
 if(!validSameOrigin(request))return fail("Invalid origin",403);
 const seeker=await authenticatedSeeker(request);
 if(!seeker)return fail("A confirmed Discover account is required",401);
 if(Number(request.headers.get("content-length")??0)>2048)return fail("Report too large",413);
 let raw:unknown;
 try{
  const text=await request.text();
  if(Buffer.byteLength(text,"utf8")>2048)return fail("Report too large",413);
  raw=JSON.parse(text);
 }catch{return fail("Invalid JSON",400);}
 const parsed=listingReportSchema.safeParse(raw);
 if(!parsed.success)return fail("Invalid report details",422);
 const v=parsed.data;
 const {data,error}=await discoveryClient().rpc("submit_discover_listing_report",{
  p_report_id:v.reportId,p_user_id:seeker.id,p_listing_id:v.listingId,
  p_reason:v.reason,p_details:v.details
 });
 if(error)return fail("Unable to accept report",409);
 return NextResponse.json({ok:true,state:data},{status:202,headers});
}
