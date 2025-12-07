/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'static.independent.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'www.petplate.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'future-mbbs.com',
      },
      {
        protocol: 'https',
        hostname: 'img.lovepik.com',
      },
      {
        protocol: 'https',
        hostname: 'www.nylabone.com',
      },
      {
        protocol: 'https',
        hostname: 'hips.hearstapps.com',
      },
    ],
    // Keep domains for backward compatibility (deprecated but still works)
    domains: [
      "res.cloudinary.com",
      "source.unsplash.com",
      "images.unsplash.com",
      "plus.unsplash.com",
      "static.independent.co.uk",
      "static.vecteezy.com",
      "images.pexels.com",
      "media.istockphoto.com",
      "www.petplate.com",
      "m.media-amazon.com",
      "future-mbbs.com",
      "img.lovepik.com",
      "www.nylabone.com",
      "hips.hearstapps.com",
    ],
  },
};

export default nextConfig;
