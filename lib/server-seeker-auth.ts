/** Dedicated backend-only Supabase Auth verification. Never read browser preferences as authorization. */
import {discoveryClient,discoveryBackendConfigured} from "./public-catalog";
export function privateRequestsEnabled():boolean{
 return process.env.DISCOVER_ENABLE_PRIVATE_REQUESTS==="true"&&discoveryBackendConfigured();
}
export async function authenticatedSeeker(request:Request):Promise<{id:string}|null>{
 const header=request.headers.get("authorization")??"";
 const bearer=header.match(/^Bearer ([A-Za-z0-9._~-]{40,4096})$/);
 if(!bearer||!privateRequestsEnabled())return null;
 try{
  const {data:{user},error}=await discoveryClient().auth.getUser(bearer[1]);
  if(error||!user?.id||!user.email_confirmed_at)return null;
  return {id:user.id};
 }catch{return null;}
}
