import { clearSessionResponse } from "@/lib/services/server/authSession";

export async function POST() {
  return clearSessionResponse();
}
