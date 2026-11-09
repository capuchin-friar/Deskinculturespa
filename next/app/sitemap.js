import { absoluteUrl } from "./api/shared/config";

export default function sitemap() {
  const routes = [
    "",
    "/about",
    "/blogs",
    "/booking",
    "/consultation",
    "/contact",
    "/gallery",
    "/newsletter",
    "/packages",
    "/services",
    "/shipping-returns",
    "/store",
  ];

  return routes.map((route) => ({
    url: absoluteUrl(route || "/"),
    lastModified: new Date(),
  }));
}
