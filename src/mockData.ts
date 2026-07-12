import {
  MembershipPlan,
  Employee,
  Member,
  Subscription,
  PrivateSession,
  AmenityType,
  AmenityQuota,
  AmenityUsageLog,
  AttendanceLog,
  FinanceTransaction
} from './types';

export const INITIAL_AMENITY_TYPES: AmenityType[] = [
  { id: 'sauna', name_en: 'Sauna Room', name_ar: 'غرفة الساونا', icon: 'Flame' },
  { id: 'jacuzzi', name_en: 'Jacuzzi Pool', name_ar: 'حمام الجاكوزي', icon: 'Waves' },
  { id: 'steam', name_en: 'Steam Bath', name_ar: 'حمام البخار', icon: 'CloudSnow' },
  { id: 'inbody', name_en: 'In-Body Analysis', name_ar: 'تحليل مكونات الجسم InBody', icon: 'Activity' },
  { id: 'fitness', name_en: 'VIP Lounge & Fitness', name_ar: 'صالات فيتنس VIP', icon: 'Dumbbell' }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-101', name: 'الكابتن أحمد حسن (Trainer)', role: 'trainer' },
  { id: 'emp-102', name: 'الكابتن رامي صبري (Trainer)', role: 'trainer' },
  { id: 'emp-103', name: 'أ. سارة مجدي (Receptionist)', role: 'receptionist' },
  { id: 'emp-104', name: 'أ. محمد علي (Manager)', role: 'manager' },
  { id: 'emp-105', name: 'الكابتن مها سمير (Trainer)', role: 'trainer' }
];

export const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: 'plan-gym-1m',
    name: 'اشتراك الجيم العادي - شهر',
    type: 'gym',
    duration_months: 1,
    price: 600
  },
  {
    id: 'plan-gym-3m',
    name: 'اشتراك الجيم العادي - 3 شهور',
    type: 'gym',
    duration_months: 3,
    price: 1500
  },
  {
    id: 'plan-private-3m',
    name: 'الباقة الخاصة البريميوم - 3 شهور (Private)',
    type: 'private',
    duration_months: 3,
    price: 4500,
    sessions_count: 24,
    amenities_quotas: {
      sauna: 12,
      jacuzzi: 12,
      steam: 12,
      inbody: 3
    }
  },
  {
    id: 'plan-private-6m',
    name: 'الباقة الخاصة الملكية VIP - 6 شهور (Private)',
    type: 'private',
    duration_months: 6,
    price: 8500,
    sessions_count: 48,
    amenities_quotas: {
      sauna: 30,
      jacuzzi: 30,
      steam: 30,
      inbody: 6,
      fitness: 24
    }
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-001',
    name: 'يوسف أحمد السقا',
    phone: '01023456789',
    barcode: '908486401',
    card_id: 'CARD-901',
    photo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=250',
    weight: 85,
    height: 180,
    age: 26,
    joined_date: '2026-01-10'
  },
  {
    id: 'mem-002',
    name: 'عمرو سليمان غانم',
    phone: '01145678901',
    barcode: '908486402',
    card_id: 'CARD-902',
    photo_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=250',
    weight: 74,
    height: 172,
    age: 22,
    joined_date: '2026-03-15'
  },
  {
    id: 'mem-003',
    name: 'نور الدين مصطفى',
    phone: '01278901234',
    barcode: '908486403',
    card_id: 'CARD-903',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    weight: 92,
    height: 185,
    age: 31,
    joined_date: '2026-05-01'
  },
  {
    id: 'mem-004',
    name: 'شيرين مجدي الألفي',
    phone: '01598765432',
    barcode: '908486404',
    card_id: 'CARD-904',
    photo_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=250',
    weight: 62,
    height: 165,
    age: 25,
    joined_date: '2026-06-20'
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-001',
    member_id: 'mem-001',
    plan_id: 'plan-private-3m',
    start_date: '2026-05-15',
    end_date: '2026-08-15',
    status: 'active',
    payment_status: 'paid',
    amount_paid: 4500
  },
  {
    id: 'sub-002',
    member_id: 'mem-002',
    plan_id: 'plan-gym-1m',
    start_date: '2026-07-01',
    end_date: '2026-08-01',
    status: 'active',
    payment_status: 'paid',
    amount_paid: 600
  },
  {
    id: 'sub-003',
    member_id: 'mem-003',
    plan_id: 'plan-private-6m',
    start_date: '2026-06-01',
    end_date: '2026-12-01',
    status: 'active',
    payment_status: 'partial',
    amount_paid: 5000 // Out of 8500
  },
  {
    id: 'sub-004',
    member_id: 'mem-004',
    plan_id: 'plan-gym-3m',
    start_date: '2026-04-10',
    end_date: '2026-07-10',
    status: 'expired',
    payment_status: 'paid',
    amount_paid: 1500
  }
];

export const INITIAL_PRIVATE_SESSIONS: PrivateSession[] = [
  {
    id: 'ps-001',
    subscription_id: 'sub-001',
    trainer_id: 'emp-101',
    total_sessions: 24,
    used_sessions: 9
  },
  {
    id: 'ps-003',
    subscription_id: 'sub-003',
    trainer_id: 'emp-102',
    total_sessions: 48,
    used_sessions: 14
  }
];

export const INITIAL_AMENITY_QUOTAS: AmenityQuota[] = [
  // For sub-001 (Youssef - Private 3M)
  { id: 'aq-001', subscription_id: 'sub-001', amenity_type_id: 'sauna', total_allowed: 12, used_count: 3 },
  { id: 'aq-002', subscription_id: 'sub-001', amenity_type_id: 'jacuzzi', total_allowed: 12, used_count: 5 },
  { id: 'aq-003', subscription_id: 'sub-001', amenity_type_id: 'steam', total_allowed: 12, used_count: 2 },
  { id: 'aq-004', subscription_id: 'sub-001', amenity_type_id: 'inbody', total_allowed: 3, used_count: 1 },

  // For sub-003 (Nour - Private 6M)
  { id: 'aq-005', subscription_id: 'sub-003', amenity_type_id: 'sauna', total_allowed: 30, used_count: 12 },
  { id: 'aq-006', subscription_id: 'sub-003', amenity_type_id: 'jacuzzi', total_allowed: 30, used_count: 10 },
  { id: 'aq-007', subscription_id: 'sub-003', amenity_type_id: 'steam', total_allowed: 30, used_count: 4 },
  { id: 'aq-008', subscription_id: 'sub-003', amenity_type_id: 'inbody', total_allowed: 6, used_count: 2 },
  { id: 'aq-009', subscription_id: 'sub-003', amenity_type_id: 'fitness', total_allowed: 24, used_count: 8 }
];

export const INITIAL_AMENITY_LOGS: AmenityUsageLog[] = [
  { id: 'al-001', quota_id: 'aq-001', usage_date: '2026-06-15 17:30', recorded_by_employee_id: 'emp-103' },
  { id: 'al-002', quota_id: 'aq-001', usage_date: '2026-06-22 18:00', recorded_by_employee_id: 'emp-103' },
  { id: 'al-003', quota_id: 'aq-001', usage_date: '2026-07-02 19:15', recorded_by_employee_id: 'emp-103' },

  { id: 'al-004', quota_id: 'aq-002', usage_date: '2026-06-10 16:00', recorded_by_employee_id: 'emp-103' },
  { id: 'al-005', quota_id: 'aq-002', usage_date: '2026-06-15 18:00', recorded_by_employee_id: 'emp-103' },
  { id: 'al-006', quota_id: 'aq-002', usage_date: '2026-06-25 17:45', recorded_by_employee_id: 'emp-103' },
  { id: 'al-007', quota_id: 'aq-002', usage_date: '2026-07-01 20:00', recorded_by_employee_id: 'emp-104' },
  { id: 'al-008', quota_id: 'aq-002', usage_date: '2026-07-09 19:30', recorded_by_employee_id: 'emp-103' }
];

export const INITIAL_ATTENDANCE_LOGS: AttendanceLog[] = [
  { id: 'at-001', member_id: 'mem-001', check_in_time: '2026-07-10 15:30', type: 'check_in' },
  { id: 'at-002', member_id: 'mem-001', check_in_time: '2026-07-10 16:00', type: 'session', details: 'حصة تدريب مع كابتن أحمد حسن' },
  { id: 'at-003', member_id: 'mem-002', check_in_time: '2026-07-11 10:15', type: 'check_in' },
  { id: 'at-004', member_id: 'mem-003', check_in_time: '2026-07-11 14:00', type: 'check_in' },
  { id: 'at-005', member_id: 'mem-001', check_in_time: '2026-07-11 15:45', type: 'amenity', details: 'استخدام حمام الجاكوزي' }
];

export const INITIAL_FINANCE: FinanceTransaction[] = [
  {
    id: 'ft-001',
    member_id: 'mem-001',
    subscription_id: 'sub-001',
    amount: 4500,
    date: '2026-05-15',
    payment_method: 'instapay',
    type: 'subscription'
  },
  {
    id: 'ft-002',
    member_id: 'mem-002',
    subscription_id: 'sub-002',
    amount: 600,
    date: '2026-07-01',
    payment_method: 'cash',
    type: 'subscription'
  },
  {
    id: 'ft-003',
    member_id: 'mem-003',
    subscription_id: 'sub-003',
    amount: 5000,
    date: '2026-06-01',
    payment_method: 'card',
    type: 'subscription'
  },
  {
    id: 'ft-004',
    member_id: 'mem-004',
    subscription_id: 'sub-004',
    amount: 1500,
    date: '2026-04-10',
    payment_method: 'cash',
    type: 'subscription'
  }
];

// LocalStorage helpers
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`fitbot_gym_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`fitbot_gym_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage', error);
  }
};
