import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Media from '@/models/Media';
import Settings from '@/models/Settings';
import { apiErrorResponse } from '@/lib/api-error';
import { PUBLIC_CACHE_CONTROL } from '@/lib/cache-headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne().select('heroImages').lean();
    const media = await Media.find({ type: 'image' })
      .select('filename url alt category createdAt')
      .sort({ createdAt: 1 })
      .lean();
    const normalizedMedia = media.map((item) => ({
      ...item,
      category: ['hero', 'volunteer'].includes(item.category)
        ? item.category
        : /volunteer/i.test(item.filename)
          ? 'volunteer'
          : 'unused',
    }));
    const volunteerImages = normalizedMedia.filter((item) => item.category === 'volunteer');

    return NextResponse.json({
      success: true,
      data: {
        hero: Array.isArray(settings?.heroImages)
          ? settings.heroImages
          : normalizedMedia.filter((item) => item.category === 'hero'),
        heroConfigured: Array.isArray(settings?.heroImages),
        volunteer: volunteerImages.at(-1) || null,
      },
    }, { headers: { 'Cache-Control': PUBLIC_CACHE_CONTROL } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
