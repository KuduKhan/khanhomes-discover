import {BarChart3,Info,ShieldCheck} from "lucide-react";
import {catalogContext} from "@/lib/market-context";
import {formatKes,type Listing} from "@/lib/catalog";
export function CatalogPriceContext({home,listings}:{home:Listing;listings:readonly Listing[]}){
 const context=catalogContext(home,listings);
 return <section className="catalog-context" aria-label="Transparent price comparison of catalog properties">
  <div className="catalog-context-heading"><BarChart3 size={21}/><div><span className="section-kicker">PRICE CONTEXT · CURRENT CATALOG ONLY</span><h2>Explore with perspective.</h2></div></div>
  {!context?<p className="catalog-context-unavailable"><Info size={17}/> Too few comparable listings in this county and category for a meaningful catalog-only comparison.</p>:<>
   <div className="catalog-context-kpis">
    <div><small>Comparable catalog homes</small><strong>{context.count}</strong></div>
    <div><small>Median advertised price</small><strong>{formatKes(context.medianKes)}</strong></div>
    <div><small>This home versus peer median</small><strong>{context.differencePct===0?"Same":Math.abs(context.differencePct??0)+"% "+((context.differencePct??0)>0?"higher":"lower")}</strong></div>
   </div>
   <p>Comparison uses {context.count} other currently visible {home.type==="rent"?"rentals":"for-sale homes"} in {home.county}. It does not adjust for floor area, quality, location or contractual terms.</p>
  </>}
  <p className="catalog-context-disclaimer"><ShieldCheck size={16}/>{home.source==="demo"?"All compared prices are fictional illustrations.":"This is not a market valuation, rent index, appraisal or confirmed fair price."} Never treat catalog samples as official market data.</p>
 </section>;
}
