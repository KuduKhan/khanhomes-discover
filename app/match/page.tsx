import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
import {MatchStudio} from "@/components/match-studio";
import {getPublicCatalog} from "@/lib/public-catalog";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"AURA Match Studio",description:"Transparent, preference-based home matching in KhanHomes Discover; never a guarantee of availability."};
export default async function MatchPage(){
 const catalog=await getPublicCatalog();
 return <div className="discovery-site"><a className="skip-link" href="#main">Skip to content</a><SiteHeader/>
  <main id="main" className="wrap match-page">
   <Link href="/#homes" className="planner-back"><ArrowLeft size={16}/> Back to Discover</Link>
   <MatchStudio listings={catalog.listings} mode={catalog.mode}/>
  </main><SiteFooter mode={catalog.mode}/></div>;
}
