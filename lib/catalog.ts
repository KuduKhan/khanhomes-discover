/**
 * Public-only listing fields. Never add resident, lease, owner identity,
 * access code, exact private address, financial ledger or private media URL.
 */
export type PropertyKind = "Apartment" | "Studio" | "Townhouse" | "Maisonette" | "Villa";
export type ListingType = "rent" | "sale";
export type ListingStatus = "preview" | "listing-reviewed" | "availability-confirmed";
export type Listing = {
  id: string; slug: string; title: string; area: string; county: string;
  kind: PropertyKind; type: ListingType; priceKes: number;
  beds: number; baths: number; sizeSqm: number; furnished: boolean;
  parking: boolean; amenities: string[]; description: string;
  images: string[]; status: ListingStatus; availability: "unknown" | "available" | "reserved";
  updatedAt: string; source: "demo" | "khanhomes";
};
const photo = (id: string) => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=1350&q=83";

/** Fictitious editorial fixtures only. No listing is available to rent or buy. */
export const PREVIEW_LISTINGS: Listing[] = [
  {id:"demo-001",slug:"jade-residences-kilimani",title:"Jade Residences",area:"Kilimani, Nairobi",county:"Nairobi",kind:"Apartment",type:"rent",priceKes:68000,beds:2,baths:2,sizeSqm:112,furnished:false,parking:true,amenities:["Balcony","Parking","Security","Lift"],description:"A light-filled contemporary residence with considered finishes, calm interiors and a welcoming layout for everyday living. Fictional concept property.",images:[photo("photo-1600585154340-be6161a56a0c"),photo("photo-1600566753086-00f18fb6b3ea"),photo("photo-1600607687939-ce8a6c25118c")],status:"preview",availability:"unknown",updatedAt:"2026-10-31",source:"demo"},
  {id:"demo-002",slug:"coastline-lofts-nyali",title:"Coastline Lofts",area:"Nyali, Mombasa",county:"Mombasa",kind:"Apartment",type:"rent",priceKes:48000,beds:2,baths:2,sizeSqm:104,furnished:true,parking:true,amenities:["Parking","Security","Balcony","Air conditioning"],description:"An airy coastal-inspired apartment with an open living area and a subtle palette. Fictional concept property.",images:[photo("photo-1600607687920-4e2a09cf159d"),photo("photo-1600566753190-17f0baa2a6c3")],status:"preview",availability:"unknown",updatedAt:"2026-10-31",source:"demo"},
  {id:"demo-003",slug:"garden-court-kileleshwa",title:"Garden Court",area:"Kileleshwa, Nairobi",county:"Nairobi",kind:"Townhouse",type:"rent",priceKes:125000,beds:3,baths:3,sizeSqm:190,furnished:false,parking:true,amenities:["Garden","Parking","Security","Pet friendly"],description:"A spacious townhouse concept centered on natural light and warm, timeless materials. Fictional concept property.",images:[photo("photo-1600047509807-ba8f99d2cdde"),photo("photo-1600210492486-724fe5c67fb0")],status:"preview",availability:"unknown",updatedAt:"2026-10-31",source:"demo"},
  {id:"demo-004",slug:"luma-studios-westlands",title:"Luma Studios",area:"Westlands, Nairobi",county:"Nairobi",kind:"Studio",type:"rent",priceKes:35000,beds:0,baths:1,sizeSqm:42,furnished:true,parking:false,amenities:["Lift","Security","Furnished","Internet ready"],description:"A compact studio concept where storage, natural light and purposeful design work in harmony. Fictional concept property.",images:[photo("photo-1600607688969-a5bfcd646154"),photo("photo-1600607687920-4e2a09cf159d")],status:"preview",availability:"unknown",updatedAt:"2026-10-31",source:"demo"},
  {id:"demo-005",slug:"ridgeview-residence-karen",title:"Ridgeview Residence",area:"Karen, Nairobi",county:"Nairobi",kind:"Villa",type:"sale",priceKes:48500000,beds:4,baths:4,sizeSqm:320,furnished:false,parking:true,amenities:["Garden","Parking","Security","Terrace"],description:"A considered family villa concept with generous indoor-outdoor flow. Fictional concept property; not offered for sale.",images:[photo("photo-1600596542815-ffad4c1539a9"),photo("photo-1600566752355-35792bedcfea")],status:"preview",availability:"unknown",updatedAt:"2026-10-31",source:"demo"},
  {id:"demo-006",slug:"olive-house-milimani",title:"Olive House",area:"Milimani, Kisumu",county:"Kisumu",kind:"Maisonette",type:"rent",priceKes:57000,beds:3,baths:2,sizeSqm:155,furnished:false,parking:true,amenities:["Parking","Garden","Security"],description:"An inviting multilevel home concept with a flexible layout for family life. Fictional concept property.",images:[photo("photo-1600585152915-d208bec867a1"),photo("photo-1600607687644-c7171b42498f")],status:"preview",availability:"unknown",updatedAt:"2026-10-31",source:"demo"},
  {id:"demo-007",slug:"skyline-one-upperhill",title:"Skyline One",area:"Upper Hill, Nairobi",county:"Nairobi",kind:"Apartment",type:"sale",priceKes:16400000,beds:2,baths:2,sizeSqm:121,furnished:false,parking:true,amenities:["Lift","Parking","Security","Gym"],description:"A modern city apartment concept with streamlined proportions. Fictional concept property; not offered for sale.",images:[photo("photo-1600607687920-4e2a09cf159d"),photo("photo-1600566753086-00f18fb6b3ea")],status:"preview",availability:"unknown",updatedAt:"2026-10-31",source:"demo"},
  {id:"demo-008",slug:"marina-mews-bamburi",title:"Marina Mews",area:"Bamburi, Mombasa",county:"Mombasa",kind:"Apartment",type:"rent",priceKes:28000,beds:1,baths:1,sizeSqm:62,furnished:false,parking:true,amenities:["Parking","Security","Balcony"],description:"An easygoing coastal apartment concept with practical, compact living spaces. Fictional concept property.",images:[photo("photo-1600607687920-4e2a09cf159d"),photo("photo-1600210492486-724fe5c67fb0")],status:"preview",availability:"unknown",updatedAt:"2026-10-31",source:"demo"}
];
export const PREVIEW_NOTICE = "Illustrative previews only · Not real properties, offers, prices or availability";
export const formatKes = (value:number) => "KES " + new Intl.NumberFormat("en-KE",{maximumFractionDigits:0}).format(value);
export const statusText = (status:ListingStatus) => status==="preview"?"Concept preview":status==="listing-reviewed"?"Listing reviewed":"Availability confirmed";
