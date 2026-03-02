import { NextResponse, type NextRequest } from "next/server";
import auth from "./app/lib/proxy/auth";
import headlessBrowserCheck from "./app/lib/proxy/headless-browser-check";

export async function proxy(req: NextRequest) {
  const headlessResponse = headlessBrowserCheck(req);
  if (headlessResponse) return headlessResponse;

  const authResponse = await auth(req);
  if (authResponse) return authResponse;

  return NextResponse.next({
    request: { headers: req.headers },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
