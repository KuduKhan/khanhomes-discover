import {NextResponse} from "next/server";
import {getPublicCatalog} from "@/lib/public-catalog";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  const catalog=await getPublicCatalog();
  return NextResponse.json({...catalog,notice:catalog.mode==="preview"?"Fictional editorial fixtures only. Not real offers or availability.":null},{
   headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}
  });
 }catch{
  return NextResponse.json({error:"Published catalog is temporarily unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}
