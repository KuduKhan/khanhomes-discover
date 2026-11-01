import {describe,it,expect} from "vitest";
import {normalizeTentativeVisits,buildTentativeIcs,hasVisitClash,type TentativeVisit} from "./calendar-export";
const id="11111111-1111-4111-8111-111111111111";
const a:TentativeVisit={id,listingId:"demo-001",day:"2026-11-14",time:"23:30",note:"Ask about utility, safety; no access code"};
describe("local, unconfirmed visit plans",()=>{
 it("rejects invalid dates and keeps safe bounded notes",()=>{
  expect(normalizeTentativeVisits([a,{...a,id:"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",day:"2026-02-30"}])).toHaveLength(1);
  expect(normalizeTentativeVisits([{...a,time:"25:00"}])).toHaveLength(0);
 });
 it("exports accurately labeled tentative calendar event with Nairobi midnight rollover",()=>{
  const ics=buildTentativeIcs([a],new Map([["demo-001","Jade Residences"]]),new Date("2026-11-01T06:00:00Z"));
  expect(ics).toContain("DTSTART;TZID=Africa/Nairobi:20261114T233000");
  expect(ics).toContain("DTEND;TZID=Africa/Nairobi:20261115T003000");
  expect(ics).toContain("STATUS:TENTATIVE");
  expect(ics).toContain("Not booked or confirmed");
  expect(ics).toContain("X-WR-CALNAME:Personal viewing ideas");
 });
 it("flags overlaps under one hour, and ignores same plan",()=>{
  expect(hasVisitClash(a,{...a,id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",time:"23:50"})).toBe(true);
  expect(hasVisitClash(a,{...a,id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",time:"21:30"})).toBe(false);
  expect(hasVisitClash(a,a)).toBe(false);
 });
});
