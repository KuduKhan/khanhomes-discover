import {describe,expect,it} from "vitest";
import {seekerRequestSchema,requestDateIsValid,validSameOrigin} from "./seeker-request";
const id="11111111-1111-4111-8111-111111111111";
describe("Discover private request guards",()=>{
 const base={requestId:id,listingId:id,kind:"viewing",preferredAt:"2026-11-15T09:00:00+03:00",message:"Could I request a viewing at this time?",consent:true};
 it("accepts structurally sound requests but rejects private extra fields",()=>{
  expect(seekerRequestSchema.safeParse(base).success).toBe(true);
  expect(seekerRequestSchema.safeParse({...base,passportNumber:"sensitive"}).success).toBe(false);
  expect(seekerRequestSchema.safeParse({...base,consent:false}).success).toBe(false);
 });
 it("requires a viewing date, forbids enquiry date, and validates time windows",()=>{
  expect(seekerRequestSchema.safeParse({...base,preferredAt:undefined}).success).toBe(false);
  expect(seekerRequestSchema.safeParse({...base,kind:"enquiry",preferredAt:undefined}).success).toBe(true);
  expect(seekerRequestSchema.safeParse({...base,kind:"enquiry"}).success).toBe(false);
  expect(requestDateIsValid(base as Parameters<typeof requestDateIsValid>[0],Date.parse("2026-11-01T00:00:00Z"))).toBe(true);
  expect(requestDateIsValid(base as Parameters<typeof requestDateIsValid>[0],Date.parse("2026-11-15T06:00:00Z"))).toBe(false);
 });
 it("denies missing origins and cross-origin submission",()=>{
  expect(validSameOrigin(new Request("https://discover.example.com/api/seeker-requests",{headers:{origin:"https://discover.example.com"}}))).toBe(true);
  expect(validSameOrigin(new Request("https://discover.example.com/api/seeker-requests",{headers:{origin:"https://evil.example.com"}}))).toBe(false);
  expect(validSameOrigin(new Request("https://discover.example.com/api/seeker-requests"))).toBe(false);
 });
});
