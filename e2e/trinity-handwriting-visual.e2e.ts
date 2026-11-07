import {expect,test} from "@playwright/test";

/** Screenshot-backed public typography check; no private or fabricated accounts. */
test("Trinity handwriting remains editorial, responsive and readable",async({page},info)=>{
 await page.goto("/");
 const hero=page.locator([
  ".kh-premium-public .hero-copy h1 em",
  ".discovery-site .hero-content h1 em",
  ".kb-public .khx-hero h1 em"
 ].join(", ")).first();
 await expect(hero).toBeVisible();
 for(const width of [375,768,1440]){
  await page.setViewportSize({width,height:900});
  await expect(hero).toBeVisible();
  const result=await hero.evaluate(el=>{
   const computed=getComputedStyle(el);
   const rect=el.getBoundingClientRect();
   return {font:computed.fontFamily,weight:computed.fontWeight,
    left:rect.left,right:rect.right,viewport:document.documentElement.clientWidth};
  });
  expect(result.font).toContain("Caveat");
  expect(result.left,"Handwritten hero extends past left viewport").toBeGreaterThanOrEqual(-2);
  expect(result.right,"Handwritten hero extends past right viewport").toBeLessThanOrEqual(result.viewport+2);
  const bodyFont=await page.locator("body").evaluate(el=>getComputedStyle(el).fontFamily);
  expect(bodyFont,"Handwriting must not replace legible app body typography").not.toContain("Caveat");
  if(info.project.name==="desktop-chromium"){
   await page.screenshot({path:`test-results/visual-audit/trinity-handwriting-${width}.png`,animations:"disabled"});
  }
 }
});
