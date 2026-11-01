"use client";
import {useEffect,useState} from "react";
import {Heart} from "lucide-react";
export function SaveHomeButton({id}:{id:string}){
 const [saved,setSaved]=useState(false);
 useEffect(()=>{try{const x=JSON.parse(localStorage.getItem("kh-discovery-saved-v1")||"[]") as unknown;setSaved(Array.isArray(x)&&x.includes(id));}catch{}},[id]);
 const toggle=()=>{
  try{
   const raw=JSON.parse(localStorage.getItem("kh-discovery-saved-v1")||"[]") as unknown;
   const current=Array.isArray(raw)?raw.filter((x):x is string=>typeof x==="string"):[];
   const next=saved?current.filter(x=>x!==id):[...current,id];
   localStorage.setItem("kh-discovery-saved-v1",JSON.stringify(next));
  }catch{}
  setSaved(!saved);
 };
 return <button type="button" className={"detail-save"+(saved?" is-saved":"")} aria-pressed={saved} onClick={toggle}><Heart size={18} fill={saved?"currentColor":"none"}/>{saved?"Saved home":"Save this home"}</button>;
}
