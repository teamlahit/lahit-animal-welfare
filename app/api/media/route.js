import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Media from '@/models/Media';
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-api';
import { apiErrorResponse } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    
    let query = {};
    if (type) {
      query.type = type;
    }
    
    const media = await Media.find(query).sort({ createdAt: -1 }).lean();
    const normalizedMedia = media.map((item) => ({
      ...item,
      category: ['hero', 'volunteer', 'rescue', 'animal', 'event', 'general', 'blog'].includes(item.category)
        ? item.category
        : /volunteer/i.test(item.filename) ? 'volunteer' : 'general',
    }));
    const filteredMedia = category
      ? normalizedMedia.filter((item) => item.category === category)
      : normalizedMedia;
    
    return NextResponse.json({ success: true, data: filteredMedia }, {
      headers: { 'Cache-Control': 'no-store, must-revalidate' }
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    const body = await request.json();
    const media = await Media.create(body);
    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
