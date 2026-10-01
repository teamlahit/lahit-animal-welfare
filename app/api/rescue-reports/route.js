import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RescueReport from '@/models/RescueReport';
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-api';
import { apiErrorResponse } from '@/lib/api-error';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImageSource } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

function isValidReportImage(image) {
  return !image || (image.startsWith('data:image/') && image.length <= 2_000_000);
}

export async function GET(request) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    if (new URL(request.url).searchParams.get('summary') === 'true') {
      const newCount = await RescueReport.countDocuments({ status: 'new' });
      return NextResponse.json({ success: true, data: { newCount } }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const reports = await RescueReport.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: reports }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const session = await getServerSession(authOptions);
    if (!isValidReportImage(body.image)) {
      return NextResponse.json({ success: false, error: 'Please upload a valid rescue photo smaller than 2 MB.' }, { status: 400 });
    }
    const uploadedImage = body.image
      ? await uploadImageSource(body.image, { folder: 'lahit/rescue-reports' })
      : null;
    const report = await RescueReport.create({
      reporterName: body.reporterName,
      reporterEmail: session?.user?.role === 'volunteer' ? session.user.email : body.reporterEmail || '',
      phone: body.phone,
      animalType: body.animalType || 'Other',
      location: body.location,
      description: body.description,
      image: uploadedImage?.secure_url || '',
    });
    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
