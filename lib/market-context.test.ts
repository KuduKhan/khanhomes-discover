import {describe,it,expect} from "vitest";
import {catalogContext,countyCatalogStats} from "./market-context";
import {PREVIEW_LISTINGS} from "./catalog";
describe("transparent catalog price context",()=>{
 it("compares only peers of same county and transaction type, excluding subject",()=>{
  const base=PREVIEW_LISTINGS[0];
  const result=catalogContext(base,PREVIEW_LISTINGS);
  expect(result).not.toBeNull();
  expect(result!.count).toBe(2);
  expect(result!.medianKes).toBe(80000); // Kileleshwa 125k, Westlands 35k
  expect(result!.differencePct).toBe(-15);
 });
 it("avoids unsupported comparisons for tiny samples",()=>{
  expect(catalogContext(PREVIEW_LISTINGS[1],PREVIEW_LISTINGS)).toBeNull();
 });
 it("provides only catalog-derived county medians",()=>{
  const stats=countyCatalogStats(PREVIEW_LISTINGS,"rent");
  expect(stats.find(x=>x.county==="Mombasa")?.medianKes).toBe(38000);
  expect(stats.find(x=>x.county==="Nairobi")?.count).toBe(3);
 });
});
