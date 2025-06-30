import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dhanji";

export function signJwt(payload: object, expiresIn = "1d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
