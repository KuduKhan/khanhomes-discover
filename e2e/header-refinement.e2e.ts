import {test,expect} from "@playwright/test";
test("Discover Trinity v2 has a single integrated header with accessible local and product navigation",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/");
 const nav=page.getByRole("navigation",{name:"Primary"});
 await expect(nav.getByRole("link",{name:"Explore homes"})).toBeVisible();
 await nav.getByRole("button",{name:/More/}).click();
 await expect(nav.getByRole("link",{name:"Finance Desk"})).toBeVisible();
 const switcher=page.getByRole("navigation",{name:"KhanHomes product switcher"});
 await switcher.getByRole("button",{name:"Switch KhanHomes product"}).click();
 await expect(switcher.getByRole("link",{name:"KhanHomes Build"})).toHaveAttribute("href","https://khanhomes-build.vercel.app");
 await expect(page.getByRole("link",{name:"My account"}).first()).toHaveAttribute("href","/account");
 await expect(page.locator(".kh-family-strip")).toHaveCount(0);
});
test("Discover appearance, mobile menu and header geometry work at every size",async({page})=>{
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:850});await page.goto("/");
  await expect(page.getByRole("button",{name:"Open Appearance Studio"})).toBeVisible();
  const head=page.locator(".trinity-header");
  const brand=await head.locator(".trinity-brand").boundingBox();
  const actions=await head.locator(".trinity-actions").boundingBox();
  expect(brand&&actions&&brand.x+brand.width<=actions.x+2).toBeTruthy();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
 }
 await page.setViewportSize({width:390,height:850});await page.goto("/");
 await page.getByRole("button",{name:"Open navigation"}).click();
 await expect(page.getByRole("navigation",{name:"Mobile navigation"}).getByRole("link",{name:"Search watch"})).toBeVisible();
 await page.getByRole("button",{name:"Close navigation"}).click();
 await page.getByRole("button",{name:"Open Appearance Studio"}).click();
 await page.getByRole("button",{name:"Apply Daybreak atmosphere"}).click();
 await page.getByRole("button",{name:"Use dark mode"}).click();
 await page.reload();
 await expect(page.locator("html")).toHaveAttribute("data-atmosphere","daybreak");
 await expect(page.locator("html")).toHaveAttribute("data-theme","dark");
});
