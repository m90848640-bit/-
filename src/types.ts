/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MembershipType = 'gym' | 'private';

export interface MembershipPlan {
  id: string;
  name: string;
  type: MembershipType;
  duration_months: number;
  price: number;
  sessions_count?: number; // private only
  amenities_quotas?: {
    [amenityId: string]: number; // e.g., 'sauna' -> 4
  };
}

export interface Employee {
  id: string;
  name: string;
  role: 'trainer' | 'receptionist' | 'manager';
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  barcode: string;
  card_id: string;
  photo_url?: string;
  weight?: number;
  height?: number;
  age?: number;
  joined_date: string;
}

export interface Subscription {
  id: string;
  member_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'pending';
  payment_status: 'paid' | 'partial' | 'unpaid';
  amount_paid: number;
}

export interface PrivateSession {
  id: string;
  subscription_id: string;
  trainer_id: string;
  total_sessions: number;
  used_sessions: number;
}

export interface AmenityType {
  id: string;
  name_en: string;
  name_ar: string;
  icon: string; // Lucide icon name
}

export interface AmenityQuota {
  id: string;
  subscription_id: string;
  amenity_type_id: string;
  total_allowed: number;
  used_count: number;
}

export interface AmenityUsageLog {
  id: string;
  quota_id: string;
  usage_date: string;
  recorded_by_employee_id: string;
}

export interface AttendanceLog {
  id: string;
  member_id: string;
  check_in_time: string;
  type: 'check_in' | 'session' | 'amenity';
  details?: string;
}

export interface FinanceTransaction {
  id: string;
  member_id: string;
  subscription_id: string;
  amount: number;
  date: string;
  payment_method: 'cash' | 'card' | 'instapay' | 'bank_transfer';
  type: 'subscription' | 'session_renew' | 'amenity_buy';
}

export interface NavigationState {
  view: 'home' | 'member_profile' | 'subscription_details' | 'amenity_detail' | 'finance_dashboard' | 'settings_plans' | 'new_member' | 'attendance_list';
  params?: {
    memberId?: string;
    subscriptionId?: string;
    amenityId?: string;
  };
}
