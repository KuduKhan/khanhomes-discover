import {expect,test} from "@playwright/test";

/** Evidence-backed public/fictional demo layout audit.
 * Private authenticated workflow acceptance requires independent test identities.
 */
test("existing discovery-catalog screen stays readable across device widths",async({page},info)=>{
 await page.goto("/");
 const card=page.locator(".discovery-site .property-card").first();
 await expect(card).toBeVisible();
 for(const width of [320,375,768,1440,1920]){
  await page.setViewportSize({width,height:900});
  await expect(card).toBeVisible();
  const geometry=await card.evaluate(el=>{
   const rect=el.getBoundingClientRect();
   return {
    width:rect.width,left:rect.left,right:rect.right,
    viewport:document.documentElement.clientWidth,
    pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    icons:[...el.querySelectorAll("svg")].slice(0,3).map(s=>{
     const r=s.getBoundingClientRect();return {width:r.width,height:r.height};
    })
   };
  });
  expect(geometry.width).toBeGreaterThan(0);
  expect(geometry.left,"Card crosses left boundary at "+width).toBeGreaterThanOrEqual(-2);
  expect(geometry.right,"Card crosses right boundary at "+width).toBeLessThanOrEqual(geometry.viewport+2);
  expect(geometry.pageOverflow,"Horizontal overflow at "+width).toBeLessThanOrEqual(2);
  for(const icon of geometry.icons){
   expect(icon.width,"Icon must remain visible").toBeGreaterThan(0);
   expect(icon.width,"Icon should not dominate the card").toBeLessThanOrEqual(36);
  }
  if(info.project.name==="desktop-chromium"&&[375,768,1440].includes(width)){
   await page.screenshot({path:`test-results/visual-audit/discovery-catalog-${width}.png`,animations:"disabled"});
  }
 }
});
