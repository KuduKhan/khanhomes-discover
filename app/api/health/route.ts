import {NextResponse} from "next/server";
import manifest from "@/package.json";
export const dynamic="force-dynamic";
export function GET(){
 return NextResponse.json({application:"KhanHomes Discover",status:"ok",version:manifest.version},{headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
