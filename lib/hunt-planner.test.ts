import {describe,expect,it} from "vitest";
import {assessmentCompletion,exportSafePlanner,HUNT_CHECKLIST,initialAssessment,safeAssessments} from "./hunt-planner";
describe("browser-local house hunt planning",()=>{
 it("sanitizes malformed and unexpected notes, checklist values and ratings",()=>{
  const x=safeAssessments([{listingId:"demo-001",notes:"x".repeat(800),plannedFor:"not a date",
   checklist:["water","water","__proto__","charges"],rating:999,updatedAt:"invalid"}]);
  expect(x).toHaveLength(1);
  expect(x[0].notes.length).toBe(600);
  expect(x[0].checklist).toEqual(["water","charges"]);
  expect(x[0].rating).toBe(5);
  expect(x[0].plannedFor).toBe("");
 });
 it("counts user observations without treating unreviewed as certified",()=>{
  const a=initialAssessment("demo-001");
  expect(assessmentCompletion(a)).toBe(0);
  a.checklist=[HUNT_CHECKLIST[0].id,HUNT_CHECKLIST[1].id];
  expect(assessmentCompletion(a)).toBe(20);
 });
 it("exports only known properties and contains the subjective-notes disclaimer",()=>{
  const a=[initialAssessment("demo-001"),initialAssessment("other-listing")];
  const result=exportSafePlanner(a,["demo-001"]);
  expect(result).toContain("User-entered impressions");
  expect(result).toContain("demo-001");
  expect(result).not.toContain("other-listing");
 });
});
