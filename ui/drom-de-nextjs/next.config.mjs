/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        ppr: 'incremental',  /* ppr is the Partial Pre Rendering feature, enabled for specific routes */
    },
};

export default nextConfig;
