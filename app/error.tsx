"use client";
import Link from "next/link";
import {AlertTriangle,ArrowRight,RotateCcw} from "lucide-react";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){
 return <div className="fallback-page"><AlertTriangle size={39}/><h1>Discovery is temporarily unavailable.</h1><p>Live listings are not being replaced with sample homes. Please retry later.</p><button type="button" onClick={reset}><RotateCcw size={16}/> Retry</button><Link href="/">Return home <ArrowRight size={17}/></Link></div>;
}
