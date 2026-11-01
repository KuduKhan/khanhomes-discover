import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {getPublicCatalog} from "@/lib/public-catalog";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
import {SearchWatchboard} from "@/components/search-watchboard";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Saved Search Watch",description:"Manually compare your locally saved searches with the current KhanHomes Discover catalog."};
export default async function WatchPage(){
 const catalog=await getPublicCatalog();
 return <div className="discovery-site"><a className="skip-link" href="#main">Skip to content</a><SiteHeader/><main id="main" className="wrap watch-page">
  <Link href="/#homes" className="planner-back"><ArrowLeft size={16}/> Back to Discover</Link>
  <SearchWatchboard listings={catalog.listings} mode={catalog.mode}/>
 </main><SiteFooter mode={catalog.mode}/></div>;
}
