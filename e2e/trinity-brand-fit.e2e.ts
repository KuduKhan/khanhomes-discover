import {test,expect} from "@playwright/test";

test("Trinity brand uses the correct slogan and full emblem without cropping",async({page})=>{
 test.setTimeout(120000);
 for(const width of [320,375,428,520,768,1024,1440]){
  await page.setViewportSize({width,height:840});
  await page.goto("/");
  const header=page.locator('header[data-trinity-version="2.0"][data-trinity-product="discover"]');
  await expect(header).toHaveCount(1);
  const tagline=header.locator(".trinity-brand-tagline");
  await expect(tagline).toHaveText("PROPERTY DISCOVERY");
  await expect(tagline).toBeVisible();
  const mark=header.locator(".trinity-logo-wrap .kh-emblem");
  await expect(mark).toBeVisible();
  const bounds=await header.evaluate((element)=>{
   const badge=element.querySelector(".trinity-logo-wrap")!.getBoundingClientRect();
   const img=element.querySelector(".kh-emblem")!.getBoundingClientRect();
   const tag=element.querySelector(".trinity-brand-tagline")!.getBoundingClientRect();
   return {
    badge:badge.toJSON(),img:img.toJSON(),tag:tag.toJSON(),
    scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth
   };
  });
  expect(bounds.img.width, "emblem width at "+width).toBeGreaterThan(15);
  expect(bounds.img.height, "emblem height at "+width).toBeGreaterThan(15);
  expect(bounds.img.left, "emblem clipped left at "+width).toBeGreaterThanOrEqual(bounds.badge.left-1);
  expect(bounds.img.right, "emblem clipped right at "+width).toBeLessThanOrEqual(bounds.badge.right+1);
  expect(bounds.img.top, "emblem clipped top at "+width).toBeGreaterThanOrEqual(bounds.badge.top-1);
  expect(bounds.img.bottom, "emblem clipped bottom at "+width).toBeLessThanOrEqual(bounds.badge.bottom+1);
  expect(bounds.tag.width, "slogan hidden at "+width).toBeGreaterThan(65);
  expect(bounds.tag.right,"slogan exceeds viewport at "+width).toBeLessThanOrEqual(bounds.viewport+1);
  expect(bounds.scroll,"horizontal overflow at "+width).toBeLessThanOrEqual(bounds.viewport+2);
 }
});
