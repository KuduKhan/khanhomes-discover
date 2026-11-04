import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
const file=(p:string)=>readFileSync(resolve(process.cwd(),p),"utf8");
describe("Trinity premium responsive contract — discover",()=>{
 it("loads the single shared finishing layer after product-specific styling",()=>{
  const layout=file("app/layout.tsx");
  expect(layout).toContain('import "./trinity-responsive-finish.css";');
  expect(layout.trimEnd().indexOf('import "./trinity-responsive-finish.css";'))
   .toBeGreaterThan(layout.indexOf('import "./trinity-header.css";'));
  const css=file("app/trinity-responsive-finish.css");
  for(const scope of [".trinity-header.site-header.khx-top",".app-shell .app-topbar",
   ".discovery-site .property-grid",".trinity-dashboard .td-topbar"])
   expect(css).toContain(scope);
  for(const rule of ["max-width:520px","max-width:380px","prefers-reduced-motion:reduce",
   "prefers-reduced-transparency:reduce","object-fit:contain"])
   expect(css).toContain(rule);
 });
 it("preserves existing features, product slogan and responsive controls",()=>{
  const header=file("components/trinity-header.tsx");
  expect(header).toContain('className="trinity-brand-tagline">{brandSlogans[product]}');
  expect(header).toContain("PROPERTY DISCOVERY");
  expect(file("components/discover-experience.tsx")).toContain("hero-search");
 });
});
