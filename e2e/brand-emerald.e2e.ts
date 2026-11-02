import {expect,test} from "@playwright/test";
test("Discover uses original KhanHomes emerald in logos, favicon and navigation",async({page,request})=>{
 for(const path of ["/brand/khanhomes-mark.svg","/brand/khanhomes-logo.svg","/favicon.svg"]){
  const response=await request.get(path);
  expect(response.ok(),path).toBeTruthy();
  const svg=await response.text();
  expect(svg).toContain("#147b69");
  expect(svg).not.toContain("url(#gold)");
  expect(svg).not.toMatch(/#(?:d9a41e|a87805|d3a221|a97905|c99a16)/i);
 }
 await page.goto("/");
 await expect(page.locator('img[src="/brand/khanhomes-mark.svg"]').first()).toBeVisible();
 const accent=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue("--kh-family-accent").trim());
 expect(accent).toBe("#147b69");
});
