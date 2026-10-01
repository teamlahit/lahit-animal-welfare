import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import Volunteer from '@/models/Volunteer';
import User from '@/models/User';
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-api';
import { apiErrorResponse } from '@/lib/api-error';
import { sendMail, isMailConfigured } from '@/lib/mailer';
import { createResetToken, getAppUrl } from '@/lib/password-reset';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    const { id } = await params;
    const volunteer = await Volunteer.findById(id).lean();
    if (!volunteer) {
      return NextResponse.json({ success: false, error: 'Volunteer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: volunteer });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PUT(request, { params }) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const volunteer = await Volunteer.findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true });
    if (!volunteer) {
      return NextResponse.json({ success: false, error: 'Volunteer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: volunteer });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

async function sendVolunteerInvite(volunteer, request) {
  const recipient = volunteer.email.trim().toLowerCase();
  const { token } = await createResetToken({ email: recipient, purpose: 'invite' });
  const appUrl = getAppUrl(request);
  const setNewPasswordLink = `${appUrl}/candidate/reset?token=${token}`;
  const loginLink = `${appUrl}/candidate/login/`;
  const name = volunteer.name?.trim() || 'volunteer';
  const safeName = name.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));

  let mailSent = false;
  let mailError = null;
  try {
    const result = await sendMail({
      to: recipient,
      subject: 'Welcome to LAHIT — set up your volunteer account',
      text: `Hello ${name},\n\nYour LAHIT volunteer application has been approved. Set a password to activate your volunteer account using this link:\n${setNewPasswordLink}\n\nThis link expires in 48 hours. After setting your password, sign in to your volunteer account here:\n${loginLink}\n\nIf you did not apply to volunteer with LAHIT, you can ignore this email.`,
      html: `<div style="margin:0;background:#f4f7f4;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#173f30"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2ebe4;border-radius:16px;padding:32px"><p style="margin:0 0 20px;color:#397254;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">LAHIT volunteer team</p><h1 style="margin:0 0 16px;font-size:24px;line-height:1.3">Welcome, ${safeName}!</h1><p style="font-size:16px;line-height:1.6">Your volunteer application has been approved. Set a password to activate your volunteer account.</p><p style="margin:28px 0"><a href="${setNewPasswordLink}" style="display:inline-block;border-radius:8px;background:#1d563d;padding:14px 22px;color:#ffffff;font-weight:700;text-decoration:none">Set your password</a></p><p style="font-size:14px;line-height:1.6;color:#52665a">This link expires in 48 hours. Once your password is set, you can <a href="${loginLink}" style="color:#1d563d">sign in to your volunteer account</a>.</p><p style="font-size:14px;line-height:1.6;color:#52665a">If you did not apply to volunteer with LAHIT, you can ignore this email.</p></div></div>`,
    });
    mailSent = !result?.dev;
  } catch (err) {
    console.error('Failed to notify volunteer:', err);
    mailError = err;
  }

  return { setNewPasswordLink, mailSent, mailError };
}

export async function PATCH(request, { params }) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (body?.action === 'approve') {
      const volunteer = await Volunteer.findById(id);
      if (!volunteer) {
        return NextResponse.json({ success: false, error: 'Volunteer not found' }, { status: 404 });
      }

      let user = await User.findOne({ email: volunteer.email });
      if (user && user.role !== 'volunteer') {
        return NextResponse.json({ success: false, error: 'This email already belongs to an admin account.' }, { status: 409 });
      }
      if (!user) {
        const temporaryPasswordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
        user = new User({
          name: volunteer.name,
          email: volunteer.email,
          password: temporaryPasswordHash,
          role: 'volunteer',
        });
        await user.save();
      }

      const { setNewPasswordLink, mailSent, mailError } = await sendVolunteerInvite(volunteer, request);

      if (mailError && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: false, error: 'The volunteer was not notified because email delivery failed.' }, { status: 502 });
      }

      if (volunteer.status !== 'approved') {
        volunteer.status = 'approved';
        await volunteer.save();
      }

      return NextResponse.json({
        success: true,
        data: {
          approved: true,
          email: volunteer.email,
          userRole: user.role,
          mailSent,
          ...(!isMailConfigured() && process.env.NODE_ENV !== 'production' ? { setNewPasswordLink } : {}),
        },
      });
    }

    if (body?.action === 'resend-invite') {
      const volunteer = await Volunteer.findById(id);
      if (!volunteer) {
        return NextResponse.json({ success: false, error: 'Volunteer not found' }, { status: 404 });
      }
      const existingUser = await User.findOne({ email: volunteer.email.trim().toLowerCase() });
      if (volunteer.status !== 'approved' || !existingUser || existingUser.role !== 'volunteer') {
        return NextResponse.json({ success: false, error: 'This volunteer has not been approved yet.' }, { status: 409 });
      }

      const { setNewPasswordLink, mailSent, mailError } = await sendVolunteerInvite(volunteer, request);
      if (mailError && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: false, error: 'Could not re-send the invitation email.' }, { status: 502 });
      }

      return NextResponse.json({
        success: true,
        data: {
          resent: true,
          email: volunteer.email,
          mailSent,
          ...(!isMailConfigured() && process.env.NODE_ENV !== 'production' ? { setNewPasswordLink } : {}),
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!(await requireAdmin())) return unauthorizedResponse();
    await connectDB();
    const { id } = await params;
    const volunteer = await Volunteer.findByIdAndDelete(id);
    if (!volunteer) {
      return NextResponse.json({ success: false, error: 'Volunteer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
