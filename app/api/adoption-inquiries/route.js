import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Animal from '@/models/Animal';
import AdoptionInquiry from '@/models/AdoptionInquiry';
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-api';
import { apiErrorResponse } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    if (new URL(request.url).searchParams.get('summary') === 'true') {
      const newCount = await AdoptionInquiry.countDocuments({ status: 'new' });
      return NextResponse.json({ success: true, data: { newCount } }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const inquiries = await AdoptionInquiry.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: inquiries }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const animal = await Animal.findOneAndUpdate(
      { _id: body.animalId, published: true, status: 'available' },
      { status: 'pending', updatedAt: new Date() },
      { returnDocument: 'after' }
    );
    if (!animal) {
      return NextResponse.json({ success: false, error: 'This animal is no longer available for adoption.' }, { status: 404 });
    }

    try {
      const inquiry = await AdoptionInquiry.create({
        animal: animal._id,
        animalName: animal.name,
        applicantName: body.applicantName,
        email: body.email,
        phone: body.phone,
        location: body.location,
        homeType: body.homeType,
        experience: body.experience || '',
        message: body.message || '',
      });
      return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
    } catch (error) {
      await Animal.findOneAndUpdate(
        { _id: animal._id, status: 'pending' },
        { status: 'available', updatedAt: new Date() }
      );
      throw error;
    }
  } catch (error) {
    return apiErrorResponse(error);
  }
}
