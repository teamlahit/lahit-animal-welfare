import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { siteAssets } from '@/lib/site-assets';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { path = [] } = await params;
  const sourceUrl = `/${path.join('/')}`;
  if (!siteAssets.some((asset) => asset.url === sourceUrl)) {
    return NextResponse.json({ success: false, error: 'Site image not found.' }, { status: 404 });
  }

  try {
    await connectDB();
    const settings = await Settings.findOne().select('siteAssetOverrides').lean();
    const replacement = settings?.siteAssetOverrides?.find((asset) => asset.sourceUrl === sourceUrl)?.replacementUrl;
    const response = NextResponse.redirect(new URL(replacement || sourceUrl, request.url));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    return NextResponse.redirect(new URL(sourceUrl, request.url));
  }
}
