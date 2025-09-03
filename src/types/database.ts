export interface QRCode {
  id: string;
  user_id: string;
  name: string;
  destination_url: string;
  created_at: string;
  scan_count: number;
}

export interface Scan {
  id: number;
  qr_code_id: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  device_type?: string;
  created_at: string;
  referrer?: string;
  language?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  university?: string;
  local_time?: string;
}