import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel's Next.js adapter manages deployment output; standalone output is
  // reserved for self-hosted builds.
  output: process.env.VERCEL ? undefined : "standalone",

  async redirects() {
    const apiRouteRedirects = [
      ["/api/user/:path*", "/api/admin/user/:path*"],
      ["/api/upload/:path*", "/api/admin/upload/:path*"],
      ["/api/delete/:path*", "/api/admin/delete/:path*"],
      ["/api/auth/:path*", "/api/shared/auth/:path*"],
    ].map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));

    return [
      ...apiRouteRedirects,
      {
        source: "/admin/customers",
        destination: "/admin/users",
        permanent: true,
      },
      {
        source: "/admin/customers/:path*",
        destination: "/admin/users/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
