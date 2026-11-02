/** Independent HTTPS product deployments. UI links do not transfer sessions. */
function trustedOrigin(raw:string|undefined,fallback:string):string{
  if(!raw)return fallback;
  try{
    const url=new URL(raw);
    if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash||
       (url.pathname!=="/"&&url.pathname!==""))return fallback;
    return url.origin;
  }catch{return fallback;}
}
export const productOrigins={
  home:trustedOrigin(process.env.NEXT_PUBLIC_KHANHOMES_URL,"https://khanhomes.vercel.app"),
  discover:trustedOrigin(process.env.NEXT_PUBLIC_KHANHOMES_DISCOVER_URL,"https://khanhomes-discovery.vercel.app"),
  build:trustedOrigin(process.env.NEXT_PUBLIC_KHANHOMES_BUILD_URL,"https://khanhomes-build.vercel.app")
} as const;
