import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authEmail = request.cookies.get('auth-email');
    
    if (!authEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { qrId } = await request.json();
    
    // Get user's UUID from qr_emails table
    const { data: userData, error: userError } = await supabase
      .from('qr_emails')
      .select('id')
      .eq('email', authEmail.value)
      .single();
    
    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Delete QR code (only if it belongs to this user)
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', qrId)
      .eq('user_id', userData.id);
    
    if (error) {
      console.error('Failed to delete QR code:', error);
      return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting QR code:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}