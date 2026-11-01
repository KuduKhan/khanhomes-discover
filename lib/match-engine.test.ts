import {describe,it,expect} from "vitest";
import {PREVIEW_LISTINGS} from "./catalog";
import {DEFAULT_MATCH_PREFERENCES,normalizeMatchPreferences,rankHomeMatches} from "./match-engine";
const counties=["Nairobi","Mombasa","Kisumu"];
describe("AURA transparent ranking",()=>{
 it("never invents listings and excludes reserved inventory",()=>{
  const result=rankHomeMatches(PREVIEW_LISTINGS,DEFAULT_MATCH_PREFERENCES);
  expect(result.every(x=>PREVIEW_LISTINGS.some(y=>x.home.id===y.id))).toBe(true);
  expect(result.every(x=>x.home.type==="rent")).toBe(true);
  const reserved={...PREVIEW_LISTINGS[0],availability:"reserved" as const};
  expect(rankHomeMatches([reserved],DEFAULT_MATCH_PREFERENCES)).toHaveLength(0);
 });
 it("ranks preferred city and budget without calling the match score verification",()=>{
  const matches=rankHomeMatches(PREVIEW_LISTINGS,{
   ...DEFAULT_MATCH_PREFERENCES,county:"Mombasa",maxPriceKes:50000,minBeds:2,
   parking:true,amenities:["Security"],weights:{location:5,budget:5,space:5,features:5}
  });
  expect(matches[0].home.slug).toBe("coastline-lofts-nyali");
  expect(matches[0].score).toBeGreaterThan(matches[1].score);
  expect(matches[0].highlights).toContain("Preferred county");
  expect(matches.some(x=>x.tradeoffs.includes("Above stated budget"))).toBe(true);
 });
 it("has predictable ordering and bounded factors",()=>{
  const list=rankHomeMatches(PREVIEW_LISTINGS,DEFAULT_MATCH_PREFERENCES);
  expect(list.every(x=>x.score>=0&&x.score<=100)).toBe(true);
  expect(list.every(x=>x.factors.length===4&&x.factors.every(f=>f.score>=0&&f.score<=100))).toBe(true);
  expect(list.map(x=>x.score)).toEqual([...list.map(x=>x.score)].sort((a,b)=>b-a));
 });
 it("sanitizes untrusted saved local preferences",()=>{
  const p=normalizeMatchPreferences({type:"sale",county:"fake",weights:{budget:999,space:-1},minBeds:500,amenities:["Gym","Gym",17],maxPriceKes:1e15},counties);
  expect(p.type).toBe("sale");expect(p.county).toBe("Any county");expect(p.minBeds).toBe(0);
  expect(p.amenities).toEqual(["Gym"]);expect(p.maxPriceKes).toBeNull();
  expect(p.weights.budget).toBe(5);expect(p.weights.space).toBe(3);
 });
 it("applies user-defined priority weights",()=>{
  const p={...DEFAULT_MATCH_PREFERENCES,county:"Mombasa",weights:{location:5,budget:1,space:1,features:1}};
  const result=rankHomeMatches(PREVIEW_LISTINGS,p);
  expect(result[0].home.county).toBe("Mombasa");
 });
});
