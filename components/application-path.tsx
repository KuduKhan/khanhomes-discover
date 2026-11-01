import {CheckCircle2,ClipboardList,FileText,LockKeyhole,ShieldCheck} from "lucide-react";
export function ApplicationPath(){
 return <section className="application-path" aria-label="Rental application and move-in roadmap">
  <div className="application-path-heading"><ClipboardList size={22}/><div><span className="section-kicker">FROM DISCOVERY TO HOME</span><h2>Your rental journey.</h2><p>Know what happens after an authorized viewing and approval.</p></div></div>
  <ol>
   <li><span><CheckCircle2 size={17}/></span><div><strong>Explore and shortlist</strong><p>Compare advertised attributes and ask for current availability.</p></div></li>
   <li><span><FileText size={17}/></span><div><strong>Apply privately</strong><p>Verified application review and document handling are being built. Never send ID or financial documents through a public listing.</p></div></li>
   <li><span><LockKeyhole size={17}/></span><div><strong>Review and move in</strong><p>Only an authorized KhanHomes manager can finalize a lease and activate the appropriate tenant experience.</p></div></li>
  </ol>
  <p className="application-safeguard"><ShieldCheck size={15}/> Secure applications and leases are not enabled from this public page.</p>
 </section>;
}
