import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Get client IP from headers - Vercel sets these
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const country = request.headers.get('x-vercel-ip-country') || 'unknown';
  const city = request.headers.get('x-vercel-ip-city') || 'unknown';
  const region = request.headers.get('x-vercel-ip-region') || 'unknown';
  const timezone = request.headers.get('x-vercel-ip-timezone') || 'unknown';
  const referrer = request.headers.get('referer') || 'unknown';
  
  // Extract UTM parameters
  const url = new URL(request.url);
  const utmSource = url.searchParams.get('utm_source');
  const utmMedium = url.searchParams.get('utm_medium');
  const utmCampaign = url.searchParams.get('utm_campaign');

  // Map friendly IDs to UUIDs
  const qrIdMapping: { [key: string]: string } = {
    'US_Shirt_logo': '4595b130-654b-43c8-b452-63e5df312e5f',
    'Boston': 'b2c3d4e5-f678-90ab-cdef-123456789012',
    'New_York': 'c3d4e5f6-7890-abcd-ef12-345678901234',
    'US_Brochure': '1251af31-b4ea-41f6-aa2d-9877f7e5b28a'
  };

  const qrUuid = qrIdMapping[id] || id; // Use mapping or assume it's already a UUID

  // Create Supabase server client
  const supabase = await createClient();

  // Log the scan and increment counter
  console.log(`[SCAN] Processing QR scan - ID: ${id}, UUID: ${qrUuid}`);
  
  try {
    // First, increment the scan count for this QR code
    const { error: updateError } = await supabase.rpc('increment_scan_count', {
      qr_id: qrUuid
    });

    if (updateError) {
      console.error('[SCAN ERROR] Failed to increment scan count:', updateError);
      console.error('[SCAN ERROR] Details:', JSON.stringify(updateError));
    } else {
      console.log('[SCAN SUCCESS] Incremented count for:', qrUuid);
    }

    // Log the scan details
    const { error: scanError } = await supabase
      .from('scans')
      .insert({
        qr_code_id: qrUuid,
        ip_address: ip,
        user_agent: userAgent,
        country: country,
        city: city,
        region: region,
        timezone: timezone,
        referrer: referrer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      });

    if (scanError) {
      console.error('[SCAN ERROR] Failed to log scan:', scanError);
      console.error('[SCAN ERROR] Scan details:', JSON.stringify(scanError));
    } else {
      console.log('[SCAN SUCCESS] Logged scan for:', qrUuid);
    }
  } catch (err) {
    console.error('Error in scan tracking:', err);
  }

  // Fetch the redirect URL from the qr_codes table
  try {
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('destination_url')
      .eq('id', qrUuid)
      .single();

    if (error) {
      console.error('[REDIRECT ERROR] Failed to fetch redirect URL:', error);
      // Fallback to a default URL if there's an error
      return NextResponse.redirect('https://gpai.app', { status: 307 });
    }

    if (qrCode && qrCode.destination_url) {
      console.log(`[REDIRECT] Redirecting to: ${qrCode.destination_url}`);
      return NextResponse.redirect(qrCode.destination_url, { status: 307 });
    } else {
      console.warn(`[REDIRECT WARN] No destination_url found for QR code: ${qrUuid}. Redirecting to default.`);
      // Fallback if no URL is found
      return NextResponse.redirect('https://gpai.app', { status: 307 });
    }
  } catch (err) {
    console.error('Error fetching redirect URL:', err);
    // Fallback in case of any other error
    return NextResponse.redirect('https://gpai.app', { status: 307 });
  }
}