import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['169.254.82.107'],
};
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
