import { handlers } from "@/lib/auth";

export const GET = (req: any) => {
    console.log(`[Auth Route] GET ${req.url}`);
    return handlers.GET(req);
};
export const POST = (req: any) => {
    console.log(`[Auth Route] POST ${req.url}`);
    return handlers.POST(req);
};
