import {expect,test} from "@playwright/test";
test.describe("KhanHomes Discovery independent preview",()=>{
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
  await expect(page.getByText(/fictional home/i)).toBeVisible();
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
 test("atmosphere and dark mode change visual tokens with no authorization impact",async({page})=>{
  await page.goto("/");
  await page.getByRole("button",{name:"Apply Daybreak atmosphere"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere","daybreak");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-atmosphere","daybreak");
  await page.getByRole("button",{name:"Switch to dark mode"}).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
 });
});
