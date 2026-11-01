import {describe,expect,it} from "vitest";
import {normalizeListingFreshness} from "./listing-freshness";
const now=Date.parse("2026-11-01T09:00:00Z");
describe("public listing freshness",()=>{
 it("retains a genuinely recent, source-reported availability label",()=>{
  expect(normalizeListingFreshness("availability-confirmed","available","2026-10-30T08:00:00Z",now))
   .toEqual({status:"availability-confirmed",availability:"available"});
 });
 it("downgrades stale snapshots instead of suggesting a vacant home",()=>{
  expect(normalizeListingFreshness("availability-confirmed","available","2026-09-01T08:00:00Z",now))
   .toEqual({status:"listing-reviewed",availability:"unknown"});
  expect(normalizeListingFreshness("availability-confirmed","available","garbled",now))
   .toEqual({status:"listing-reviewed",availability:"unknown"});
 });
 it("does not accept future-dated availability beyond reasonable clock skew",()=>{
  expect(normalizeListingFreshness("availability-confirmed","available","2026-11-04T09:00:00Z",now).availability).toBe("unknown");
 });
});
