import {expect,test} from "@playwright/test";

/** Layout regression: keep every footer destination while avoiding tall empty bands. */
test("Discover footer is compact and fully usable from narrow phones to desktop",async({page})=>{
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  const footer=page.locator(".site-footer");
  await expect(footer).toBeVisible();
  await expect(footer.getByRole("navigation",{name:"Discover links"}).getByRole("link")).toHaveCount(9);
  await expect(footer.getByRole("navigation",{name:"KhanHomes links"}).getByRole("link")).toHaveCount(4);
  await expect(footer.locator(".kh-emblem")).toBeVisible();
  const geometry=await footer.evaluate(el=>({
   height:el.getBoundingClientRect().height,
   width:el.getBoundingClientRect().width,
   scrollWidth:document.documentElement.scrollWidth,
   viewportWidth:document.documentElement.clientWidth,
   gridPadding:parseFloat(getComputedStyle(el.querySelector(".footer-grid")!).paddingTop)
  }));
  expect(geometry.scrollWidth-geometry.viewportWidth,"Overflow at "+width).toBeLessThanOrEqual(2);
  expect(geometry.gridPadding,"Footer top spacing at "+width).toBeLessThanOrEqual(32);
  expect(geometry.height,"Footer height at "+width).toBeLessThanOrEqual(width>=1024?315:width>=680?420:565);
 }
});
