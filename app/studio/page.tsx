import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
import {ListingAtelier} from "@/components/listing-atelier";
import {getPublicCatalog} from "@/lib/public-catalog";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Listing Atelier — Private Draft Studio",description:"Prepare a private local property listing draft. This studio cannot publish or approve KhanHomes listings."};
export default async function StudioPage(){
 const catalog=await getPublicCatalog();
 return <div className="discovery-site"><a className="skip-link" href="#main">Skip to content</a><SiteHeader/><main id="main" className="wrap atelier-page">
  <Link href="/#homes" className="planner-back"><ArrowLeft size={16}/> Return to Discover</Link>
  <ListingAtelier/>
 </main><SiteFooter mode={catalog.mode}/></div>;
}
