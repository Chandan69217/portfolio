import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
