import {z} from "zod";
export const listingReportSchema=z.object({
 reportId:z.string().uuid(),
 listingId:z.string().uuid(),
 reason:z.enum(["misleading","duplicate","privacy","suspicious","other"]),
 details:z.string().trim().min(20).max(600)
}).strict();
export type ListingReportInput=z.infer<typeof listingReportSchema>;
