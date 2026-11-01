import {expect,test} from "@playwright/test";
test.describe("Finance Desk v0.8",()=>{
 test("uses user-adjustable assumptions and does not request financing",async({page})=>{
  await page.goto("/finance");
  await expect(page.getByRole("heading",{name:/Make your next move/i})).toBeVisible();
  await expect(page.getByText(/No application · No credit check/)).toBeVisible();
  await expect(page.getByText(/ESTIMATED MONTHLY MORTGAGE/)).toBeVisible();
  await page.getByLabel("Annual mortgage interest (%)").fill("0");
  await page.getByLabel("Illustrative purchase price (KES)").fill("1200000");
  await page.getByLabel("Down payment (%)").fill("0");
  await page.getByLabel("Loan term (years)").fill("10");
  await expect(page.locator(".finance-metric-main strong")).toContainText("10,000");
  await page.getByRole("button",{name:/Additional fees and rental assumptions/}).click();
  await page.getByLabel("Alternative monthly rent (KES)").fill("25000");
  await expect(page.locator(".finance-comparison")).toContainText("KES 350,000");
  // First-year rent cash includes 12 months, a 1-month deposit, and moving allowance.
  await page.getByRole("button",{name:"Reset"}).click();
  await expect(page.getByLabel("Down payment (%)")).toHaveValue("20");
 });
 test("compact mobile layout never overflows horizontally",async({page})=>{
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:850});
   await page.goto("/finance");
   await expect(page.getByRole("heading",{name:/Make your next move/i})).toBeVisible();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   expect(overflow,"Overflow at width "+width).toBeLessThanOrEqual(2);
  }
 });
});
