import {test,expect} from "@playwright/test";
test.describe("KhanHomes Discover v0.7 Listing Atelier",()=>{
 test("local-only drafts save across reload and never publish anything",async({page,request})=>{
  await page.goto("/studio");
  await expect(page.getByRole("heading",{name:/Present a home with intention/})).toBeVisible();
  await expect(page.getByText(/No authorization is granted here/)).toBeVisible();
  await page.getByRole("button",{name:"Create first draft"}).click();
  await page.getByRole("textbox",{name:"Listing headline"}).fill("Harbour Court Apartment");
  await page.getByRole("combobox",{name:"County"}).selectOption("Mombasa");
  await page.getByRole("textbox",{name:"Neighborhood / area"}).fill("Nyali");
  await page.getByRole("spinbutton",{name:"Price (KES)"}).fill("45000");
  await page.getByRole("spinbutton",{name:"Floor area (m²)"}).fill("95");
  await page.getByRole("checkbox",{name:"Security"}).check();
  await page.getByRole("checkbox",{name:"Balcony"}).check();
  await page.getByRole("textbox",{name:/Description/}).fill("A clear and detailed general-area rental description, prepared for separate manager review. No personal resident data is provided.");
  await page.getByRole("textbox",{name:/Price and fee disclosures/}).fill("Price excludes utilities and any service charges, which need verification.");
  await page.getByRole("checkbox",{name:/identified the responsible authorized representative/}).check();
  await page.getByRole("checkbox",{name:/considered photo rights/}).check();
  await page.getByRole("checkbox",{name:/availability will be reconfirmed/}).check();
  await expect(page.getByRole("progressbar",{name:"Draft completeness"})).toHaveAttribute("aria-valuenow","100");
  await expect(page.getByText("DRAFT ONLY · NOT PUBLIC")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("textbox",{name:"Listing headline"})).toHaveValue("Harbour Court Apartment");
  await expect(page.getByRole("progressbar",{name:"Draft completeness"})).toHaveAttribute("aria-valuenow","100");
  await expect(page.getByText(/Public publishing is locked/)).toBeVisible();
  const downloadPromise=page.waitForEvent("download");
  await page.getByRole("button",{name:"Export draft JSON"}).click();
  const exported=await downloadPromise;
  expect(exported.suggestedFilename()).toMatch(/^khanhomes-discover-private-draft-[0-9a-f]{8}\.json$/);
  const listing=await request.get("/api/listings");
  expect(listing.ok()).toBe(true);
  const data=await listing.json() as {mode:string;listings:{title:string}[]};
  expect(data.mode).toBe("preview");
  expect(data.listings.some(x=>x.title==="Harbour Court Apartment")).toBe(false);
 });
 test("basic export privacy checker blocks obvious contact details",async({page})=>{
  await page.goto("/studio");
  await page.getByRole("button",{name:"Create first draft"}).click();
  await page.getByRole("textbox",{name:/Description/}).fill("Email example@private.com to book");
  await page.getByRole("button",{name:"Export draft JSON"}).click();
  await expect(page.locator(".atelier-error")).toContainText("Remove email addresses and phone numbers");
 });
 test("drafts can be duplicated and deleted while approval checks reset",async({page})=>{
  await page.goto("/studio");
  await page.getByRole("button",{name:"Create first draft"}).click();
  await page.getByRole("textbox",{name:"Listing headline"}).fill("A Private Sample Apartment");
  await page.getByRole("checkbox",{name:/identified the responsible authorized representative/}).check();
  await page.getByRole("button",{name:"Duplicate"}).click();
  await expect(page.locator(".atelier-draft-tab")).toHaveCount(2);
  await expect(page.getByRole("checkbox",{name:/identified the responsible authorized representative/})).not.toBeChecked();
  await page.getByRole("button",{name:"Delete"}).click();
  await expect(page.locator(".atelier-draft-tab")).toHaveCount(1);
 });
 test("Atelier remains compact, readable and unclipped on phones and desktops",async({page},info)=>{
  for(const width of [320,390,600,768,1024,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto("/studio");
   const header=page.locator(".site-header");
   const brand=await header.locator(".brand").boundingBox();
   const controls=await header.locator(".header-actions").boundingBox();
   expect(brand&&controls&&brand.x+brand.width<=controls.x+2,"Header brand and actions overlap at "+width).toBeTruthy();
   if(width===1440)await expect(header.locator(".desktop-nav")).toBeHidden();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   expect(overflow,"Atelier horizontal overflow at "+width).toBeLessThanOrEqual(2);
   await expect(page.getByRole("heading",{name:/Present a home with intention/})).toBeVisible();
   if(info.project.name==="desktop-chromium"&&[390,1440].includes(width)){
    await page.screenshot({path:"test-results/visual-audit/listing-atelier-"+width+".png",animations:"disabled"});
   }
  }
 });
});
