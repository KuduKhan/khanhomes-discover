import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {getPublicCatalog} from "@/lib/public-catalog";
import {HuntPlannerBoard} from "@/components/hunt-planner-board";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
export const metadata:Metadata={
 title:"My home hunt planner",description:"Private, device-local home shortlist and visit assessment checklist in KhanHomes Discover."
};
export const dynamic="force-dynamic";
export default async function PlannerPage(){
 const catalog=await getPublicCatalog();
 return <div className="discovery-site"><a className="skip-link" href="#main">Skip to content</a><SiteHeader/>
  <main id="main" className="wrap planner-page">
   <Link href="/#homes" className="planner-back"><ArrowLeft size={16}/> Back to home search</Link>
   <h1 className="sr-only">My home hunt planner</h1>
   <HuntPlannerBoard mode={catalog.mode} listings={catalog.listings}/>
  </main><SiteFooter mode={catalog.mode}/></div>;
}
