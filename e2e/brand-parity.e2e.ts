import {expect,test} from "@playwright/test";

test("Discover uses the KhanHomes family mark and remains connected to Build",async({page})=>{
 await page.goto("/");
 await expect(page.locator("header .brand .kh-emblem")).toBeVisible();
 await expect(page.locator("header .kh-emblem")).toHaveAttribute("src","/brand/khanhomes-mark.svg");
 await expect(page.getByRole("navigation",{name:"KhanHomes links"}).getByRole("link",{name:/KhanHomes Build/i})).toHaveAttribute("href",/\/build$|^https:\/\//);
});

test("Discover cross-product switcher preserves brand and fits mobile to desktop",async({page})=>{
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto("/");
  if(width>=1121){
   const tabs=page.getByRole("navigation",{name:"KhanHomes products",exact:true});
   await expect(tabs).toBeVisible();
   await expect(tabs.getByRole("link",{name:"KhanHomes",exact:true})).toHaveAttribute("href","https://khanhomes.vercel.app");
   await expect(tabs.getByRole("link",{name:"Build",exact:true})).toHaveAttribute("href","https://khanhomes-build.vercel.app");
   await expect(tabs.getByRole("link",{name:"Discover",exact:true})).toHaveAttribute("aria-current","page");
  }else{
   const nav=page.getByRole("navigation",{name:"KhanHomes product switcher"});
   await expect(nav).toBeVisible();
   await nav.getByRole("button",{name:"Switch KhanHomes product"}).click();
   await expect(nav.getByRole("link",{name:"KhanHomes management"})).toHaveAttribute("href","https://khanhomes.vercel.app");
   await expect(nav.getByRole("link",{name:"KhanHomes Build"})).toHaveAttribute("href","https://khanhomes-build.vercel.app");
   await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  expect(overflow,"Discovery overflow at "+width).toBeLessThanOrEqual(2);
 }
});
