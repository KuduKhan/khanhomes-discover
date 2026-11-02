"use client";
import Link from "next/link";
import {ArrowUpRight} from "lucide-react";
import {Brand} from "@/components/brand";
import {TrinityHeader} from "@/components/trinity-header";
import {productOrigins} from "@/lib/product-origins";
const parentUrl=productOrigins.home;
const buildUrl=productOrigins.build;
export function SiteHeader(){return <TrinityHeader product="discover"/>;}
export function SiteFooter({mode}:{mode:"preview"|"live"}){
 return <footer className="site-footer">
  <div className="wrap footer-grid">
   <div className="footer-identity">
    <Brand/>
    <p>Find your place. Feel at home. A refined house-hunting experience connected to KhanHomes.</p>
    <span className="footer-trust">{mode==="preview"?"Preview catalog · Fictional homes and indicative prices":"Published listing catalog · Check details before decisions"}</span>
   </div>
   <nav aria-label="Discover links" className="footer-links"><strong>Explore</strong><Link href="/#homes">Search homes</Link><Link href="/match">AURA Match</Link><Link href="/watch">Search watch</Link><Link href="/visits">Visit plans</Link><Link href="/planner">Home notebook</Link><Link href="/studio">Listing Atelier</Link><Link href="/finance">Finance Desk</Link><Link href="/#connection">Connected living</Link><Link href="/account">My Discover account</Link></nav>
   <nav aria-label="KhanHomes links" className="footer-links"><strong>Connected to</strong><a href={parentUrl}>KhanHomes management <ArrowUpRight size={14}/></a><a href={parentUrl+"/ecosystem"}>All KhanHomes products <ArrowUpRight size={14}/></a><a href={buildUrl}>KhanHomes Build <ArrowUpRight size={14}/></a><Link href="/api/health">System status</Link><a href="https://github.com/KuduKhan/khanhomes-discover" target="_blank" rel="noopener noreferrer">Project source <ArrowUpRight size={14}/></a></nav>
  </div>
  <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} KhanHomes Discover</span><span>Part of the KhanHomes ecosystem · No payment collection or unapproved listings</span></div>
 </footer>;
}
