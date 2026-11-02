import {expect,test} from "@playwright/test";
test.describe("KhanHomes Discover independent preview",()=>{
 test("accessible catalogue, rent/sale filtering, saved homes and comparison",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{level:1})).toContainText("Find a place");
  await expect(page.getByText(/Illustrative previews only/)).toBeVisible();
  const cards=page.locator(".property-card");
  await expect(cards).toHaveCount(6);
  await page.getByRole("button",{name:"For sale"}).click();
  await expect(cards).toHaveCount(2);
  await page.getByRole("button",{name:"For rent"}).click();
  await page.getByRole("button",{name:"Filters",exact:false}).click();
  await page.getByRole("combobox",{name:"Filter by county"}).selectOption("Mombasa");
  await expect(cards).toHaveCount(2);
  await page.getByRole("combobox",{name:"Filter by county"}).selectOption("All locations");
  await expect(cards).toHaveCount(6);
  const first=cards.first();
  await first.getByRole("button",{name:/Save /}).click();
  await page.getByRole("button",{name:/Saved 1/}).click();
  await expect(cards).toHaveCount(1);
  await page.getByRole("button",{name:/Saved 1/}).click();
  await first.getByRole("button",{name:"Compare"}).click();
  await cards.nth(1).getByRole("button",{name:"Compare"}).click();
  await expect(page.getByRole("region",{name:"Compare homes"})).toBeVisible();
  await page.getByRole("button",{name:"Compare",exact:true}).last().click();
  await expect(page.getByRole("region",{name:"Home comparison"})).toBeVisible();
  await expect(page.locator(".compare-table-scroll tbody tr")).toHaveCount(7);
 });
 test("property detail does not simulate bookings or payment collection",async({page})=>{
  await page.goto("/homes/jade-residences-kilimani");
  await expect(page.getByRole("heading",{level:1})).toContainText("Jade Residences");
  await expect(page.locator(".status-explainer").getByText(/This fictional home/i)).toBeVisible();
  await expect(page.getByRole("button",{name:/Viewing requests not yet enabled/i})).toBeDisabled();
  await expect(page.getByText(/does not collect deposits/i)).toBeVisible();
 });
 test("responsive public page with real screenshots; no horizontal clipping",async({page},testInfo)=>{
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto("/");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   expect(overflow,"Unexpected page overflow at "+width).toBeLessThanOrEqual(2);
   await expect(page.getByRole("heading",{level:1})).toBeVisible();
   if(testInfo.project.name==="desktop-chromium" && [390,1440].includes(width)){
    await page.screenshot({path:"test-results/visual-audit/discovery-"+width+".png",animations:"disabled"});
   }
  }
 });

 test("explainable home search, saved filters and area atlas work in preview",async({page})=>{
  await page.goto("/");
  await page.getByRole("textbox",{name:"Describe a property search"}).fill("Find 2 bedrooms in Mombasa under KES 50k with parking");
  await page.getByRole("button",{name:"Find matches"}).click();
  await expect(page.locator(".property-card")).toHaveCount(1);
  await expect(page.getByText("Up to KES 50,000")).toBeVisible();
  await page.getByRole("button",{name:"Save search",exact:true}).click();
  await page.getByRole("textbox",{name:"Name this search"}).fill("Coastal family homes");
  await page.getByRole("button",{name:"Save locally"}).click();
  await expect(page.getByRole("button",{name:/Saved searches \(1\)/})).toBeVisible();
  await page.reload();
  await page.getByRole("button",{name:/Saved searches \(1\)/}).click();
  await expect(page.getByText("Coastal family homes")).toBeVisible();
  await page.locator(".saved-search-entry").getByRole("button",{name:"Apply"}).click();
  await expect(page.locator(".property-card")).toHaveCount(1);
  await page.getByRole("button",{name:"Area map view"}).click();
  await expect(page.getByRole("region",{name:"Interactive Kenya area overview"})).toBeVisible();
  await expect(page.getByText(/not exact home addresses/)).toBeVisible();
 });
 test("cost estimator itemizes assumptions without claiming actual charges",async({page})=>{
  await page.goto("/homes/jade-residences-kilimani");
  const estimate=page.getByRole("region",{name:"Move-in cost estimator"});
  await expect(estimate).toBeVisible();
  await expect(estimate.getByText("KES 136,000")).toBeVisible();
  await estimate.getByRole("combobox",{name:"Deposit months"}).selectOption("2");
  await expect(estimate.getByText("KES 204,000")).toBeVisible();
  await expect(estimate.getByText(/not verified listing charges/)).toBeVisible();
 });

 test("public API never misrepresents sample listings as live",async({request})=>{
  const res=await request.get("/api/listings");
  expect(res.ok()).toBe(true);
  const json=await res.json();
  expect(json.mode).toBe("preview");
  expect(json.listings.every((x:{source:string;availability:string})=>x.source==="demo"&&x.availability==="unknown")).toBe(true);
  const health=await request.get("/api/health");
  expect(health.ok()).toBe(true);
  const signed=await request.post("/api/integrations/khanhomes",{data:{}});
  expect(signed.status()).toBe(503);
 });
 test("account and property detail remain readable at small and wide viewports",async({page},info)=>{
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   for(const address of ["/account","/homes/jade-residences-kilimani"]){
    await page.goto(address);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,address+" overflow at "+width).toBeLessThanOrEqual(2);
    if(info.project.name==="desktop-chromium" && [390,1440].includes(width)){
     const suffix=address==="/account"?"account":"home-detail";
     await page.screenshot({path:"test-results/visual-audit/"+suffix+"-"+width+".png",animations:"disabled"});
    }
   }
  }
 });
 test("private accounts, booking and fraud-report APIs fail closed in unconfigured preview",async({page,request})=>{
  await page.goto("/account");
  await expect(page.getByRole("heading",{name:/Private accounts are being prepared/})).toBeVisible();
  const viewing=await request.post("/api/seeker-requests",{data:{}});
  expect(viewing.status()).toBe(503);
  const report=await request.post("/api/reports",{data:{}});
  expect(report.status()).toBe(503);
  const history=await request.get("/api/seeker-requests");
  expect(history.status()).toBe(503);
 });
 test("home hunt planner saves browser-local notes, checklist and ratings across reloads",async({page},info)=>{
  await page.goto("/");
  await page.locator(".property-card").first().getByRole("button",{name:/Save /}).click();
  await page.goto("/planner");
  await expect(page.getByRole("heading",{name:/Make a more confident choice/})).toBeVisible();
  await expect(page.locator(".planner-home-tab")).toHaveCount(1);
  await page.getByRole("checkbox",{name:/Water supply and pressure/}).check();
  await page.getByRole("button",{name:"Rate 4 out of 5"}).click();
  await page.getByRole("textbox",{name:"Your private observations"}).fill("Check water pressure in the kitchen. This is a fictional test note.");
  await expect(page.locator(".planner-overview").getByText("10%",{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox",{name:/Water supply and pressure/})).toBeChecked();
  await expect(page.getByRole("textbox",{name:"Your private observations"})).toHaveValue(/fictional test note/);
  await expect(page.getByRole("button",{name:"Rate 4 out of 5"})).toHaveAttribute("aria-pressed","true");
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   expect(overflow,"Planner overflow at "+width).toBeLessThanOrEqual(2);
   if(info.project.name==="desktop-chromium" && [390,1440].includes(width)){
    await page.screenshot({path:"test-results/visual-audit/planner-"+width+".png",animations:"disabled"});
   }
  }
 });
 test("atmosphere and dark mode change visual tokens with no authorization impact",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"Open Appearance Studio"}).click();
  await page.getByRole("button",{name:"Apply Daybreak atmosphere"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere","daybreak");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere","daybreak");
  await page.getByRole("button",{name:"Open Appearance Studio"}).click();
  await page.getByRole("button",{name:"Use dark mode"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 });
});
