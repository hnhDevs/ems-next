import { NextRequest } from "next/server";
import { verifyJwt } from "./jwt";

export function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  return verifyJwt(token);
}
