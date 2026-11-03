import {test,expect} from "@playwright/test";

test.describe("Discover existing-feature excellence v0.8.1",()=>{
 test("saved homes update the existing notebook in another tab",async({page,context})=>{
  await page.goto("/");
  const notebook=await context.newPage();
  await notebook.goto("/planner");
  await expect(notebook.locator(".planner-home-tab")).toHaveCount(0);
  await page.getByRole("button",{name:/^Save /}).first().click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem("kh-discovery-saved-v1")??"[]").length))
   .toBe(1);
  await expect(notebook.locator(".planner-home-tab")).toHaveCount(1);
  await notebook.close();
 });
 test("saved searches update the existing watchboard across tabs",async({page,context})=>{
  await page.goto("/");
  const watch=await context.newPage();
  await watch.goto("/watch");
  await expect(watch.locator(".watch-entry")).toHaveCount(0);
  await page.getByRole("button",{name:"Save search",exact:true}).click();
  await page.getByRole("textbox",{name:"Name this search"}).fill("Coastal family search");
  await page.getByRole("button",{name:"Save locally"}).click();
  await expect(watch.locator(".watch-entry")).toHaveCount(1);
  await watch.close();
 });
 test("local listing drafts synchronize without publishing",async({page,context})=>{
  await page.goto("/studio");
  const second=await context.newPage();
  await second.goto("/studio");
  await expect(second.locator(".atelier-draft-tab")).toHaveCount(0);
  await page.getByRole("button",{name:"Create new listing draft"}).click();
  await expect(second.locator(".atelier-draft-tab")).toHaveCount(1);
  await expect(second.getByText("Public publishing is locked.")).toBeVisible();
  await second.close();
 });
 test("Finance Desk never claims a zero income share before income is entered",async({page})=>{
  await page.goto("/finance");
  const income=page.getByRole("spinbutton",{name:/Monthly take-home income/i});
  await income.fill("0");
  await expect(page.locator(".finance-share-track")).toHaveCount(0);
  await expect(page.getByText(/Enter a monthly income to calculate this ratio/i)).toBeVisible();
  await income.fill("100000");
  await expect(page.locator(".finance-share-track")).toHaveCount(1);
 });
 test("tentative visits reject exact duplicate plans without actual booking",async({page})=>{
  await page.goto("/visits");
  const editor=page.getByRole("form",{name:"Add a tentative viewing plan"});
  await editor.getByLabel("Date",{exact:true}).fill("2027-02-10");
  await editor.getByLabel("Local time (EAT)").fill("10:00");
  await editor.getByRole("button",{name:"Add tentative plan"}).click();
  await expect(page.locator(".visit-row")).toHaveCount(1);
  await editor.getByRole("button",{name:"Add tentative plan"}).click();
  await expect(page.getByText(/already has a tentative visit at the selected time/i)).toBeVisible();
  await expect(page.locator(".visit-row")).toHaveCount(1);
 });
 test("all existing public workspaces fit at standard widths",async({page})=>{
  test.setTimeout(200000);
  for(const width of [320,375,768,1024,1440]){
   await page.setViewportSize({width,height:840});
   for(const route of ["/","/match","/visits","/planner","/watch","/studio","/finance"]){
    await page.goto(route);
    const dims=await page.evaluate(()=>({
     scroll:document.documentElement.scrollWidth,
     view:document.documentElement.clientWidth
    }));
    expect(dims.scroll,route+" at "+width+"px").toBeLessThanOrEqual(dims.view+2);
   }
  }
 });
});
