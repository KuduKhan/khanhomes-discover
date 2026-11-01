import Link from "next/link";
export function KhanHomesEmblem({className=""}:{className?:string}){
  return <svg aria-hidden="true" focusable="false" className={"kh-emblem "+className}
    viewBox="0 0 48 48" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.5 22.5 23.1 8.8a1.5 1.5 0 0 1 1.9 0L41.5 22.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.8 21.9V38a2 2 0 0 0 2 2h20.4a2 2 0 0 0 2-2V21.9" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.5 40V28.6a1.6 1.6 0 0 1 1.6-1.6h4a1.6 1.6 0 0 1 1.6 1.6V40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M31.8 12.4V8.5h5.5v9.1" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
export function Brand({href="/",withDiscover=true}:{href?:string;withDiscover?:boolean}){
 return <Link className="brand" href={href} aria-label="KhanHomes Discover home">
  <span className="brand-mark"><KhanHomesEmblem/></span>
  <span className="brand-words">Khan<span>Homes</span>{withDiscover&&<small>DISCOVER</small>}</span>
 </Link>;
}
