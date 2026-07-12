import React, { useState, useMemo, useEffect } from 'react';
import {
  Member,
  Subscription,
  PrivateSession,
  AmenityQuota,
  AmenityUsageLog,
  AmenityType,
  Employee,
  AttendanceLog,
  MembershipPlan
} from '../types';
import {
  ChevronLeft,
  Calendar,
  Flame,
  Waves,
  Activity,
  CloudSnow,
  Dumbbell,
  CheckCircle,
  Clock,
  User,
  Plus,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Info,
  ShieldCheck,
  UserCheck,
  Edit2,
  Save,
  Lock
} from 'lucide-react';

interface ProfileViewProps {
  member: Member;
  subscription: Subscription | null;
  plan: MembershipPlan | null;
  privateSession: PrivateSession | null;
  amenityQuotas: AmenityQuota[];
  amenityUsageLogs: AmenityUsageLog[];
  amenityTypes: AmenityType[];
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  onCheckIn: (type: 'check_in' | 'session' | 'amenity', details?: string) => void;
  onIncrementSession: (subscriptionId: string, trainerId: string) => void;
  onIncrementAmenity: (subscriptionId: string, amenityTypeId: string, employeeId: string) => void;
  onBackToSearch: () => void;
  onUpdateMember?: (updatedMember: Member) => void;
}

type SubViewType = 'profile_home' | 'subscription_details' | 'amenity_detail' | 'edit_profile';

export default function ProfileView({
  member,
  subscription,
  plan,
  privateSession,
  amenityQuotas,
  amenityUsageLogs,
  amenityTypes,
  employees,
  attendanceLogs,
  onCheckIn,
  onIncrementSession,
  onIncrementAmenity,
  onBackToSearch,
  onUpdateMember
}: ProfileViewProps) {
  // Navigation stack state
  const [navigationStack, setNavigationStack] = useState<SubViewType[]>(['profile_home']);
  const [selectedAmenityId, setSelectedAmenityId] = useState<string | null>(null);
  const [selectedRecorderId, setSelectedRecorderId] = useState<string>(employees[0]?.id || 'emp-103');

  // Phone visibility state
  const [showPhone, setShowPhone] = useState(false);

  // Profile Edit states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWeight, setEditWeight] = useState(80);
  const [editHeight, setEditHeight] = useState(175);
  const [editAge, setEditAge] = useState(25);
  const [editBarcode, setEditBarcode] = useState('');
  const [editCardId, setEditCardId] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  useEffect(() => {
    if (member) {
      const parts = member.name.trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEditPhone(member.phone || '');
      setEditWeight(member.weight || 82);
      setEditHeight(member.height || 178);
      setEditAge(member.age || 26);
      setEditBarcode(member.barcode || '');
      setEditCardId(member.card_id || '');
      setEditPhotoUrl(member.photo_url || '');
    }
  }, [member]);

  const currentSubView = useMemo(() => {
    return navigationStack[navigationStack.length - 1];
  }, [navigationStack]);

  // Listen for barcode scans while editing profile
  useEffect(() => {
    const handleBarcodeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      if (code && currentSubView === 'edit_profile') {
        setEditBarcode(code);
        setEditCardId(`CARD-${code.slice(-4).toUpperCase()}`);
      }
    };
    window.addEventListener('barcode-scanned', handleBarcodeEvent);
    return () => {
      window.removeEventListener('barcode-scanned', handleBarcodeEvent);
    };
  }, [currentSubView]);

  const handlePushView = (view: SubViewType, amenityId: string | null = null) => {
    if (amenityId) {
      setSelectedAmenityId(amenityId);
    }
    setNavigationStack((prev) => [...prev, view]);
  };

  const handlePopView = () => {
    if (navigationStack.length > 1) {
      setNavigationStack((prev) => prev.slice(0, prev.length - 1));
    } else {
      onBackToSearch();
    }
  };

  const currentSubscriptionQuotas = useMemo(() => {
    if (!subscription) return [];
    return amenityQuotas.filter((q) => q.subscription_id === subscription.id);
  }, [subscription, amenityQuotas]);

  const selectedAmenityDetails = useMemo(() => {
    if (!selectedAmenityId || !subscription) return null;
    
    const quota = currentSubscriptionQuotas.find((q) => q.amenity_type_id === selectedAmenityId);
    const type = amenityTypes.find((t) => t.id === selectedAmenityId);
    
    if (!quota || !type) return null;

    // Get logs for this quota
    const logs = amenityUsageLogs
      .filter((l) => l.quota_id === quota.id)
      .sort((a, b) => new Date(b.usage_date).getTime() - new Date(a.usage_date).getTime());

    return { quota, type, logs };
  }, [selectedAmenityId, subscription, currentSubscriptionQuotas, amenityTypes, amenityUsageLogs]);

  // Amenity icon helper
  const renderAmenityIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case 'Flame': return <Flame className={className} />;
      case 'Waves': return <Waves className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'CloudSnow': return <CloudSnow className={className} />;
      case 'Dumbbell': return <Dumbbell className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Remaining days helper
  const daysRemaining = useMemo(() => {
    if (!subscription) return 0;
    const end = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  const isActive = subscription && subscription.status === 'active' && daysRemaining > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative min-h-[500px] flex flex-col justify-between">
      <div>
        {/* Navigation / Header bar */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-6">
          <button
            onClick={handlePopView}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>رجوع | Back</span>
          </button>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono">مسار الشاشات Stack: {navigationStack.join(' ➔ ')}</span>
          </div>
        </div>

        {/* ----------------- SUBVIEW 1: PROFILE HOME ----------------- */}
        {currentSubView === 'profile_home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Member Details Summary Banner */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-right">
                <img
                  src={member.photo_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=250'}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/20"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5 font-sans justify-center md:justify-start">
                    <span>الهاتف: {showPhone ? member.phone : member.phone.replace(/(\d{3})\d+(\d{2})/, "$1••••••$2")}</span>
                    <button
                      type="button"
                      onClick={() => setShowPhone(!showPhone)}
                      className="p-1 hover:text-white transition-colors cursor-pointer text-slate-500"
                      title={showPhone ? "إخفاء رقم الهاتف" : "إظهار رقم الهاتف كامل"}
                    >
                      {showPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <span className="mx-1 text-slate-700">|</span>
                    <span>باركود: {member.barcode}</span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap justify-center md:justify-start gap-1.5">
                    <span className="bg-slate-900 text-cyan-400 text-[10px] px-2.5 py-1 rounded font-mono border border-slate-800">العمر: {member.age || 26}</span>
                    <span className="bg-slate-900 text-yellow-400 text-[10px] px-2.5 py-1 rounded font-mono border border-slate-800">الوزن: {member.weight || 82} كجم</span>
                    <span className="bg-slate-900 text-emerald-400 text-[10px] px-2.5 py-1 rounded font-mono border border-slate-800">الطول: {member.height || 178} سم</span>
                  </div>
                  
                  {/* Edit Profile CTA button */}
                  <div className="mt-3 flex justify-center md:justify-start">
                    <button
                      onClick={() => handlePushView('edit_profile')}
                      className="bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 font-bold px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>تعديل بيانات العضو | Edit Profile</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-left">
                <span className="text-[10px] text-slate-500 font-mono">حالة الاشتراك الإجمالية</span>
                {subscription ? (
                  <div className="text-right">
                    <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {isActive ? '● اشتراك نشط' : '● اشتراك منتهي'}
                    </span>
                    <p className="text-xs text-slate-300 font-medium mt-1.5">{plan?.name}</p>
                  </div>
                ) : (
                  <span className="text-xs font-bold px-3 py-1 bg-slate-800 text-slate-400 rounded-full border border-slate-700">لا يوجد اشتراك</span>
                )}
              </div>
            </div>

            {/* Attendance & Stats summary for the Member */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gym Attendance Logs Card */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-3 border-b border-slate-800 pb-2 flex justify-between items-center">
                  <span>سجل حضور البوابات اليومي</span>
                  <span className="text-xs text-cyan-400 font-normal">Attendance Logs</span>
                </h4>
                
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {attendanceLogs.filter(log => log.member_id === member.id && log.type === 'check_in').length > 0 ? (
                    attendanceLogs
                      .filter(log => log.member_id === member.id && log.type === 'check_in')
                      .map((log) => (
                        <div key={log.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex justify-between items-center text-xs">
                          <span className="text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>تسجيل دخول ناجح</span>
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">{log.check_in_time}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-center text-xs text-slate-500 py-6 italic">لم يسجل العضو حضور بالبوابة حتى الآن.</p>
                  )}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-2 border-b border-slate-800 pb-2 flex justify-between">
                    <span>إجراءات الحسابات السريعة</span>
                    <span>Quick Controls</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    من هنا يمكنك الدخول في عمق عدادات الاستهلاك، الحصص للمدرب الخاص، وحمامات الاسترخاء.
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handlePushView('subscription_details')}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
                  >
                    <span>الدخول لتفاصيل الاشتراك والعدادات (الجاكوزي/الساونا/المدرب)</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SUBVIEW 2: SUBSCRIPTION DETAILS ----------------- */}
        {currentSubView === 'subscription_details' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Plan Info Banner */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-5 rounded-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${plan?.type === 'private' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                    اشتراك من نوع: {plan?.type === 'private' ? 'خاص ومرافق مخصصة (Private VIP)' : 'عضوية الجيم العادية (Gym Plan)'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{plan?.name}</h3>
                </div>

                <div className="text-right sm:text-left">
                  <p className="text-xs text-slate-400">المدة: <strong className="text-white">{plan?.duration_months} شهور</strong></p>
                  <p className="text-xs text-slate-400">حالة الصلاحية: <strong className={`${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>{isActive ? `${daysRemaining} يوم متبقي` : 'منتهي الصلاحية'}</strong></p>
                </div>
              </div>

              {/* Common Subscription Info for both Gym and Private */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">تاريخ البداية</span>
                  <strong className="text-slate-200 font-mono">{subscription?.start_date}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">تاريخ النهاية</span>
                  <strong className="text-slate-200 font-mono">{subscription?.end_date}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">المبلغ المدفوع</span>
                  <strong className="text-emerald-400 font-mono">{subscription?.amount_paid} EGP</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">حالة الدفع</span>
                  <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] ${
                    subscription?.payment_status === 'paid' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {subscription?.payment_status === 'paid' ? 'مدفوع بالكامل' : 'مدفوع جزئياً'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trainer Recording Selection (To know who records the session or amenity usage) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 mb-2">موظف الاستقبال أو المدرب المسؤول عن تسجيل الحركة حالياً:</label>
              <select
                value={selectedRecorderId}
                onChange={(e) => setSelectedRecorderId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role === 'trainer' ? 'مدرب' : emp.role === 'receptionist' ? 'استقبال' : 'مدير'})
                  </option>
                ))}
              </select>
            </div>

            {/* DUAL MODE CHECK: IF GYM OR PRIVATE */}
            {plan?.type === 'gym' ? (
              /* GYM ONLY SCREEN - Clean and tailored */
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Info className="w-5 h-5" />
                  <h4 className="font-bold text-white text-sm">تفاصيل شاشة العضوية العادية (Gym Member Screen)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  هذا العضو مسجل على عضوية جيم عادية بدون حصص تدريب خاصة أو مرافق استرخاء إضافية.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">سجل الحضور اليومي</span>
                    <strong className="block text-2xl text-cyan-400 font-mono mt-1">
                      {attendanceLogs.filter(log => log.member_id === member.id && log.type === 'check_in').length}
                    </strong>
                    <span className="text-[10px] text-slate-500">حضور مسجل بالبوابة هذا الشهر</span>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">إجراء سريع</span>
                    <button
                      disabled={!isActive}
                      onClick={() => onCheckIn('check_in', 'تسجيل دخول من بوابات الجيم - استقبال')}
                      className={`text-xs font-bold py-1.5 px-4 rounded ${
                        isActive 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' 
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      تسجيل حضور بوابات
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* PRIVATE ONLY SCREEN - Complex variables */
              <div className="space-y-6">
                {/* 1. Private Sessions Counter Block */}
                <div className="bg-slate-950 p-5 rounded-xl border border-purple-500/15">
                  <h4 className="text-sm font-bold text-white mb-3 flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <UserCheck className="w-4 h-4" />
                      <span>حصص التدريب الخاصة مع المدرب (Trainer Sessions)</span>
                    </span>
                    <span className="text-xs text-slate-500">Private Coaching</span>
                  </h4>

                  {privateSession ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>المدرب المسؤول:</span>
                          <strong className="text-slate-200">
                            {employees.find(e => e.id === privateSession.trainer_id)?.name || 'كابتن الجيم المختص'}
                          </strong>
                        </div>
                        
                        {/* Progress slider bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>الحصص المستهلكة مقابل الإجمالي:</span>
                            <span className="font-mono text-purple-400 font-bold">
                              {privateSession.used_sessions} / {privateSession.total_sessions} حصة
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${(privateSession.used_sessions / privateSession.total_sessions) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                            <span>المتبقي: {privateSession.total_sessions - privateSession.used_sessions} حصص</span>
                            <span>نسبة الاستهلاك: {Math.round((privateSession.used_sessions / privateSession.total_sessions) * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Log session action */}
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center flex flex-col justify-center items-center">
                        <span className="text-[10px] text-slate-400">تسجيل حضور حصة خاصة</span>
                        <button
                          disabled={privateSession.used_sessions >= privateSession.total_sessions}
                          onClick={() => onIncrementSession(subscription.id, privateSession.trainer_id)}
                          className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-1.5 px-4 rounded text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>خصم حصة تدريب</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-rose-400">لم يتم ربط حصص تدريب خاصة بالباقة المشتراة بعد.</p>
                  )}
                </div>

                {/* 2. Amenity Quotas grid - Custom circular/dials trackers */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white flex justify-between items-center">
                    <span className="text-cyan-400">عدادات استخدام المرافق الاسترخائية (Amenity Quotas)</span>
                    <span className="text-xs text-slate-500">منظومة عدادات الاستهلاك الشاملة</span>
                  </h4>

                  {currentSubscriptionQuotas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentSubscriptionQuotas.map((quota) => {
                        const amenityType = amenityTypes.find((t) => t.id === quota.amenity_type_id);
                        if (!amenityType) return null;

                        const percent = Math.min(100, Math.round((quota.used_count / quota.total_allowed) * 100));

                        return (
                          <div
                            key={quota.id}
                            className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-all flex justify-between items-center"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                {renderAmenityIcon(amenityType.icon)}
                              </div>
                              <div>
                                <h5 className="font-bold text-white text-xs">{amenityType.name_ar}</h5>
                                <p className="text-[10px] text-slate-500">{amenityType.name_en}</p>
                                <p className="text-xs text-slate-300 font-mono mt-1">
                                  تم الاستهلاك: <strong className="text-cyan-400">{quota.used_count}</strong> من أصل {quota.total_allowed}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                              {/* Quick increment usage */}
                              <button
                                disabled={quota.used_count >= quota.total_allowed}
                                onClick={() => onIncrementAmenity(subscription.id, quota.amenity_type_id, selectedRecorderId)}
                                className={`p-1.5 rounded transition-all cursor-pointer ${
                                  quota.used_count < quota.total_allowed
                                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                                title="سجل استهلاك مرة جديدة"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              {/* View detail logs */}
                              <button
                                onClick={() => handlePushView('amenity_detail', quota.amenity_type_id)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>سجل الاستهلاك</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-4 italic">لا يوجد عدادات استخدام مرافق مسجلة لهذه العضوية.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- SUBVIEW 3: AMENITY LOG DETAILS ----------------- */}
        {currentSubView === 'amenity_detail' && selectedAmenityDetails && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-950 p-5 rounded-xl border border-cyan-500/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                {renderAmenityIcon(selectedAmenityDetails.type.icon, "w-6 h-6")}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedAmenityDetails.type.name_ar}</h3>
                <p className="text-xs text-slate-400">{selectedAmenityDetails.type.name_en}</p>
                <div className="mt-2.5 flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-300">الحد الأقصى المسموح: <strong className="text-white">{selectedAmenityDetails.quota.total_allowed}</strong></span>
                  <span className="text-slate-300">المستهلك: <strong className="text-cyan-400">{selectedAmenityDetails.quota.used_count}</strong></span>
                  <span className="text-slate-300">المتبقي: <strong className="text-emerald-400">{selectedAmenityDetails.quota.total_allowed - selectedAmenityDetails.quota.used_count}</strong></span>
                </div>
              </div>
            </div>

            {/* Logs List Table */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">سجل مسحات الاستخدام التفصيلي (Usage Log)</h4>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {selectedAmenityDetails.logs.length > 0 ? (
                  selectedAmenityDetails.logs.map((log, index) => {
                    const employeeName = employees.find(e => e.id === log.recorded_by_employee_id)?.name || 'موظف الاستقبال';
                    return (
                      <div key={log.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-200">الاستخدام رقم #{selectedAmenityDetails.logs.length - index}</p>
                          <p className="text-[10px] text-slate-400 mt-1">سجل الحضور بواسطة: <strong className="text-cyan-500">{employeeName}</strong></p>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-mono flex items-center gap-1 justify-end text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{log.usage_date}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-slate-500 py-12 italic">لا توجد مسحات استخدام مسجلة بعد لهذا المرفق.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SUBVIEW 4: EDIT PROFILE ----------------- */}
        {currentSubView === 'edit_profile' && (
          <div className="space-y-6 animate-fadeIn text-right">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <span>تعديل الملف الشخصي للعضو | Edit Profile Screen</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">تحديث القياسات الجسدية للأعضاء وبيانات الاتصال والباركود والتحقق.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdateMember) {
                  onUpdateMember({
                    ...member,
                    name: `${firstName} ${lastName}`.trim(),
                    phone: editPhone,
                    weight: Number(editWeight),
                    height: Number(editHeight),
                    age: Number(editAge),
                    barcode: editBarcode,
                    card_id: editCardId,
                    photo_url: editPhotoUrl
                  });
                }
                setNavigationStack(['profile_home']);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">الاسم الأول | First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">الاسم الأخير | Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                {/* Phone Contact */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">رقم الهاتف الجوال | Contact Number</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">العمر بالسنوات | Age (Years)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">الطول بالسنتيمتر | Height (cm)</label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="250"
                    value={editHeight}
                    onChange={(e) => setEditHeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">الوزن الحالي بالكيلوجرام | Weight (kg)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="300"
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Barcode code */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">رمز الباركود الشريطي | Barcode Code</label>
                  <input
                    type="text"
                    required
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Card ID */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-bold">الرقم الممسوح أو كود الكارت RFID / ID</label>
                  <input
                    type="text"
                    required
                    value={editCardId}
                    onChange={(e) => setEditCardId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Photo URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1 font-bold">رابط صورة العضو | Profile Photo URL</label>
                  <input
                    type="url"
                    value={editPhotoUrl}
                    onChange={(e) => setEditPhotoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNavigationStack(['profile_home'])}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء التعديل | Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات | Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Back to Home CTA button in profile if we are in deeper screens */}
      {currentSubView !== 'profile_home' && (
        <button
          onClick={() => setNavigationStack(['profile_home'])}
          className="mt-6 w-full text-center py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-all text-xs cursor-pointer font-sans"
        >
          الرجوع لشاشة البروفايل الرئيسية | Back to Profile Home
        </button>
      )}
    </div>
  );
}
