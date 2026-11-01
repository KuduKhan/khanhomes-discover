import {describe,expect,it} from "vitest";
import {exportSafePlanner,initialAssessment} from "./hunt-planner";
import {mergePlannerImport,parsePlannerImport} from "./planner-portability";
const home={...initialAssessment("home-123"),notes:"My notes",rating:4,updatedAt:"2026-11-01T05:00:00.000Z"};
describe("local home-hunt portability",()=>{
 it("round trips a valid export",()=>{
  const raw=exportSafePlanner([home],["home-123"]);
  expect(parsePlannerImport(raw,["home-123"])).toEqual([home]);
 });
 it("rejects arbitrary JSON and oversized files",()=>{
  expect(()=>parsePlannerImport('{"assessments":[]}',["home-123"])).toThrow();
  expect(()=>parsePlannerImport("x".repeat(100001),["home-123"])).toThrow();
 });
 it("rejects unknown or duplicate entries rather than silently accepting them",()=>{
  const doc=JSON.parse(exportSafePlanner([home],["home-123"]));
  doc.assessments.push(home);
  expect(()=>parsePlannerImport(JSON.stringify(doc),["home-123"])).toThrow();
 });
 it("does not restore unknown homes",()=>{
  expect(()=>parsePlannerImport(exportSafePlanner([home],["home-123"]),["other-home"])).toThrow();
 });
 it("does not overwrite newer browser notes",()=>{
  const newer={...home,notes:"Newer edits",updatedAt:"2026-11-02T05:00:00.000Z"};
  expect(mergePlannerImport([newer],[home])).toEqual([newer]);
  expect(mergePlannerImport([home],[newer])).toEqual([newer]);
 });
});
