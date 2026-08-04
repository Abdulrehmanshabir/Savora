import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://savora-restaurant.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/menu',
          '/menu/*',
          '/reservation',
          '/offers',
          '/about',
          '/contact',
          '/reviews',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/checkout',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
