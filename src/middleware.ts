import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":", 1)[0]?.toLowerCase();

  if (host === "3dinspire.com.br") {
    const canonical = request.nextUrl.clone();
    canonical.protocol = "https:";
    canonical.hostname = "www.3dinspire.com.br";
    canonical.port = "";
    return NextResponse.redirect(canonical, 308);
  }

  const response = NextResponse.next();
  if (host?.endsWith(".up.railway.app")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}
