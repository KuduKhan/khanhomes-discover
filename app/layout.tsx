import type {Metadata} from "next";
import Script from "next/script";
import "./globals.css";
export const metadata:Metadata={
 title:{default:"KhanHomes Discovery — Find a place to belong",template:"%s | KhanHomes Discovery"},
 description:"An elegantly connected way to discover rental homes and explore real-estate opportunities. Preview properties are illustrative, not live offers.",
 applicationName:"KhanHomes Discovery",
 icons:{icon:"/favicon.svg"},
 openGraph:{title:"KhanHomes Discovery",description:"Find your place. Feel at home. An independent experience connected to KhanHomes.",type:"website"}
};
// Appearance is personal to this origin, not shared auth with KhanHomes operations.
const appearanceBootstrap=`(function(){try{var v=JSON.parse(localStorage.getItem("kh-discovery-style")||"{}");var r=document.documentElement;r.dataset.atmosphere=["aurora","daybreak","midnight"].includes(v.atmosphere)?v.atmosphere:"aurora";r.dataset.theme=v.theme==="dark"?"dark":"light";}catch(_){document.documentElement.dataset.atmosphere="aurora";}})();`;
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" suppressHydrationWarning><body><Script id="kh-discovery-appearance" strategy="beforeInteractive">{appearanceBootstrap}</Script>{children}</body></html>;
}
