import {describe,it,expect} from "vitest";
import {listingReportSchema} from "./listing-report";
const id="22222222-2222-4222-8222-222222222222";
describe("Discover private listing moderation",()=>{
 const good={reportId:id,listingId:id,reason:"suspicious",details:"The listed property facts may be misleading."};
 it("accepts an explicit report reason without exposing private fields",()=>{
  expect(listingReportSchema.safeParse(good).success).toBe(true);
  expect(listingReportSchema.safeParse({...good,seekerPhone:"+254700000001"}).success).toBe(false);
 });
 it("rejects invalid content and unknown moderation categories",()=>{
  expect(listingReportSchema.safeParse({...good,reason:"dangerous"}).success).toBe(false);
  expect(listingReportSchema.safeParse({...good,details:"short"}).success).toBe(false);
 });
});
