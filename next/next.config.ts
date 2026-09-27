import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const customerRoutes = [
      "about",
      "blogs",
      "booking",
      "consultation",
      "contact",
      "gallery",
      "newsletter",
      "packages",
      "services",
      "shipping-returns",
      "store",
    ];

    const customerRouteRedirects = customerRoutes.map((route) => ({
      source: `/${route}/:path*`,
      destination: `/customer/${route}/:path*`,
      permanent: true,
    }));

    const apiRouteRedirects = [
      ["/api/product/:path*", "/api/customers/product/:path*"],
      ["/api/products/:path*", "/api/customers/products/:path*"],
      ["/api/services/:path*", "/api/customers/services/:path*"],
      ["/api/cart/:path*", "/api/customers/cart/:path*"],
      ["/api/bookings/:path*", "/api/customers/bookings/:path*"],
      ["/api/user/:path*", "/api/admin/user/:path*"],
      ["/api/upload/:path*", "/api/admin/upload/:path*"],
      ["/api/delete/:path*", "/api/admin/delete/:path*"],
      ["/api/auth/:path*", "/api/shared/auth/:path*"],
    ].map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));

    return [...customerRouteRedirects, ...apiRouteRedirects];
  },
};

export default nextConfig;
