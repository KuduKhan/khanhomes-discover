import {describe,expect,it} from "vitest";
import {normalizeFavoriteIds,readStoredList} from "./local-preferences";
describe("KhanHomes Discover local preference resilience",()=>{
 it("rejects duplicate, invalid and unbounded favorite identifiers",()=>{
  expect(normalizeFavoriteIds(["demo-home-1","demo-home-1",null,11,"unsafe/path","mombasa_2"]))
   .toEqual(["demo-home-1","mombasa_2"]);
  expect(normalizeFavoriteIds(Array.from({length:110},(_,i)=>"home-"+i))).toHaveLength(100);
 });
 it("recovers from corrupt, malformed and outdated storage",()=>{
  expect(readStoredList("{",normalizeFavoriteIds)).toEqual([]);
  expect(readStoredList(null,normalizeFavoriteIds)).toEqual([]);
  expect(readStoredList('{"id":"old"}',normalizeFavoriteIds)).toEqual([]);
  expect(readStoredList('["home-1","home-1","home-2"]',normalizeFavoriteIds))
   .toEqual(["home-1","home-2"]);
 });
});
