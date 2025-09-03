import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

  // Log the scan (QR code should already exist from creation)
  try {
    const { error: scanError } = await supabase
      .from('scans')
      .insert({
        qr_code_id: id,
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
      console.error('Failed to log scan:', scanError);
    }
  } catch (err) {
    console.error('Error in scan tracking:', err);
  }

  // Redirect to gpai.app
  return NextResponse.redirect('https://gpai.app', { status: 307 });
}