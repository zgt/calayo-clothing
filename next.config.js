module.exports = {
    images: {
      remotePatterns: [
        {
            protocol: 'https',
            hostname: '**.cdninstagram.com',
            port: '',
            pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'https://f6ska5bq6kil7j2r.public.blob.vercel-storage.com',
          port: ''
        },
        {
          protocol: 'https',
          hostname: '**.googleusercontent.com',
          port: '',
          pathname: '/**',
        }
      ],
    },
    async redirects() {
      return [
        {
          source: '/',
          destination: '/home',
          permanent: true,
        },
      ]
    },
  }