import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export default async function middleware(request: NextRequest) {
  console.log("미들웨어 호출", request.nextUrl.href);
  const session = await auth();

  if (!session?.user) {
    //로그인되지 않은 경우
    return NextResponse.redirect(`${request.nextUrl.origin}/login`);
  }
  if (
    request.nextUrl.pathname.startsWith("/notice") &&
    session.user.type !== "adimin"
  ) {
    return NextResponse.redirect(`${request.nextUrl.origin}/`);
  }
}

export const config = {
  matcher: ["/:type/new"],
};
