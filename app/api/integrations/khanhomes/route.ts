import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {discoveryBackendConfigured,discoveryClient} from "@/lib/public-catalog";
import {publishEventSchema,validatePublishedMedia,verifyPublicationSignature} from "@/lib/integration";

export const runtime="nodejs";
export const dynamic="force-dynamic";
function failure(message:string,status:number){
 return NextResponse.json({error:message},{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
/** Server-to-server publication. Do not use this API from browsers or public form submissions. */
export async function POST(request:NextRequest){
 const secret=process.env.KHANHOMES_DISCOVERY_WEBHOOK_SECRET;
 if(!secret||secret.length<32||!discoveryBackendConfigured())return failure("Publishing is not configured",503);
 const declared=Number(request.headers.get("content-length")??0);
 if(declared>32000)return failure("Payload too large",413);
 let raw:string;
 try{raw=await request.text();}catch{return failure("Invalid payload",400);}
 if(Buffer.byteLength(raw,"utf8")>32000)return failure("Payload too large",413);
 const timestamp=request.headers.get("x-kh-timestamp");
 const eventId=request.headers.get("x-kh-event-id");
 const signature=request.headers.get("x-kh-signature");
 if(!verifyPublicationSignature({secret,timestamp,eventId,signature,body:raw}))return failure("Invalid publisher signature",401);
 let parsed:unknown;
 try{parsed=JSON.parse(raw);}catch{return failure("Malformed JSON",400);}
 const result=publishEventSchema.safeParse(parsed);
 if(!result.success)return failure("Invalid or disallowed public listing fields",422);
 const event=result.data;
 const allowed=(process.env.DISCOVERY_ALLOWED_MEDIA_HOSTS??"").split(",").map(x=>x.trim()).filter(Boolean);
 if(!allowed.length||!validatePublishedMedia(event.listing.images,allowed))return failure("Unapproved public media origin",422);
 const eventKey=eventId??randomUUID();
 const {data,error}=await discoveryClient().rpc("ingest_discovery_publication",{
  p_event_id:eventKey,p_event_type:event.event,p_listing:event.listing
 });
 if(error){
  console.error("Discovery publication rejected by database",{code:error.code});
  return failure("Publication could not be applied",503);
 }
 return NextResponse.json({ok:true,result:data??"accepted"},{headers:{"Cache-Control":"no-store"}});
}
