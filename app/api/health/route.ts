import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export function GET(){
 return NextResponse.json({application:"KhanHomes Discover",status:"ok",version:"0.3.0"},{headers:{"Cache-Control":"no-store"}});
}
