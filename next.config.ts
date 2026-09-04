import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Belt-and-suspenders: make sure the Prisma query engine binaries are
  // always bundled into every route's serverless function, regardless of
  // whether Next's automatic file tracing picks them up on its own.
  outputFileTracingIncludes: {
    "/*": ["node_modules/.prisma/client/**/*", "node_modules/@prisma/client/**/*"],
  },
};

export default nextConfig;
