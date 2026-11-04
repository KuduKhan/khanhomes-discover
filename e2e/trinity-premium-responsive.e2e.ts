import {test,expect} from "@playwright/test";
const product="discover";
const slogan="PROPERTY DISCOVERY";
const paths=["/","/match","/visits","/planner","/finance"];
const widths=[320,375,428,768,1024,1440];

test("Trinity premium fit keeps existing page chrome and controls within every viewport",async({page})=>{
 test.setTimeout(120000);
 for(const width of widths){
  await page.setViewportSize({width,height:820});
  for(const path of paths){
   await page.goto(path,{waitUntil:"domcontentloaded"});
   await expect(page.locator("main").first()).toBeVisible();
   const geometry=await page.evaluate(()=>{
    const viewport=document.documentElement.clientWidth;
    const root=document.documentElement.scrollWidth;
    const selectors=["main",".trinity-header.site-header.khx-top",
      ".app-shell .app-topbar",".app-shell .app-content",
      ".discovery-site .hero-layout",".discovery-site .property-grid",
      ".trinity-dashboard .td-topbar",".trinity-dashboard .td-content",
      ".trinity-dashboard .demo-card",".trinity-dashboard .demo-metric"];
    const targets=selectors.flatMap(selector=>Array.from(document.querySelectorAll<HTMLElement>(selector)))
     .filter(el=>el.getClientRects().length>0 && getComputedStyle(el).position!=="fixed")
     .slice(0,30).map(el=>{
      const rect=el.getBoundingClientRect();
      return {selector,left:rect.left,right:rect.right,width:rect.width};
     });
    return {viewport,root,targets};
   });
   expect(geometry.root,product+" horizontal overflow "+path+" at "+width)
    .toBeLessThanOrEqual(geometry.viewport+2);
   for(const box of geometry.targets){
    expect(box.left,product+" "+path+" "+box.selector+" left at "+width).toBeGreaterThanOrEqual(-2);
    expect(box.right,product+" "+path+" "+box.selector+" right at "+width).toBeLessThanOrEqual(geometry.viewport+2);
    expect(box.width,product+" "+path+" "+box.selector+" width at "+width).toBeGreaterThan(0);
   }
   if(path==="/"){
    const header=page.locator('header[data-trinity-product="'+product+'"]');
    await expect(header).toHaveCount(1);
    await expect(header.locator(".trinity-brand-tagline")).toHaveText(slogan);
    await expect(header.locator(".trinity-brand-tagline")).toBeVisible();
    await expect(header.locator(".kh-emblem")).toBeVisible();
   }
  }
 }
});

test("Discover mobile search and existing property browsing remain reachable",async({page})=>{
 await page.setViewportSize({width:320,height:800});
 await page.goto("/");
 await expect(page.getByRole("search").first()).toBeVisible();
 await expect(page.locator(".hero-search input")).toBeVisible();
 await expect(page.locator(".property-grid").first()).toBeVisible();
});
