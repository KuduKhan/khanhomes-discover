import Image from "next/image";
import Link from "next/link";
export function KhanHomesEmblem({className=""}:{className?:string}){
 return <Image src="/brand/khanhomes-mark.svg" alt="" aria-hidden="true" className={"kh-emblem "+className} width={30} height={30} unoptimized/>;
}
export function Brand({href="/",withDiscover=true}:{href?:string;withDiscover?:boolean}){
 return <Link className="brand kh-brand-upgraded" href={href} aria-label="KhanHomes Discover home"><span className="brand-mark"><KhanHomesEmblem/></span><span className="brand-words">Khan<span>Homes</span>{withDiscover&&<small>DISCOVER</small>}</span></Link>;
}
