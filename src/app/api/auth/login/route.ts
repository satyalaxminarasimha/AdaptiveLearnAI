import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { withApiTiming } from '@/lib/api-timing';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  return withApiTiming('POST /api/auth/login', async () => {
    try {
      await dbConnect();

    const { email, password, role } = await request.json();

    const normalizedEmail = String(email || '').trim();

    // Fetch only fields needed during authentication to reduce query cost.
    const user = await User.findOne({ email: normalizedEmail })
      .select([
        '_id',
        'name',
        'email',
        'role',
        'isApproved',
        'avatarUrl',
        'rollNo',
        'batch',
        'section',
        'branch',
        'semester',
        'department',
        'expertise',
        'phoneNumber',
        'password',
      ].join(' '))
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if approved
    if (!user.isApproved) {
      return NextResponse.json(
        { error: 'Account not approved yet. Please wait for admin approval.' },
        { status: 403 }
      );
    }

    if (role && role !== user.role) {
      return NextResponse.json(
        { error: `This account is registered as a ${user.role}. Please select the matching role.` },
        { status: 403 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _password, ...userWithoutPassword } = user;

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

    // Set HTTP-only cookie for middleware authentication
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

      return response;
    } catch (error) {
      console.error('Login error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}