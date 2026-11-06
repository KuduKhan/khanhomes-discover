import {NextResponse} from "next/server";
import manifest from "@/package.json";

export const dynamic = "force-dynamic";

/** Deployment provenance uses package.json as the only application-version source. */
export function GET() {
  return NextResponse.json(
    {application:manifest.name,version:manifest.version,commit:process.env.VERCEL_GIT_COMMIT_SHA || null},
    {headers:{"Cache-Control":"no-store, max-age=0","X-Content-Type-Options":"nosniff"}}
  );
}
