const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

/** @type {import('next').NextConfig | ((phase: string) => import('next').NextConfig)} */
module.exports = (phase) => ({
  // A production build must not replace chunks used by a running dev server.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  images: {
    unoptimized: true,
  },
});
