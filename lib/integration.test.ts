import {describe,expect,it} from "vitest";
import {randomUUID} from "node:crypto";
import {publishEventSchema,signPublication,verifyPublicationSignature,validatePublishedMedia} from "./integration";
describe("KhanHomes signed publishing boundary",()=>{
 const secret="a-long-secret-used-in-fixture-only";const id=randomUUID(),ts="1793505600",body='{"version":1}';
 it("accepts only a correctly signed fresh event",()=>{
  const signature="sha256="+signPublication(secret,ts,id,body);
  expect(verifyPublicationSignature({secret,timestamp:ts,eventId:id,signature,body,nowSeconds:1793505600})).toBe(true);
  expect(verifyPublicationSignature({secret,timestamp:ts,eventId:id,signature,body:body+"x",nowSeconds:1793505600})).toBe(false);
  expect(verifyPublicationSignature({secret,timestamp:ts,eventId:id,signature,body,nowSeconds:1793505960})).toBe(false);
 });
 it("rejects unsigned or malformed signatures",()=>{
  expect(verifyPublicationSignature({secret,timestamp:ts,eventId:id,signature:"sha256=abcdef",body,nowSeconds:1793505600})).toBe(false);
  expect(verifyPublicationSignature({secret,timestamp:null,eventId:id,signature:null,body})).toBe(false);
 });
 it("never accepts unapproved media hosts, credentials, http or private URLs",()=>{
  const hosts=["cdn.example.com"];
  expect(validatePublishedMedia(["https://cdn.example.com/apartment.webp"],hosts)).toBe(true);
  expect(validatePublishedMedia(["https://evil.example.net/private.jpg"],hosts)).toBe(false);
  expect(validatePublishedMedia(["http://cdn.example.com/x.jpg"],hosts)).toBe(false);
  expect(validatePublishedMedia(["https://user:pass@cdn.example.com/x.jpg"],hosts)).toBe(false);
 });
 it("requires explicit publication approval and no private fields",()=>{
  const event={version:1,event:"listing.published",listing:{sourceOrgId:id,sourcePropertyId:id,sourceUnitId:id,sourceUpdatedAt:"2026-11-01T10:00:00+03:00",publicationApproved:true,slug:"test-unit",title:"Sample title",area:"Kilimani",county:"Nairobi",kind:"Apartment",type:"rent",priceKes:42000,beds:1,baths:1,sizeSqm:65,furnished:false,parking:true,amenities:["Security"],description:"Approved listing with no private resident data.",images:["https://cdn.example.com/x.jpg"],availability:"unknown",verification:"listing-reviewed"}};
  expect(publishEventSchema.safeParse(event).success).toBe(true);
  expect(publishEventSchema.safeParse({...event,listing:{...event.listing,publicationApproved:false}}).success).toBe(false);
  expect(publishEventSchema.safeParse({...event,listing:{...event.listing,residentEmail:"secret@example.com"}}).success).toBe(false);
 });
});
