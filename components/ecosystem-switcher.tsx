import {Building2,Compass,HardHat} from "lucide-react";
import {productOrigins} from "@/lib/product-origins";
type Product="home"|"discover"|"build";
/** Product URLs are origins, never an authentication or cookie handoff. */
export function EcosystemSwitcher({active}:{active:Product}){
 const items=[
  {id:"home",label:"KhanHomes",href:productOrigins.home,Icon:Building2},
  {id:"discover",label:"Discover",href:productOrigins.discover,Icon:Compass},
  {id:"build",label:"Build",href:productOrigins.build,Icon:HardHat}
 ] as const;
 return <nav className="kh-family-strip" aria-label="KhanHomes product switcher">
  <div className="kh-family-strip-inner">
   <span className="kh-family-strip-label">KHANHOMES FAMILY</span>
   {items.map(({id,label,href,Icon})=><a key={id} href={href}
    className="kh-family-product" aria-current={active===id?"page":undefined}
    aria-label={id==="home"?"KhanHomes management":id==="discover"?"KhanHomes Discover":"KhanHomes Build"}>
    <Icon size={15} strokeWidth={1.8}/><span>{label}</span></a>)}
  </div>
 </nav>;
}
