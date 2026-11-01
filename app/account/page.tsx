import type {Metadata} from "next";
import Link from "next/link";
import {ArrowLeft,ShieldCheck} from "lucide-react";
import {SiteHeader,SiteFooter} from "@/components/site-chrome";
import {SeekerAccount} from "@/components/seeker-account";
import {getPublicCatalog} from "@/lib/public-catalog";
export const metadata:Metadata={title:"My account",description:"Independent KhanHomes Discover account and private request access."};
export const dynamic="force-dynamic";
export default async function AccountPage(){
 const catalog=await getPublicCatalog();
 return <div className="discovery-site"><a href="#main" className="skip-link">Skip to content</a><SiteHeader/>
  <main id="main" className="account-page">
   <div className="wrap account-layout">
    <div className="account-story">
     <Link className="account-back" href="/#homes"><ArrowLeft size={16}/> Explore homes</Link>
     <span className="section-kicker">KHANHOMES DISCOVER</span>
     <h1>Your home journey.<br/><em>Your space.</em></h1>
     <p>Save the places that matter, follow authorized enquiries and stay in control of your house-hunting experience. Your account is separate from KhanHomes operations.</p>
     <span className="account-story-trust"><ShieldCheck size={18}/> A privacy-first journey from discovery to home.</span>
    </div>
    <SeekerAccount/>
   </div>
  </main><SiteFooter mode={catalog.mode}/></div>;
}
