"use client";
import {createClient,type SupabaseClient} from "@supabase/supabase-js";
let client:SupabaseClient|null=null;
/** Separate Discover authentication authority, never the KhanHomes operations project. */
export function discoverAccountsConfigured():boolean{
 return process.env.NEXT_PUBLIC_DISCOVER_ACCOUNTS_ENABLED==="true"&&
  Boolean(process.env.NEXT_PUBLIC_DISCOVER_SUPABASE_URL&&process.env.NEXT_PUBLIC_DISCOVER_SUPABASE_PUBLISHABLE_KEY);
}
export function getDiscoverBrowserClient():SupabaseClient{
 if(!discoverAccountsConfigured())throw new Error("Discover accounts are not enabled");
 if(!client)client=createClient(
  process.env.NEXT_PUBLIC_DISCOVER_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_DISCOVER_SUPABASE_PUBLISHABLE_KEY!,
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:"kh-discover-seeker-session-v1"}}
 );
 return client;
}
