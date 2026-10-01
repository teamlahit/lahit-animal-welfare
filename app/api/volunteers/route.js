import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Volunteer from '@/models/Volunteer';
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-api';
import { apiErrorResponse } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    if (new URL(request.url).searchParams.get('summary') === 'true') {
      const pendingCount = await Volunteer.countDocuments({ status: 'pending' });
      return NextResponse.json({ success: true, data: { pendingCount } }, {
        headers: { 'Cache-Control': 'no-store, must-revalidate' },
      });
    }
    const volunteers = await Volunteer.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: volunteers });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const interests = (Array.isArray(body.interest) ? body.interest : [body.interest])
      .filter(Boolean)
      .map((interest) => String(interest).trim())
      .filter(Boolean);
    if (interests.length === 0) {
      return NextResponse.json({ success: false, error: 'Select at least one area of interest.' }, { status: 400 });
    }
    const volunteer = await Volunteer.create({
      name: body.name,
      email: body.email?.trim().toLowerCase(),
      phone: body.phone,
      location: body.location,
      interest: interests,
      message: body.message || '',
    });
    return NextResponse.json({ success: true, data: volunteer }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
