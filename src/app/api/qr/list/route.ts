import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authEmail = request.cookies.get('auth-email');
    
    if (!authEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's UUID from qr_emails table
    const { data: userData, error: userError } = await supabase
      .from('qr_emails')
      .select('id')
      .eq('email', authEmail.value)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get all QR codes for this user
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select(`
        id,
        name,
        destination_url,
        scan_count,
        created_at
      `)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch QR codes:', error);
      return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 });
    }
    
    return NextResponse.json({ qrCodes });
  } catch (err) {
    console.error('Error fetching QR codes:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}