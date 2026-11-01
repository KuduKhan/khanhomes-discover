import {expect,test} from "@playwright/test";

test.describe("KhanHomes Discover v0.6 guided home hunt",()=>{
 test("AURA Match ranks only catalog homes and explains scores",async({page})=>{
  await page.goto("/match");
  await expect(page.getByRole("heading",{name:/Homes ranked around/})).toBeVisible();
  await expect(page.locator(".match-card")).toHaveCount(6);
  await page.getByRole("combobox",{name:"Preferred county"}).selectOption("Mombasa");
  await page.getByRole("spinbutton",{name:/Maximum monthly rent/}).fill("50000");
  await page.getByRole("combobox",{name:"Minimum bedrooms"}).selectOption("2");
  await expect(page.locator(".match-card").first()).toContainText("Coastline Lofts");
  await page.getByRole("button",{name:"Why this match?"}).first().click();
  await expect(page.locator(".match-breakdown").first()).toContainText("Location");
  await expect(page.locator(".match-breakdown").first()).toContainText("Budget");
  await expect(page.locator(".match-breakdown").first()).toContainText(/not a valuation/i);
  await page.reload();
  await expect(page.getByRole("combobox",{name:"Preferred county"})).toHaveValue("Mombasa");
  await expect(page.getByRole("spinbutton",{name:/Maximum monthly rent/})).toHaveValue("50000");
 });
 test("manual Search Watch establishes a baseline and persists without false alerts",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"Save search",exact:true}).click();
  await page.getByRole("textbox",{name:"Name this search"}).fill("My Kenya rentals");
  await page.getByRole("button",{name:"Save locally"}).click();
  await page.goto("/watch");
  const entry=page.locator(".watch-entry").first();
  await expect(entry).toContainText("My Kenya rentals");
  await expect(entry).toContainText(/Not checked on this device/);
  await expect(entry).not.toContainText(/newly appearing since last check/);
  await entry.getByRole("button",{name:"Establish baseline"}).click();
  await expect(entry).toContainText("No new matches since last check");
  await page.reload();
  await expect(page.locator(".watch-entry")).toContainText(["My Kenya rentals"]);
  await expect(page.locator(".watch-entry")).toContainText("No new matches since last check");
  await expect(page.getByText(/not an email, SMS, push or automatic/)).toBeVisible();
 });
 test("private itinerary adds tentative dates, detects overlap and exports calendar",async({page})=>{
  await page.goto("/visits");
  await expect(page.getByRole("heading",{name:/Explore on your own schedule/})).toBeVisible();
  await page.getByRole("combobox",{name:"Choose home"}).selectOption("demo-001");
  await page.getByLabel("Date",{exact:true}).fill("2026-11-14");
  await page.getByLabel("Local time (EAT)").fill("10:30");
  await page.getByRole("textbox",{name:/Preparation note/}).fill("Confirm fees, water, access");
  await page.getByRole("button",{name:"Add tentative plan"}).click();
  await expect(page.locator(".visit-row")).toHaveCount(1);
  await page.getByRole("combobox",{name:"Choose home"}).selectOption("demo-002");
  await page.getByLabel("Date",{exact:true}).fill("2026-11-14");
  await page.getByLabel("Local time (EAT)").fill("11:00");
  await page.getByRole("button",{name:"Add tentative plan"}).click();
  await expect(page.locator(".visit-row")).toHaveCount(2);
  await expect(page.getByText(/Potential overlap with/)).toHaveCount(2);
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:/Export tentative calendar/}).click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toBe("khanhomes-discover-tentative-visits.ics");
  await page.reload();
  await expect(page.locator(".visit-row")).toHaveCount(2);
  await expect(page.getByText(/All properties shown in this preview are fictional/)).toBeVisible();
 });
 test("guided routes are responsive and show no clipped content",async({page},info)=>{
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   for(const route of ["/match","/watch","/visits"]){
    await page.goto(route);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    expect(overflow,route+" width "+width).toBeLessThanOrEqual(2);
    if(info.project.name==="desktop-chromium"&&[390,1440].includes(width)){
     const name=route.slice(1);
     await page.screenshot({path:"test-results/visual-audit/"+name+"-"+width+".png",animations:"disabled"});
    }
   }
  }
 });
 test("fictional listing detail labels its catalog-only prices",async({page})=>{
  await page.goto("/homes/jade-residences-kilimani");
  const context=page.getByRole("region",{name:"Transparent price comparison of catalog properties"});
  await expect(context).toBeVisible();
  await expect(context).toContainText("Median advertised price");
  await expect(context).toContainText("KES 80,000");
  await expect(context).toContainText(/fictional illustrations/i);
  await expect(page.getByRole("link",{name:/Plan a tentative visit/})).toBeVisible();
 });
});
