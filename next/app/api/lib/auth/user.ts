import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../jwt";
import { UserModel } from "../models/user";

export async function requireUser(request: NextRequest) {
  const token = request.cookies.get("user_token")?.value;
  if (!token) throw new Error("AUTHENTICATION_REQUIRED");

  const secret = getJwtSecret(process.env.ADMIN_JWT_SECRET as string);
  const decoded = jwt.verify(token, secret);

  if (!decoded || typeof decoded !== "object" || typeof decoded.id !== "number") {
    throw new Error("INVALID_AUTHENTICATION");
  }

  const users = await UserModel.findUserById(decoded.id);
  const user = users[0];
  if (!user) throw new Error("USER_NOT_FOUND");

  return user;
}
