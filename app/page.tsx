import {DiscoveryExperience} from "@/components/discover-experience";
import {getPublicCatalog} from "@/lib/public-catalog";
export const dynamic="force-dynamic";
export default async function HomePage(){
 const catalog=await getPublicCatalog();
 return <DiscoveryExperience catalog={catalog}/>;
}
