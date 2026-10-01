import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-api';
import { siteAssets } from '@/lib/site-assets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    const settings = await Settings.findOne().select('siteAssetOverrides').lean();
    return NextResponse.json({ success: true, data: settings?.siteAssetOverrides || [] }, {
      headers: { 'Cache-Control': 'no-store, must-revalidate' },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    const body = await request.json();
    if (!siteAssets.some((asset) => asset.url === body.sourceUrl)) {
      return NextResponse.json({ success: false, error: 'Site image not found.' }, { status: 404 });
    }
    if (body.replacementUrl && !/^https:\/\/res\.cloudinary\.com\//.test(body.replacementUrl)) {
      return NextResponse.json({ success: false, error: 'Upload a replacement image before saving.' }, { status: 400 });
    }
    const settings = await Settings.findOne() || await Settings.create({});
    const overrides = (settings.siteAssetOverrides || []).filter((asset) => asset.sourceUrl !== body.sourceUrl);
    if (body.replacementUrl) {
      overrides.push({
        sourceUrl: body.sourceUrl,
        replacementUrl: body.replacementUrl,
      });
    }
    settings.siteAssetOverrides = overrides;
    settings.updatedAt = new Date();
    await settings.save();
    return NextResponse.json({ success: true, data: settings.siteAssetOverrides });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
