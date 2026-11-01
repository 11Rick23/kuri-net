import { handleAgentDetectionRequest } from "@/features/tools/ai-detector/server/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	return handleAgentDetectionRequest(request);
}
