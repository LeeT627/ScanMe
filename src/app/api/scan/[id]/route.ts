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
    'US_Shirt_logo': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Boston': 'b2c3d4e5-f678-90ab-cdef-123456789012',
    'New_York': 'c3d4e5f6-7890-abcd-ef12-345678901234',
    'US_Brochure': 'd4e5f678-90ab-cdef-1234-567890123456'
  };

  const qrUuid = qrIdMapping[id] || id; // Use mapping or assume it's already a UUID

  // Create Supabase server client
  const supabase = await createClient();

  // First, fetch the QR code to get the destination URL
  const { data: qrCode, error: fetchError } = await supabase
    .from('qr_codes')
    .select('destination_url')
    .eq('id', qrUuid)
    .single();

  if (fetchError || !qrCode) {
    console.error('QR code not found or fetch error:', fetchError);
    return new NextResponse('QR code not found', { status: 404 });
  }

  // Log the scan and increment counter in parallel
  try {
    const [scanResult, incrementResult] = await Promise.all([
      supabase.from('scans').insert({
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
        utm_campaign: utmCampaign,
      }),
      supabase.rpc('increment_scan_count', { qr_id: qrUuid }),
    ]);

    if (incrementResult.error) {
      console.error('Failed to increment scan count:', incrementResult.error);
      // Not returning an error to the user, as the primary action is the redirect
    }

    if (scanResult.error) {
      console.error('Failed to log scan:', scanResult.error);
      // Not returning an error to the user for the same reason
    }
  } catch (err) {
    console.error('Error in scan tracking:', err);
    // Allow redirect to proceed even if logging fails
  }

  // Redirect to the destination URL
  return NextResponse.redirect(qrCode.destination_url, { status: 307 });
}