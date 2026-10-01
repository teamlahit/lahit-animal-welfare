import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-api';
import { uploadImageSource } from '@/lib/cloudinary';
import { PUBLIC_CACHE_CONTROL } from '@/lib/cache-headers';
import { siteAssets } from '@/lib/site-assets';

export const dynamic = 'force-dynamic';

function isValidDisplayImage(value = '') {
  if (value.startsWith('data:image/')) return value.length <= 2_000_000;
  try {
    return new URL(value).hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne().lean();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        siteName: 'LAHIT - Animal Welfare',
        siteDescription: 'Helping animals in Uttarakhand',
        contactEmail: 'contact@lahit.org',
        contactPhone: '',
        address: '',
        facebook: '',
        instagram: '',
        youtube: '',
        maintenanceMode: false
      });
    }
    
    return NextResponse.json({ success: true, data: settings }, {
      headers: { 'Cache-Control': PUBLIC_CACHE_CONTROL }
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
    if (Array.isArray(body.instagramPosts)) {
      if (body.instagramPosts.length > 9) {
        return NextResponse.json({ success: false, error: 'A maximum of 9 homepage Instagram cards is allowed.' }, { status: 400 });
      }
      if (body.instagramPosts.some((post) => !isValidDisplayImage(post.image))) {
        return NextResponse.json({ success: false, error: 'Every Instagram card needs a valid display image, not an Instagram page link.' }, { status: 400 });
      }
      const totalImageSize = body.instagramPosts.reduce((size, post) => size + post.image.length, 0);
      if (totalImageSize > 10_000_000) {
        return NextResponse.json({ success: false, error: 'Instagram display images are too large. Remove cards or use smaller images.' }, { status: 400 });
      }
      body.instagramPosts = await Promise.all(body.instagramPosts.map(async (post) => {
        const uploadedImage = post.image.startsWith('data:image/')
          ? await uploadImageSource(post.image, { folder: 'lahit/instagram' })
          : null;
        return {
          id: post.id,
          image: uploadedImage?.secure_url || post.image,
          caption: String(post.caption || '').trim(),
          postUrl: String(post.postUrl || '').trim(),
        };
      }));
    }
    if (Array.isArray(body.heroImages)) {
      if (body.heroImages.length > 8) {
        return NextResponse.json({ success: false, error: 'The homepage carousel supports up to 8 images.' }, { status: 400 });
      }
      if (body.heroImages.some((image) => (
        !image || typeof image.url !== 'string'
        || !((image.url.startsWith('/') && !image.url.startsWith('//')) || /^https:\/\/res\.cloudinary\.com\//.test(image.url))
      ))) {
        return NextResponse.json({ success: false, error: 'Each hero image must be a site asset or an uploaded image.' }, { status: 400 });
      }
      body.heroImages = body.heroImages.map((image) => ({
        url: image.url,
        alt: String(image.alt || '').trim().slice(0, 300),
      }));
    }
    if (Array.isArray(body.siteAssetOverrides)) {
      const allowedUrls = new Set(siteAssets.map((asset) => asset.url));
      if (body.siteAssetOverrides.some((asset) => (
        !allowedUrls.has(asset.sourceUrl)
        || !/^https:\/\/res\.cloudinary\.com\//.test(asset.replacementUrl || '')
      ))) {
        return NextResponse.json({ success: false, error: 'A site image replacement is invalid.' }, { status: 400 });
      }
      body.siteAssetOverrides = body.siteAssetOverrides.map((asset) => ({
        sourceUrl: asset.sourceUrl,
        replacementUrl: asset.replacementUrl,
      }));
    }
    body.updatedAt = new Date();
    
    let settings = await Settings.findOne();
    
    if (settings) {
      settings = await Settings.findByIdAndUpdate(settings._id, body, { returnDocument: 'after', runValidators: true });
    } else {
      settings = await Settings.create(body);
    }
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
