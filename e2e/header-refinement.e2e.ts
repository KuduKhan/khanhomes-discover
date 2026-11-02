import {test,expect} from "@playwright/test";
test("Discover uses one app-local navigation and one cross-product switcher",async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto("/");
 const nav=page.getByRole("navigation",{name:"Primary"});
 await expect(nav.getByRole("link",{name:"Explore homes"})).toBeVisible();
 await expect(nav.getByText("More tools")).toBeVisible();
 await nav.getByText("More tools").click();
 await expect(nav.getByRole("link",{name:"Finance Desk"})).toBeVisible();
 await expect(page.getByRole("navigation",{name:"KhanHomes product switcher"})).toHaveCount(1);
 await expect(page.getByRole("link",{name:"My account"}).first()).toHaveAttribute("href","/account");
});
test("Discover keeps its appearance studio and responsive mobile navigation",async({page})=>{
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:850});await page.goto("/");
  await expect(page.getByRole("button",{name:"Apply Daybreak atmosphere"})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(2);
 }
 await page.setViewportSize({width:390,height:850});
 await page.getByRole("button",{name:"Open navigation"}).click();
 await expect(page.getByRole("navigation",{name:"Mobile navigation"}).getByRole("link",{name:/Search watch/})).toBeVisible();
});
