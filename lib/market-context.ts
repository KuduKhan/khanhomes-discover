import type {Listing} from "./catalog";
/** A tiny on-page catalog sample is not a real estate valuation or a market statistic. */
export type CatalogContext={count:number;medianKes:number;lowestKes:number;highestKes:number;differencePct:number|null};
export function catalogContext(home:Listing,listings:readonly Listing[]):CatalogContext|null{
 const peers=listings.filter(x=>x.county===home.county&&x.type===home.type&&x.id!==home.id&&x.priceKes>0);
 if(peers.length<2)return null; // Insufficient independent sample, avoid pseudo-precision.
 const prices=peers.map(x=>x.priceKes).sort((a,b)=>a-b);
 const mid=Math.floor(prices.length/2);
 const median=prices.length%2===1?prices[mid]:(prices[mid-1]+prices[mid])/2;
 return {count:prices.length,medianKes:median,lowestKes:prices[0],highestKes:prices.at(-1)??prices[0],
  differencePct:Math.round((home.priceKes-median)/median*100)};
}
export function countyCatalogStats(listings:readonly Listing[],type:"rent"|"sale"){
 return [...new Set(listings.map(x=>x.county))].map(county=>{
  const homes=listings.filter(x=>x.county===county&&x.type===type);
  const prices=homes.map(x=>x.priceKes).sort((a,b)=>a-b);
  const i=Math.floor(prices.length/2);
  return {county,count:homes.length,medianKes:prices.length?prices.length%2?prices[i]:(prices[i-1]+prices[i])/2:0};
 }).filter(x=>x.count>0).sort((a,b)=>b.count-a.count||a.county.localeCompare(b.county));
}
