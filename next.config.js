/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                readline: false,
                path: false,
                os: false,
                crypto: false
            };
        }

        // Ignore fs module completely
        config.module.rules.push({
            test: /node_modules\/@nodelib\/fs\.scandir/,
            use: 'ignore-loader'
        });

        return config;
    },
    // Ensure proper routing
    experimental: {
        appDir: true
    }
};

module.exports = nextConfig;