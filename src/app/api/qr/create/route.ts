import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authToken = request.cookies.get('auth-token');
    const authEmail = request.cookies.get('auth-email');
    
    if (!authToken || !authEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id, name } = await request.json();
    
    // First get the user's UUID from qr_emails table
    const { data: userData, error: userError } = await supabase
      .from('qr_emails')
      .select('id')
      .eq('email', authEmail.value)
      .single();
    
    if (userError || !userData) {
      console.error('Failed to find user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Create QR code in database with proper user_id UUID
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        id: id,
        user_id: userData.id, // Use the UUID from qr_emails table
        name: name,
        destination_url: 'https://gpai.app',
        scan_count: 0
      })
      .select()
      .single();
    
    if (!error) {
      // Increment QR count for this email
      const { data: user } = await supabase
        .from('qr_emails')
        .select('total_qr_created')
        .eq('email', authEmail.value)
        .single();
      
      if (user) {
        await supabase
          .from('qr_emails')
          .update({ total_qr_created: (user.total_qr_created || 0) + 1 })
          .eq('email', authEmail.value);
      }
    }

    if (error) {
      console.error('Failed to create QR code:', error);
      return NextResponse.json({ error: 'Failed to create QR code' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error creating QR code:', err);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}