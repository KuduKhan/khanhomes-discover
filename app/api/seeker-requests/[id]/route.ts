import {NextRequest,NextResponse} from "next/server";
import {authenticatedSeeker,privateRequestsEnabled,validSameOrigin} from "@/lib/seeker-request";
import {discoveryClient} from "@/lib/public-catalog";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
export async function DELETE(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!privateRequestsEnabled())return NextResponse.json({error:"Private requests are not enabled"},{status:503,headers});
 if(!validSameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403,headers});
 const seeker=await authenticatedSeeker(request);
 if(!seeker)return NextResponse.json({error:"Confirmed account required"},{status:401,headers});
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id))return NextResponse.json({error:"Invalid request ID"},{status:400,headers});
 const {data,error}=await discoveryClient().rpc("cancel_discover_seeker_request",{p_request_id:id,p_seeker_id:seeker.id});
 if(error)return NextResponse.json({error:"Unable to cancel request"},{status:409,headers});
 return NextResponse.json({state:data},{headers});
}
