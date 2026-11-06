import {NextResponse} from "next/server";
import packageJson from "../../../package.json";
export const dynamic="force-dynamic";
export function GET(){return NextResponse.json({application:"KhanHomes Discover",status:"ok",version:packageJson.version},{headers:{"Cache-Control":"no-store"}});}
