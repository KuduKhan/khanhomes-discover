import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
import {FinanceDesk} from "@/components/finance-desk";
import {getPublicCatalog} from "@/lib/public-catalog";
export const metadata:Metadata={title:"Finance Desk",description:"Transparent rent-versus-buy and mortgage payment scenarios in KES, based entirely on your assumptions."};
export const dynamic="force-dynamic";
export default async function FinancePage(){
 const catalog=await getPublicCatalog();
 return <div className="discovery-site"><a href="#main" className="skip-link">Skip to content</a><SiteHeader/>
 <main id="main" className="wrap finance-page"><Link href="/#homes" className="planner-back"><ArrowLeft size={16}/> Back to Discover</Link>
 <FinanceDesk mode={catalog.mode}/></main><SiteFooter mode={catalog.mode}/></div>;
}
