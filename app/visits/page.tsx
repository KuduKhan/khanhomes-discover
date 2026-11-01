import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {getPublicCatalog} from "@/lib/public-catalog";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
import {VisitPlanner} from "@/components/visit-planner";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Tentative Visit Planner",description:"Plan prospective home visits privately; calendar ideas are not confirmed viewings."};
export default async function VisitsPage(){
 const catalog=await getPublicCatalog();
 return <div className="discovery-site"><a className="skip-link" href="#main">Skip to content</a><SiteHeader/><main id="main" className="wrap visit-page">
  <Link href="/#homes" className="planner-back"><ArrowLeft size={16}/> Back to Discover</Link>
  <VisitPlanner listings={catalog.listings} mode={catalog.mode}/>
 </main><SiteFooter mode={catalog.mode}/></div>;
}
