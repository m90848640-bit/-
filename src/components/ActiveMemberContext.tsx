import React, { useState } from 'react';
import { Member, Subscription, PrivateSession, AttendanceLog } from '../types';
import { Dumbbell, Phone, Calendar, User, CheckCircle, Clock, Plus, LogIn, TrendingDown, Eye, EyeOff } from 'lucide-react';

interface ActiveMemberContextProps {
  member: Member | null;
  subscription: Subscription | null;
  privateSession: PrivateSession | null;
  attendanceLogs: AttendanceLog[];
  onCheckIn: (type: 'check_in' | 'session' | 'amenity', details?: string) => void;
  onViewDetails: () => void;
}

export default function ActiveMemberContext({
  member,
  subscription,
  privateSession,
  attendanceLogs,
  onCheckIn,
  onViewDetails
}: ActiveMemberContextProps) {
  const [showPhone, setShowPhone] = useState(false);

  if (!member) {
    return (
      <div className="bg-[#0e1d30] text-slate-300 p-6 rounded-xl border border-slate-800 flex flex-col justify-center items-center text-center h-full min-h-[500px]">
        {/* Stylized muscular man working out with cap - Side Logo */}
        <div className="w-24 h-24 rounded-full bg-slate-900/90 flex items-center justify-center mb-6 border-2 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)] relative overflow-hidden">
          <svg viewBox="0 0 64 64" className="w-14 h-14 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Right Arm Muscle / Flex */}
            <path d="M16 42 C16 33, 22 28, 28 31 C31 32, 33 36, 31 40" stroke="currentColor" strokeWidth="3" />
            <path d="M28 31 C28 26, 32 21, 37 23 C42 25, 44 31, 38 35" stroke="currentColor" strokeWidth="3.5" />
            {/* Dumbbell bar & weights */}
            <line x1="34" y1="24" x2="42" y2="16" stroke="currentColor" strokeWidth="4" />
            <circle cx="34" cy="24" r="4" fill="currentColor" />
            <circle cx="42" cy="16" r="4" fill="currentColor" />
            {/* Bodybuilder Athlete's Head and Cap */}
            <circle cx="21" cy="22" r="3.5" fill="currentColor" />
            <path d="M17 20 L24 19 L25 22 Z" fill="currentColor" /> {/* Cap visor */}
            {/* Torso Chest line */}
            <path d="M12 48 L16 42 L26 44 L24 53" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        </div>

        <h3 className="text-white font-bold text-base mb-1 font-sans">لا يوجد عضو محدد حالياً</h3>
        <p className="text-xs text-slate-400 max-w-xs font-sans">
          قم بمسح باركود كارت العضوية أو ابحث عن الاسم/رقم الهاتف في شريط البحث بالأعلى لعرض بياناته والتحكم في حساباته هنا.
        </p>

        <div className="mt-6 p-4 bg-slate-900/60 rounded-lg border border-slate-800 text-right w-full text-xs">
          <p className="font-semibold text-cyan-400 mb-2 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>💡 تلميحات سريعة | Quick Tips</span>
          </p>
          <ul className="space-y-1.5 text-slate-400 list-disc list-inside font-sans">
            <li>اضغط على "محاكي الباركود" بالأعلى لتجربة مسح كارت فوري.</li>
            <li>استخدم البحث السريع في القائمة الرئيسية للوصول للأعضاء.</li>
          </ul>
        </div>
      </div>
    );
  }

  // Get status details
  const isSubscriptionActive = subscription && subscription.status === 'active';
  const planName = subscription ? (subscription.plan_id.includes('private') ? 'عضوية خاصة VIP' : 'عضوية الجيم العادية') : 'بدون اشتراك';
  
  // Calculate remaining days
  let daysRemaining = 0;
  if (subscription) {
    const end = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Filter attendance logs for this member
  const memberLogs = attendanceLogs
    .filter((log) => log.member_id === member.id)
    .slice(0, 3);

  return (
    <div className="bg-[#0b1726] text-white p-5 rounded-2xl border border-cyan-500/10 shadow-2xl flex flex-col h-full overflow-y-auto">
      {/* 🏋️ BRAND TRAINING ATHLETE LOGO */}
      <div className="mb-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2.5 animate-fadeIn shrink-0">
        <div className="flex items-center gap-2">
          {/* Custom Stylized Bodybuilding Man Workout Logo */}
          <div className="w-10 h-10 rounded-full bg-cyan-950/55 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)] shrink-0">
            <svg viewBox="0 0 64 64" className="w-6.5 h-6.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 42 C16 33, 22 28, 28 31 C31 32, 33 36, 31 40" stroke="currentColor" strokeWidth="2.5" />
              <path d="M28 31 C28 26, 32 21, 37 23 C42 25, 44 31, 38 35" stroke="currentColor" strokeWidth="3" />
              <line x1="34" y1="24" x2="42" y2="16" stroke="currentColor" strokeWidth="3" />
              <circle cx="34" cy="24" r="3.5" fill="currentColor" />
              <circle cx="42" cy="16" r="3.5" fill="currentColor" />
              <circle cx="21" cy="22" r="3" fill="currentColor" />
              <path d="M17 20 L24 19 L25 22 Z" fill="currentColor" />
            </svg>
          </div>
          <div className="text-right">
            <h4 className="text-[11px] font-black text-cyan-400 tracking-wide font-sans leading-none">العضو الحالي | FITBOT GATE</h4>
            <p className="text-[9px] text-slate-500 font-bold leading-tight mt-1">تفاصيل العضوية والنشاط المباشر</p>
          </div>
        </div>
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
      </div>

      {/* Photo and Header */}
      <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800">
        <div className="relative group">
          <img
            src={member.photo_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=250'}
            alt={member.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-cyan-500/20 shadow-lg group-hover:scale-105 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
          <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#0b1726] ${isSubscriptionActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        </div>

        <h3 className="text-lg font-bold text-white mt-3 font-sans tracking-wide leading-tight">
          {member.name}
        </h3>
        
        <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-1.5 font-mono">
          <Phone className="w-3 h-3 text-cyan-400" />
          <span>{showPhone ? member.phone : member.phone.replace(/(\d{3})\d+(\d{2})/, "$1••••••$2")}</span>
          <button
            onClick={() => setShowPhone(!showPhone)}
            className="p-1 hover:text-white transition-colors cursor-pointer text-slate-500"
            title={showPhone ? "إخفاء رقم الهاتف" : "إظهار رقم الهاتف كامل"}
          >
            {showPhone ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-400">باركود:</span>
          <span className="font-mono text-cyan-400 font-bold">{member.barcode}</span>
        </div>
      </div>

      {/* Stats Cards (Height, Age, Weight) matching mockup exactly */}
      <div className="grid grid-cols-3 gap-2 py-4 border-b border-slate-800 text-center">
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">الطول</span>
          <strong className="block text-sm text-cyan-400 mt-0.5 font-mono">{member.height || 178} cm</strong>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">العمر</span>
          <strong className="block text-sm text-yellow-400 mt-0.5 font-mono">{member.age || 26}</strong>
        </div>
        <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">الوزن</span>
          <strong className="block text-sm text-emerald-400 mt-0.5 font-mono">{member.weight || 82} kg</strong>
        </div>
      </div>

      {/* Subscription Status Block */}
      <div className="py-4 border-b border-slate-800">
        <h4 className="text-xs font-semibold text-slate-400 mb-2 flex justify-between">
          <span>حالة الاشتراك الحالي</span>
          <span>Subscription Info</span>
        </h4>

        {subscription ? (
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-200">{planName}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isSubscriptionActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {isSubscriptionActive ? 'نشط' : 'منتهي'}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1 mt-2">
              <div className="flex justify-between">
                <span>تاريخ الانتهاء:</span>
                <span className="font-mono text-slate-300">{subscription.end_date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>الأيام المتبقية:</span>
                <span className={`font-mono font-bold ${daysRemaining > 7 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                </span>
              </div>
              {privateSession && (
                <div className="flex justify-between border-t border-slate-800 mt-1.5 pt-1.5 text-cyan-400 font-medium">
                  <span>الحصص الخاصة:</span>
                  <span className="font-mono">{privateSession.total_sessions - privateSession.used_sessions} حِصّة متبقية</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-rose-950/10 border border-rose-900/30 p-3 rounded-xl text-center text-xs text-rose-400">
            لا يوجد أي اشتراك مسجل لهذا العضو حالياً
          </div>
        )}
      </div>

      {/* Quick Check-In Actions */}
      <div className="py-4 border-b border-slate-800">
        <h4 className="text-xs font-semibold text-slate-400 mb-2">إجراءات سريعة لتسجيل الحضور</h4>
        
        <div className="space-y-2">
          {/* Gym Check In */}
          <button
            disabled={!isSubscriptionActive}
            onClick={() => onCheckIn('check_in', 'حضور البوابة الرئيسي للجيم')}
            className={`w-full text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-between transition-all ${
              isSubscriptionActive
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/10 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-800/50 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>تسجيل دخول البوابة اليوم</span>
            </span>
            <span className="text-[10px] font-mono opacity-80">Check In</span>
          </button>

          {/* PT Session Check In */}
          {subscription?.plan_id.includes('private') && privateSession && (
            <button
              disabled={privateSession.used_sessions >= privateSession.total_sessions}
              onClick={() => onCheckIn('session', `حضور حصة خاصة مع المدرب`)}
              className={`w-full text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-between transition-all ${
                privateSession.used_sessions < privateSession.total_sessions
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/10 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-800/50 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>خصم حصة تدريب خاصة (-1)</span>
              </span>
              <span className="text-[10px] font-mono opacity-80">PT Session</span>
            </button>
          )}

          <button
            onClick={onViewDetails}
            className="w-full text-xs font-bold py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            <span>عرض تفاصيل العدادات والاشتراكات بالكامل</span>
          </button>
        </div>
      </div>

      {/* Member Goals Progress (Similar to "MONTHLY GOAL" in mockup) */}
      <div className="py-4 border-b border-slate-800">
        <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">الهدف الشهري للعضو | MONTHLY GOAL</h4>
        
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">معدل التدريب الأسبوعي (تمارين)</span>
              <span className="font-mono text-cyan-400 font-semibold">4 / 5 حصص</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">الوزن المستهدف (تخسيس دهون)</span>
              <span className="font-mono text-yellow-400 font-semibold">-4 / 6 kg</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: '66%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-300 font-medium">استهلاك الساونا والاستجمام</span>
              <span className="font-mono text-emerald-400 font-semibold">7 / 12 مرات</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '58%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity for Member */}
      <div className="pt-4 flex-1 flex flex-col min-h-[150px]">
        <h4 className="text-xs font-semibold text-slate-400 mb-2 flex justify-between">
          <span>آخر حركات الحضور والاستخدام</span>
          <span>Recent Activity</span>
        </h4>

        {memberLogs.length > 0 ? (
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[160px] pr-1">
            {memberLogs.map((log) => (
              <div key={log.id} className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/80 text-[11px] flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-200">
                    {log.type === 'check_in' && '🔑 تسجيل دخول بوابات'}
                    {log.type === 'session' && '💪 حصة تدريب خاصة'}
                    {log.type === 'amenity' && '🛁 استخدام مرافق خاصة'}
                  </p>
                  {log.details && <p className="text-[10px] text-slate-400 mt-0.5">{log.details}</p>}
                </div>
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5 shrink-0">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span>{log.check_in_time.split(' ')[1] || log.check_in_time}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500 py-4 italic my-auto">
            لا توجد سجلات حضور مسجلة مؤخراً
          </div>
        )}
      </div>
    </div>
  );
}
