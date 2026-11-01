import {describe,it,expect} from "vitest";
import {blankListingDraft,normalizeDrafts,evaluateDraft,exportLocalDraft} from "./listing-draft";
const id="11111111-1111-4111-8111-111111111111";
describe("Listing Atelier draft-only authorization boundary",()=>{
 it("starts incomplete without certification or public visibility",()=>{
  const draft=blankListingDraft(id);
  const state=evaluateDraft(draft);
  expect(state.score).toBe(0);
  expect(state.checks.every(x=>x.done===false)).toBe(true);
 });
 it("computes truthful readiness only from manually provided draft fields",()=>{
  const draft={...blankListingDraft(id),title:"Harbour Court",area:"Nyali",priceKes:45000,sizeSqm:75,
   description:"A genuinely detailed apartment description that must be reviewed independently and never contain personal tenant data.",
   amenities:["Parking","Security"] as ("Parking"|"Security")[],
   charges:"Monthly rent excludes utilities.",representationChecked:true,mediaRightsChecked:true,availabilityChecked:true};
  expect(evaluateDraft(draft).score).toBe(100);
  const exported=JSON.parse(exportLocalDraft(draft)) as {approved:boolean;published:boolean;draftOnly:boolean;draft:{title:string}};
  expect(exported.approved).toBe(false);expect(exported.published).toBe(false);expect(exported.draftOnly).toBe(true);
  expect(exported.draft.title).toBe("Harbour Court");
 });
 it("rejects accidentally copied contact details from export",()=>{
  const draft=blankListingDraft(id);
  expect(()=>exportLocalDraft({...draft,description:"Contact John at person@example.com"})).toThrow(/Remove email/);
  expect(()=>exportLocalDraft({...draft,description:"Call +254 712 345 678"})).toThrow(/Remove email/);
 });
 it("bounds draft storage and strips unrecognized fields",()=>{
  const value={...blankListingDraft(id),title:"A".repeat(500),tenantIdNumber:"secret",amenities:["Parking","Parking","Unknown"],priceKes:-1};
  const result=normalizeDrafts([value]);
  expect(result[0].title).toHaveLength(120);expect(result[0].priceKes).toBe(0);
  expect(result[0].amenities).toEqual(["Parking"]);
  expect("tenantIdNumber" in result[0]).toBe(false);
 });
});
