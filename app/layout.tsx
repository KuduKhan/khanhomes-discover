import type {Metadata} from "next";
import Script from "next/script";
import "./globals.css";
import "./discover-polish.css";
import "./journey-polish.css";
import "./planner-polish.css";
import "./guided-hunt-v06.css";
import "./listing-atelier-v07.css";
import "./finance-desk-v08.css";
import "./footer-compact-v081.css";
import "./khanhomes-brand-v1.css";
import "./family-design.css";
import "./header-refinement.css";
import "./trinity-header.css";
import "./existing-feature-excellence-v081.css";
import "./trinity-responsive-finish.css";
import "./trinity-handwriting.css";
import "./trinity-dashboard-audit.css";
export const metadata:Metadata={
 title:{default:"KhanHomes Discover — Find a place to belong",template:"%s | KhanHomes Discover"},
 description:"An elegantly connected way to discover rental homes and explore real-estate opportunities. Preview properties are illustrative, not live offers.",
 applicationName:"KhanHomes Discover",
 robots:{index:false,follow:false},
 icons:{icon:"/brand/khanhomes-mark.svg",apple:"/brand/khanhomes-mark.svg"},
 openGraph:{title:"KhanHomes Discover",description:"Find your place. Feel at home. An independent experience connected to KhanHomes.",type:"website"}
};
// Appearance is personal to this origin, not shared auth with KhanHomes operations.
const appearanceBootstrap=`(function(){try{var v=JSON.parse(localStorage.getItem("kh-discovery-style")||"{}");var r=document.documentElement;r.dataset.atmosphere=["aurora","daybreak","midnight"].includes(v.atmosphere)?v.atmosphere:"aurora";r.dataset.theme=v.theme==="dark"?"dark":v.theme==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}catch(_){document.documentElement.dataset.atmosphere="aurora";}})();`;
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" suppressHydrationWarning><body><Script id="kh-discovery-appearance" strategy="beforeInteractive">{appearanceBootstrap}</Script>{children}</body></html>;
}
