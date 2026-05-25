export interface User {
  id: number;
  name: string;
  mobile: string;
  email: string;
  age: number;
  gender: string;
  area: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type AdGate = "login" | "otp_request";

export interface AdWatchPayload {
  gate: AdGate;
  campaign_id: number;
  campaign_name: string;
  user_mobile: string;
  user_name: string;
  personalized_title: string;
  description: string;
  image_url: string;
  creative_url: string;
  creative_type: string;
  min_watch_seconds: number;
}

export interface SendOtpResponse {
  masked_mobile: string;
  expires_in: number;
  message: string;
  otp_for_screen?: string | null;
  sms_preview?: string | null;
}

export interface Campaign {
  id: number;
  name: string;
  title_template: string;
  description: string;
  image_url: string;
  creative_url: string;
  creative_type: string;
  min_watch_seconds: number;
  promo_suffix: string;
  priority: number;
  is_active: boolean;
}

export interface CampaignRecommendation {
  id: number;
  name: string;
  personalized_title: string;
}

export interface TokenLink {
  token: string;
  user_id: number;
  user_name: string;
  url: string;
}

export interface AnalyticsRow {
  event_type: string;
  count: number;
}
