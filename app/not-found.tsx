import Link from "next/link";
import {House,ArrowRight} from "lucide-react";
export default function NotFound(){return <div className="fallback-page"><House size={38}/><h1>We couldn’t find that home.</h1><p>The listing may no longer be published, or the address may have changed.</p><Link href="/">Back to discovery <ArrowRight size={17}/></Link></div>;}
