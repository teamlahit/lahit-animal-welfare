import { PUBLIC_PATHS, SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const staticEntries = PUBLIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path === '/uttarkashi/' || path === '/animals/' || path === '/rescues/' ? 0.9 : 0.6,
  }));

  try {
    const [{ default: connectDB }, { default: Blog }, { default: Rescue }] = await Promise.all([
      import('@/lib/mongodb'),
      import('@/models/Blog'),
      import('@/models/Rescue'),
    ]);
    await connectDB();
    const [blogs, rescues] = await Promise.all([
      Blog.find({ published: true }, 'slug updatedAt').lean(),
      Rescue.find({ published: true }, '_id updatedAt').lean(),
    ]);

    return [
      ...staticEntries,
      ...blogs.map((blog) => ({
        url: `${SITE_URL}/blog/${blog.slug}/`,
        ...(blog.updatedAt ? { lastModified: blog.updatedAt } : {}),
        changeFrequency: 'monthly',
        priority: 0.7,
      })),
      ...rescues.map((rescue) => ({
        url: `${SITE_URL}/rescues/${rescue._id}/`,
        ...(rescue.updatedAt ? { lastModified: rescue.updatedAt } : {}),
        changeFrequency: 'monthly',
        priority: 0.7,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
