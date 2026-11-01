import {describe,expect,it} from "vitest";
import {PREVIEW_LISTINGS} from "./catalog";
import {DEFAULT_FILTERS} from "./filters";
import {makeSavedSearch} from "./saved-searches";
import {checkSavedSearch,newSinceSnapshot,normalizeWatchSnapshots} from "./search-watch";
const entry=makeSavedSearch("Coast", {...DEFAULT_FILTERS,county:"Mombasa"},"44444444-4444-4444-8444-444444444444");
const counties=["Nairobi","Mombasa","Kisumu"];
describe("local manual saved search watching",()=>{
 it("initializes without falsely reporting every existing listing as new",()=>{
  const state=newSinceSnapshot(entry,undefined,PREVIEW_LISTINGS,counties);
  expect(state.initialized).toBe(false);expect(state.newHomes).toEqual([]);
  expect(state.matches.length).toBe(2);
 });
 it("reports newly visible matching listing only after a baseline",()=>{
  const old=PREVIEW_LISTINGS.filter(x=>x.id!=="demo-008");
  const snapshot=checkSavedSearch(entry,[],old,counties,new Date("2026-10-30T10:00:00Z"))[0];
  const result=newSinceSnapshot(entry,snapshot,PREVIEW_LISTINGS,counties);
  expect(result.initialized).toBe(true);
  expect(result.newHomes.map(x=>x.id)).toEqual(["demo-008"]);
  const refreshed=checkSavedSearch(entry,[snapshot],PREVIEW_LISTINGS,counties);
  expect(newSinceSnapshot(entry,refreshed[0],PREVIEW_LISTINGS,counties).newHomes).toEqual([]);
 });
 it("bounds and sanitizes corrupt device storage",()=>{
  const a=normalizeWatchSnapshots([{searchId:entry.id,seenIds:["good-id","good-id",1,"<script>"],checkedAt:"2026-11-01T08:00:00Z"}]);
  expect(a[0].seenIds).toEqual(["good-id"]);
  expect(normalizeWatchSnapshots([{searchId:"!",checkedAt:"fake",seenIds:[]}])).toHaveLength(0);
 });
});
