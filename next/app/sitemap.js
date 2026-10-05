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
    url: `https://www.deskinculture.com${route}`,
    lastModified: new Date(),
  }));
}