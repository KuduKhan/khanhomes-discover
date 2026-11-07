import {expect,test} from "@playwright/test";

/** Public Trinity contract only; no authenticated data or Build commercial flows. */
test.describe("Trinity navigation quality gate",()=>{
 test("one product switcher is visible, with bounded responsive header",async({page})=>{
  await page.goto("/");
  const header=page.locator(".trinity-header");
  await expect(header).toBeVisible();
  for(const width of [320,375,768,1024,1440,1920]){
   await page.setViewportSize({width,height:900});
   if(width<=1120){
    await expect(header.locator(".trinity-product-nav")).toBeVisible();
    await expect(header.locator(".trinity-product-tabs")).toBeHidden();
   }else{
    await expect(header.locator(".trinity-product-tabs")).toBeVisible();
    await expect(header.locator(".trinity-product-nav")).toBeHidden();
   }
   const dimensions=await header.evaluate(el=>({
    left:el.getBoundingClientRect().left,
    right:el.getBoundingClientRect().right,
    viewport:document.documentElement.clientWidth
   }));
   expect(dimensions.left).toBeGreaterThanOrEqual(-1);
   expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport+1);
  }
 });
 test("mobile navigation exposes existing destinations and closes on Escape",async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto("/");
  const header=page.locator(".trinity-header");
  const menu=header.getByRole("button",{name:"Open navigation"});
  await expect(menu).toBeVisible();
  await menu.click();
  const panel=header.locator(".trinity-mobile-panel");
  await expect(panel).toBeVisible();
  await expect(header.getByRole("button",{name:"Close navigation"})).toHaveAttribute("aria-expanded","true");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(header.getByRole("button",{name:"Open navigation"})).toHaveAttribute("aria-expanded","false");
 });
});
