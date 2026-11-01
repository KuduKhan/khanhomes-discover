import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export function GET(){
 return NextResponse.json({application:"KhanHomes Discovery",status:"ok",version:"0.1.0"},{headers:{"Cache-Control":"no-store"}});
}
