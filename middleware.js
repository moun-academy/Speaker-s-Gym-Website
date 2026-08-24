import { next } from "@vercel/functions";

const PRIVATE_ROUTE = "/private/speakers-gym-program";
const USERNAME = "speaker";

function unauthorizedResponse() {
  return new Response("Private Speaker's Gym presentation. Authorization required.", {
    status: 401,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "WWW-Authenticate": 'Basic realm="Speaker\'s Gym Private Sales Call", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
    },
  });
}

export default function middleware(request) {
  const url = new URL(request.url);
  if (url.pathname !== PRIVATE_ROUTE) return next();

  const configuredPassword = process.env.SPEAKERS_GYM_SALES_PASSWORD;
  if (!configuredPassword) {
    return new Response("Private presentation access is not configured.", {
      status: 503,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
      },
    });
  }

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Basic ")) return unauthorizedResponse();

  try {
    const credentials = atob(authorization.slice(6));
    const separator = credentials.indexOf(":");
    const username = credentials.slice(0, separator);
    const password = credentials.slice(separator + 1);
    if (separator < 0 || username !== USERNAME || password !== configuredPassword) return unauthorizedResponse();
  } catch {
    return unauthorizedResponse();
  }

  return next({
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
    },
  });
}

export const config = {
  matcher: "/private/speakers-gym-program",
  runtime: "edge",
};
