import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
const file=(path:string)=>readFileSync(resolve(process.cwd(),path),"utf8");

describe("Trinity Header v2.1 — shared brand safety",()=>{
 it("uses an exact product-specific slogan on every sibling application",()=>{
  const header=file("components/trinity-header.tsx");
  expect(header).toContain('home:"PROPERTY INTELLIGENCE"');
  expect(header).toContain('discover:"PROPERTY DISCOVERY"');
  expect(header).toContain('build:"CONSTRUCTION INTELLIGENCE"');
  expect(header).toContain('className="trinity-brand-tagline">{brandSlogans[product]}');
  expect(header).not.toContain('className="trinity-brand-tagline">PROPERTY INTELLIGENCE</span>');
 });
 it("keeps emblem artwork padded and responsive without cropping",()=>{
  const emblem=file("public/brand/khanhomes-mark.svg");
  const css=file("app/trinity-header.css");
  expect(emblem).toContain('viewBox="-12 -10 264 232"');
  expect(emblem).toContain('preserveAspectRatio="xMidYMid meet"');
  expect(css).toContain("TRINITY BRAND FIT v2.1");
  expect(css).toContain("object-fit:contain");
  expect(css).toContain("grid-template-areas:");
  expect(css).toContain("display:flex!important");
 });
});
