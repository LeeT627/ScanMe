import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    // Check if email exists in qr_emails table
    const { data: authorizedUser, error } = await supabase
      .from('qr_emails')
      .select('email, is_active')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error || !authorizedUser || !authorizedUser.is_active) {
      return NextResponse.json({ error: 'Unauthorized email' }, { status: 401 });
    }
    
    // Update last login time
    await supabase
      .from('qr_emails')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email.toLowerCase());
    
    // Create session token
    const sessionToken = crypto.randomUUID();
    
    // Store session (you might want to store this in database later)
    const response = NextResponse.json({ 
      success: true, 
      email: email 
    });
    
    // Set secure cookie
    response.cookies.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    response.cookies.set('auth-email', email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    return response;
  } catch (err) {
    console.error('Error during login:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}