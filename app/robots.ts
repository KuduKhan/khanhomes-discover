import type {MetadataRoute} from "next";
/** Preview-only release: fictional properties must not enter public search indexes. */
export default function robots():MetadataRoute.Robots{
 return {rules:{userAgent:"*",disallow:"/"}};
}
