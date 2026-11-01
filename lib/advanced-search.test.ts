import {describe,it,expect} from "vitest";
import {PREVIEW_LISTINGS} from "./catalog";
import {DEFAULT_FILTERS,filterListings,serializeFilters,parseFilters,countActiveFilters} from "./filters";
import {interpretHomeQuery} from "./search-intent";
import {estimateMoveInCost,defaultMoveInInput} from "./move-in-costs";
import {makeSavedSearch,normalizeSavedSearches,restoreSavedSearch} from "./saved-searches";
describe("Discover advanced house hunting",()=>{
 it("filters property type, multiple amenities, baths and minimum area together",()=>{
  const filtered=filterListings(PREVIEW_LISTINGS,{...DEFAULT_FILTERS,kind:"Apartment",minBaths:2,minSqm:100,amenities:["Security","Balcony"]});
  expect(filtered.length).toBeGreaterThan(0);
  expect(filtered.every(h=>h.kind==="Apartment"&&h.baths>=2&&h.sizeSqm>=100&&h.amenities.includes("Balcony"))).toBe(true);
 });
 it("round-trips shareable filter URLs and discards malformed values",()=>{
  const f={...DEFAULT_FILTERS,county:"Mombasa",minBeds:2,minBaths:2,kind:"Apartment" as const,amenities:["Balcony"],parking:true,maxPrice:55000};
  const parsed=parseFilters(new URLSearchParams(serializeFilters(f)),["All locations","Mombasa","Nairobi"]);
  expect(parsed).toEqual(f);
  expect(countActiveFilters(parsed)).toBe(7);
  const malformed=parseFilters(new URLSearchParams("max=-5&beds=99999&type=hack&amenities=%3Cscript%3E"),["All locations"]);
  expect(malformed.maxPrice).toBe(null);
  expect(malformed.minBeds).toBe(0);
  expect(malformed.type).toBe("rent");
  expect(malformed.amenities).toEqual([]);
 });
 it("interprets ordinary-language constraints transparently",()=>{
  const parsed=interpretHomeQuery("Find me a 2 bedroom in Mombasa under KES 50k with parking and balcony");
  expect(parsed.filters).toMatchObject({county:"Mombasa",minBeds:2,maxPrice:50000,parking:true});
  expect(parsed.filters.amenities).toContain("Balcony");
  expect(parsed.interpreted).toContain("Mombasa");
 });
 it("makes no external affordability claims; estimates each explicit input",()=>{
  const e=estimateMoveInCost({...defaultMoveInInput(45000),depositMonths:2,serviceCharge:3000,utilitySetup:1500,movingBudget:10000});
  expect(e.deposit).toBe(90000);
  expect(e.total).toBe(149500);
  expect(e.ongoingMonthly).toBe(48000);
  expect(estimateMoveInCost({...defaultMoveInInput(40000),depositMonths:-7}).deposit).toBe(0);
 });
 it("saves, restores, and safely caps browser-local search definitions",()=>{
  const saved=makeSavedSearch("Mombasa two-bed", {...DEFAULT_FILTERS,county:"Mombasa",minBeds:2},"local-0001",new Date("2026-11-01T00:00:00Z"));
  expect(restoreSavedSearch(saved,["All locations","Mombasa"]).minBeds).toBe(2);
  expect(normalizeSavedSearches([...Array(30)].map((_,i)=>({...saved,id:"local-"+String(i).padStart(4,"0")}))).length).toBe(12);
  expect(normalizeSavedSearches([{...saved,label:""}])).toHaveLength(0);
 });
});
