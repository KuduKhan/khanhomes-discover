import {describe,expect,it} from "vitest";
import {DEFAULT_FILTERS,filterListings} from "./filters";
import {PREVIEW_LISTINGS} from "./catalog";
describe("public discovery filtering",()=>{
 it("does not mix rentals and sales",()=>{
  const found=filterListings(PREVIEW_LISTINGS,DEFAULT_FILTERS);
  expect(found.length).toBeGreaterThan(0);
  expect(found.every(item=>item.type==="rent")).toBe(true);
 });
 it("filters combined county budget and amenities",()=>{
  const found=filterListings(PREVIEW_LISTINGS,{...DEFAULT_FILTERS,county:"Mombasa",maxPrice:50000,parking:true});
  expect(found.length).toBeGreaterThan(0);
  expect(found.every(item=>item.county==="Mombasa"&&item.priceKes<=50000&&item.parking)).toBe(true);
 });
 it("honors studio bedrooms as zero",()=>{
  expect(filterListings(PREVIEW_LISTINGS,{...DEFAULT_FILTERS,query:"Luma Studios",minBeds:1})).toHaveLength(0);
 });
 it("sorts by increasing price without changing input",()=>{
  const original=PREVIEW_LISTINGS.map(x=>x.id);
  const found=filterListings(PREVIEW_LISTINGS,{...DEFAULT_FILTERS,sort:"price-low"});
  expect(found[0].priceKes).toBeLessThanOrEqual(found.at(-1)!.priceKes);
  expect(PREVIEW_LISTINGS.map(x=>x.id)).toEqual(original);
 });
 it("never supplies verified status to sample records",()=>{
  expect(PREVIEW_LISTINGS.every(x=>x.source==="demo"&&x.status==="preview"&&x.availability==="unknown")).toBe(true);
 });
});
