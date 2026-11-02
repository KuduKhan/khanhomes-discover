import {expect,test} from "@playwright/test";

test("Discover uses the KhanHomes family mark and remains connected to Build",async({page})=>{
 await page.goto("/");
 await expect(page.locator("header .brand .kh-emblem")).toBeVisible();
 await expect(page.locator("header .kh-emblem")).toHaveAttribute("src","/brand/khanhomes-mark.svg");
 await expect(page.getByRole("navigation",{name:"KhanHomes links"}).getByRole("link",{name:/KhanHomes Build/i})).toHaveAttribute("href",/\/build$|^https:\/\//);
});
