import React, { useState, useEffect } from 'react';
import {
  Member,
  Subscription,
  PrivateSession,
  AmenityQuota,
  AmenityUsageLog,
  AttendanceLog,
  FinanceTransaction,
  MembershipPlan,
  NavigationState
} from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_PRIVATE_SESSIONS,
  INITIAL_AMENITY_QUOTAS,
  INITIAL_AMENITY_LOGS,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_FINANCE,
  INITIAL_PLANS,
  INITIAL_AMENITY_TYPES,
  INITIAL_EMPLOYEES,
  loadFromStorage,
  saveToStorage
} from './mockData';
import BarcodeScannerListener from './components/BarcodeScannerListener';
import ActiveMemberContext from './components/ActiveMemberContext';
import MemberSearch from './components/MemberSearch';
import ProfileView from './components/ProfileView';
import FinanceDashboard from './components/FinanceDashboard';
import PlansManager from './components/PlansManager';
import NewMemberForm from './components/NewMemberForm';

import {
  Dumbbell,
  Search,
  DollarSign,
  Sliders,
  UserPlus,
  History,
  Barcode,
  Languages,
  Sparkles,
  CreditCard,
  TrendingUp,
  Flame,
  Waves,
  Activity,
  Award,
  ChevronRight,
  Settings,
  Bell,
  Globe,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';

export default function App() {
  // 1. Core State loaded from localStorage with fallback values
  const [members, setMembers] = useState<Member[]>(() => 
    loadFromStorage<Member[]>('members', INITIAL_MEMBERS)
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => 
    loadFromStorage<Subscription[]>('subscriptions', INITIAL_SUBSCRIPTIONS)
  );
  const [privateSessions, setPrivateSessions] = useState<PrivateSession[]>(() => 
    loadFromStorage<PrivateSession[]>('private_sessions', INITIAL_PRIVATE_SESSIONS)
  );
  const [amenityQuotas, setAmenityQuotas] = useState<AmenityQuota[]>(() => 
    loadFromStorage<AmenityQuota[]>('amenity_quotas', INITIAL_AMENITY_QUOTAS)
  );
  const [amenityUsageLogs, setAmenityUsageLogs] = useState<AmenityUsageLog[]>(() => 
    loadFromStorage<AmenityUsageLog[]>('amenity_logs', INITIAL_AMENITY_LOGS)
  );
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => 
    loadFromStorage<AttendanceLog[]>('attendance_logs', INITIAL_ATTENDANCE_LOGS)
  );
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>(() => 
    loadFromStorage<FinanceTransaction[]>('finance', INITIAL_FINANCE)
  );
  const [plans, setPlans] = useState<MembershipPlan[]>(() => 
    loadFromStorage<MembershipPlan[]>('plans', INITIAL_PLANS)
  );

  // Constants
  const amenityTypes = INITIAL_AMENITY_TYPES;
  const employees = INITIAL_EMPLOYEES;

  // Selected Active Member Context State
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>('mem-001');

  // Navigation state (Stack structure representation)
  const [navState, setNavState] = useState<NavigationState>({ view: 'home' });

  // System Notifications
  const [alerts, setAlerts] = useState<{ id: string; text: string; type: 'success' | 'info' }[]>([]);

  // Persistence triggers
  useEffect(() => { saveToStorage('members', members); }, [members]);
  useEffect(() => { saveToStorage('subscriptions', subscriptions); }, [subscriptions]);
  useEffect(() => { saveToStorage('private_sessions', privateSessions); }, [privateSessions]);
  useEffect(() => { saveToStorage('amenity_quotas', amenityQuotas); }, [amenityQuotas]);
  useEffect(() => { saveToStorage('amenity_logs', amenityUsageLogs); }, [amenityUsageLogs]);
  useEffect(() => { saveToStorage('attendance_logs', attendanceLogs); }, [attendanceLogs]);
  useEffect(() => { saveToStorage('finance', financeTransactions); }, [financeTransactions]);
  useEffect(() => { saveToStorage('plans', plans); }, [plans]);

  // Utility to fire temporary floating notifications
  const triggerNotification = (text: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setAlerts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 4500);
  };

  // 2. Core Actions
  
  // helper to record check in for any member
  const handleGymCheckInForMember = (memberId: string, type: 'check_in' | 'session' | 'amenity', details: string = 'حضور بوابة الجيم الرئيسي') => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const timeString = new Date().toLocaleString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const newLog: AttendanceLog = {
      id: `at-${Date.now()}`,
      member_id: memberId,
      check_in_time: timeString,
      type,
      details
    };

    setAttendanceLogs((prev) => [newLog, ...prev]);
    triggerNotification(`تم تسجيل حضور ${member.name} بنجاح!`, 'success');
  };

  // Barcode scan handler
  const handleBarcodeScanSuccess = (scannedCode: string) => {
    // 1. Always notify active forms/listeners (like New Member Form or Edit Profile screen)
    window.dispatchEvent(new CustomEvent('barcode-scanned', { detail: scannedCode }));

    // If we are on the New Member registration screen, we shouldn't trigger automatic check-ins or page jumps
    if (navState.view === 'new_member') {
      triggerNotification(`تم مسح كود الكارت بنجاح: ${scannedCode}`, 'success');
      return;
    }

    const foundMember = members.find(
      (m) => m.barcode === scannedCode || m.card_id === scannedCode || m.id === scannedCode
    );

    if (foundMember) {
      setSelectedMemberId(foundMember.id);
      
      // Auto check-in instantly if we are on Search (home) or Attendance Log (attendance_list)
      // "المسح شغال تلقائي علي شاشة الي فاتحها يعني البحث والسجل واحط الكارت دخول يسجل على طول"
      handleGymCheckInForMember(foundMember.id, 'check_in', 'حضور تلقائي بمسح كارت الباركود');
      
      // Navigate to their profile to show their live activity / check-in details
      setNavState({ view: 'member_profile', params: { memberId: foundMember.id } });
    } else {
      triggerNotification(`الرمز الممسوح ${scannedCode} غير مسجل لـ أي عضو بالسيستم!`, 'info');
    }
  };

  // Record daily gym gates entry check-in from UI action
  const handleGymCheckIn = (type: 'check_in' | 'session' | 'amenity', details: string = 'حضور بوابة الجيم الرئيسي') => {
    if (!selectedMemberId) return;
    handleGymCheckInForMember(selectedMemberId, type, details);
  };

  // Decrement Coach Session (Increment used_sessions count)
  const handleIncrementPrivateSession = (subscriptionId: string, trainerId: string) => {
    setPrivateSessions((prev) =>
      prev.map((ps) => {
        if (ps.subscription_id === subscriptionId) {
          if (ps.used_sessions >= ps.total_sessions) {
            triggerNotification('عذراً، لقد استهلك العضو جميع حصص التدريب المتوفرة بالباقة!', 'info');
            return ps;
          }
          const updatedUsed = ps.used_sessions + 1;
          
          // Log inside general attendance list as a session check-in
          handleGymCheckIn('session', `حضور حصة خاصة مع المدرب المسؤول`);

          triggerNotification(`تم خصم حصة خاصة بنجاح! متبقي: ${ps.total_sessions - updatedUsed}`, 'success');
          return { ...ps, used_sessions: updatedUsed };
        }
        return ps;
      })
    );
  };

  // Decrement/Increment Amenity Quota usage (Jacuzzi, Sauna, Steam, etc.)
  const handleIncrementAmenityUsage = (subscriptionId: string, amenityTypeId: string, employeeId: string) => {
    let success = false;
    let message = '';

    setAmenityQuotas((prev) =>
      prev.map((q) => {
        if (q.subscription_id === subscriptionId && q.amenity_type_id === amenityTypeId) {
          if (q.used_count >= q.total_allowed) {
            message = 'عذراً، هذا العضو استنفذ الحد المسموح له من هذا المرفق!';
            return q;
          }
          success = true;
          const updatedUsed = q.used_count + 1;
          message = `تم تسجيل استخدام المرفق بنجاح! متبقي: ${q.total_allowed - updatedUsed} مرات`;
          
          // Add detailed log for this quota
          const newUsageLog: AmenityUsageLog = {
            id: `al-${Date.now()}`,
            quota_id: q.id,
            usage_date: new Date().toLocaleString('ar-EG'),
            recorded_by_employee_id: employeeId
          };
          setAmenityUsageLogs((prevLogs) => [newUsageLog, ...prevLogs]);

          // Also log inside general attendance ledger
          const amenityName = amenityTypes.find(t => t.id === amenityTypeId)?.name_ar || amenityTypeId;
          handleGymCheckIn('amenity', `استخدام مرفق الاسترخاء: ${amenityName}`);

          return { ...q, used_count: updatedUsed };
        }
        return q;
      })
    );

    if (success) {
      triggerNotification(message, 'success');
    } else if (message) {
      triggerNotification(message, 'info');
    }
  };

  // Complete new member registration workflow
  const handleAddMemberComplete = (
    member: Member,
    subscription: Subscription,
    privateSession: PrivateSession | null,
    paidAmount: number,
    paymentMethod: 'cash' | 'card' | 'instapay' | 'bank_transfer'
  ) => {
    // 1. Add member
    setMembers((prev) => [member, ...prev]);

    // 2. Add subscription
    setSubscriptions((prev) => [subscription, ...prev]);

    // 3. Add private session if VIP Private
    if (privateSession) {
      setPrivateSessions((prev) => [privateSession, ...prev]);
    }

    // 4. Initialize Amenity Quotas based on purchased plan
    const plan = plans.find((p) => p.id === subscription.plan_id);
    if (plan && plan.type === 'private' && plan.amenities_quotas) {
      const newQuotas: AmenityQuota[] = Object.entries(plan.amenities_quotas).map(([amenityId, maxAllowed]) => ({
        id: `aq-${Date.now()}-${amenityId}`,
        subscription_id: subscription.id,
        amenity_type_id: amenityId,
        total_allowed: Number(maxAllowed),
        used_count: 0
      }));
      setAmenityQuotas((prev) => [...prev, ...newQuotas]);
    }

    // 5. Record Financial Transaction in the ledger
    const newTransaction: FinanceTransaction = {
      id: `ft-${Date.now()}`,
      member_id: member.id,
      subscription_id: subscription.id,
      amount: paidAmount,
      date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethod,
      type: 'subscription'
    };
    setFinanceTransactions((prev) => [newTransaction, ...prev]);

    // Select this member context automatically
    setSelectedMemberId(member.id);

    // Redirect to newly created member profile
    setNavState({ view: 'member_profile', params: { memberId: member.id } });
    triggerNotification(`تم تسجيل العضو ${member.name} ودفع مبلغ ${paidAmount} EGP بنجاح!`, 'success');
  };

  // Handle updating existing member data
  const handleUpdateMember = (updatedMember: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    triggerNotification(`تم تحديث بيانات العضو ${updatedMember.name} بنجاح!`, 'success');
  };

  // Add custom Plan Configuration
  const handleAddPlan = (newPlan: MembershipPlan) => {
    setPlans((prev) => [...prev, newPlan]);
    triggerNotification(`تمت إضافة خطة الاشتراك الجديدة "${newPlan.name}" بنجاح`, 'success');
  };

  // Active contexts calculations
  const activeMember = members.find((m) => m.id === selectedMemberId) || null;
  const activeSubscription = activeMember
    ? subscriptions.find((sub) => sub.member_id === activeMember.id && sub.status === 'active') ||
      subscriptions.find((sub) => sub.member_id === activeMember.id) || null
    : null;
  const activePlan = activeSubscription
    ? plans.find((p) => p.id === activeSubscription.plan_id) || null
    : null;
  const activePrivateSession = activeSubscription
    ? privateSessions.find((ps) => ps.subscription_id === activeSubscription.id) || null
    : null;

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* 1. Barcode wedge scanner global passive/active listener */}
      <BarcodeScannerListener onScanSuccess={handleBarcodeScanSuccess} members={members} />

      {/* Floating System Notifications */}
      <div className="fixed top-4 left-4 z-50 space-y-2 pointer-events-none max-w-sm">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3.5 rounded-xl border shadow-xl flex items-center gap-2 text-xs transition-all animate-bounce ${
              alert.type === 'success'
                ? 'bg-[#0f2d24]/90 border-emerald-500/30 text-emerald-400'
                : 'bg-[#152438]/90 border-blue-500/30 text-cyan-400'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{alert.text}</span>
          </div>
        ))}
      </div>

      {/* Top dashboard thin Header resembling FITBOT's top rail */}
      <header className="bg-[#0b1726] border-b border-slate-800 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg border border-cyan-400/20">
            F
          </div>
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-widest font-sans">
            FITBOT GYM
          </span>
          <span className="text-[10px] bg-slate-800 px-2.5 py-0.5 rounded text-slate-400 mr-2 border border-slate-800 font-mono">
            V2.5 Enterprise
          </span>
        </div>

        {/* Central visual info (Real time check-ins tracker) */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 bg-slate-950 px-4 py-2 rounded-full border border-slate-800/80">
          <div>
            الاشتراكات النشطة: <strong className="text-emerald-400 font-mono">{subscriptions.filter(s => s.status === 'active').length}</strong>
          </div>
          <div className="h-3.5 w-[1px] bg-slate-800"></div>
          <div>
            إيراد المحاسبة الكلي: <strong className="text-cyan-400 font-mono">{financeTransactions.reduce((acc, c) => acc + c.amount, 0).toLocaleString()} EGP</strong>
          </div>
          <div className="h-3.5 w-[1px] bg-slate-800"></div>
          <div>
            عمليات تسجيل اليوم: <strong className="text-yellow-400 font-mono">{attendanceLogs.length}</strong>
          </div>
        </div>

        {/* Quick notification controls */}
        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main layout frame: Left sidebar + Middle workspace + Right Context Pane */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar navigation */}
        <aside className="w-full lg:w-64 bg-[#0a1321] border-l lg:border-l-0 lg:border-b-0 lg:border-l border-slate-800/80 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block px-2.5 mb-2">القائمة والتحكم</span>
              
              {/* Tab 1: Member lookup (Home) */}
              <button
                onClick={() => setNavState({ view: 'home' })}
                className={`w-full text-right py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  navState.view === 'home' || navState.view === 'member_profile'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md shadow-cyan-500/5'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>البحث وسجل الأعضاء</span>
                </span>
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">F1</span>
              </button>

              {/* Tab 2: Register New Member */}
              <button
                onClick={() => setNavState({ view: 'new_member' })}
                className={`w-full text-right py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  navState.view === 'new_member'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>تسجيل عضو جديد واشتراك</span>
                </span>
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">F2</span>
              </button>

              {/* Tab 3: Daily Attendance log */}
              <button
                onClick={() => setNavState({ view: 'attendance_list' })}
                className={`w-full text-right py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  navState.view === 'attendance_list'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  <span>سجل الدخول والحركات الشامل</span>
                </span>
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">F3</span>
              </button>

              {/* Tab 4: Financial ledger / accounting */}
              <button
                onClick={() => setNavState({ view: 'finance_dashboard' })}
                className={`w-full text-right py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  navState.view === 'finance_dashboard'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>المالية ودفتر الإيرادات والمبيعات</span>
                </span>
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">F4</span>
              </button>

              {/* Tab 5: Plans & configurations */}
              <button
                onClick={() => setNavState({ view: 'settings_plans' })}
                className={`w-full text-right py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  navState.view === 'settings_plans'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  <span>تكوين خطط العضوية والعدادات</span>
                </span>
                <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-mono">F5</span>
              </button>
            </div>

            {/* Quick stats segment */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs text-right space-y-1.5">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">📋 رصد سريع للصالة</span>
              <div className="flex justify-between">
                <span className="text-slate-400">طاقم المدربين المتاح:</span>
                <strong className="text-cyan-400">{employees.filter(e => e.role === 'trainer').length} مدربين</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">إجمالي الباقات النشطة:</span>
                <strong className="text-emerald-400">{subscriptions.filter(s => s.status === 'active').length} باقة</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">إجمالي الأعضاء:</span>
                <strong className="text-white">{members.length} مشترك</strong>
              </div>
            </div>
          </div>

          {/* Social connections & branding footer similar to mockup */}
          <div className="mt-6 pt-4 border-t border-slate-900 space-y-4">
            {/* Social Icons of mockup (fb, whatsapp, linkedin, insta) */}
            <div className="flex justify-center gap-4 text-slate-500 text-xs">
              <a href="#" className="hover:text-cyan-400 transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-cyan-400 transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-cyan-400 transition-colors"><Linkedin className="w-4 h-4" /></a>
            </div>

            {/* Copywrite / branding */}
            <div className="text-[10px] text-slate-600 text-center">
              <p>© 2026 FitBot Workspace</p>
              <p className="text-[9px] mt-0.5">صنع خصيصاً لإدارة الصالات الرياضية العملاقة</p>
            </div>
          </div>
        </aside>

        {/* Middle workspace component */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#070d19] border-l border-slate-900/40">
          
          {/* Workspaces router */}
          {navState.view === 'home' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Highlight scanned member alert guide for receptionist */}
              <div className="bg-[#152438] border border-blue-500/20 p-4 rounded-xl text-xs flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-cyan-300 font-bold block">ميزة الباركود الشريطي مفعلة حالياً ومستعدة للقراءة ⚡</span>
                    <span className="text-slate-400 text-[11px]">يمكنك ضرب الكارت مباشرة بجهاز قارئ الباركود USB في أي وقت لتسجيل الدخول الفوري للعضو الممسوح.</span>
                  </div>
                </div>

                <button
                  onClick={() => setNavState({ view: 'new_member' })}
                  className="bg-cyan-500 hover:bg-cyan-400 text-[#070d19] font-black px-3 py-1.5 rounded transition-all text-[11px] cursor-pointer"
                >
                  تسجيل عضو جديد
                </button>
              </div>

              {/* Member lookup search component */}
              <MemberSearch
                members={members}
                subscriptions={subscriptions}
                onSelectMember={(memberId) => {
                  setSelectedMemberId(memberId);
                  setNavState({ view: 'member_profile', params: { memberId } });
                }}
                onAddNewMemberClick={() => setNavState({ view: 'new_member' })}
              />
            </div>
          )}

          {navState.view === 'member_profile' && activeMember && (
            <div className="animate-fadeIn">
              <ProfileView
                member={activeMember}
                subscription={activeSubscription}
                plan={activePlan}
                privateSession={activePrivateSession}
                amenityQuotas={amenityQuotas}
                amenityUsageLogs={amenityUsageLogs}
                amenityTypes={amenityTypes}
                employees={employees}
                attendanceLogs={attendanceLogs}
                onCheckIn={handleGymCheckIn}
                onIncrementSession={handleIncrementPrivateSession}
                onIncrementAmenity={handleIncrementAmenityUsage}
                onBackToSearch={() => setNavState({ view: 'home' })}
                onUpdateMember={handleUpdateMember}
              />
            </div>
          )}

          {navState.view === 'finance_dashboard' && (
            <div className="animate-fadeIn space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">لوحة الرقابة المالية والحسابات الشاملة (Financial Hub)</h2>
                  <p className="text-slate-400 text-xs mt-0.5">رصد الإيرادات، اشتراكات الأعضاء المبيعة، وطرق التحصيل بالعملة المحلية.</p>
                </div>
              </div>
              
              <FinanceDashboard
                transactions={financeTransactions}
                members={members}
                plans={plans}
                subscriptions={subscriptions}
              />
            </div>
          )}

          {navState.view === 'settings_plans' && (
            <div className="animate-fadeIn space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">إعدادات باقات الاشتراك وعدادات الاستهلاك</h2>
                  <p className="text-slate-400 text-xs mt-0.5">تحديد هيكل الأسعار ومرافق الـ VIP الخاصة بباقتك كإداري صالة.</p>
                </div>
              </div>
              
              <PlansManager
                plans={plans}
                amenityTypes={amenityTypes}
                onAddPlan={handleAddPlan}
              />
            </div>
          )}

          {navState.view === 'new_member' && (
            <div className="animate-fadeIn">
              <NewMemberForm
                plans={plans}
                trainers={employees.filter((e) => e.role === 'trainer')}
                members={members}
                onAddMemberComplete={handleAddMemberComplete}
                onCancel={() => setNavState({ view: 'home' })}
              />
            </div>
          )}

          {/* Daily Attendance ledger list */}
          {navState.view === 'attendance_list' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl animate-fadeIn space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">دفتر التحقق والحضور والمسحات اليومي (General Attendance Ledger)</h2>
                <p className="text-slate-400 text-xs mt-1">
                  يسجل السيستم تلقائياً أي حضور من البوابات، أو حصص المدرب الخاص، أو استهلاك المرافق من كارت العضوية.
                </p>
              </div>

              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {attendanceLogs.map((log) => {
                  const member = members.find((m) => m.id === log.member_id);
                  return (
                    <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-slate-800 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={member?.photo_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=150'}
                          alt={member?.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <strong className="text-white text-sm block">{member?.name || 'عضو غير معروف'}</strong>
                          <div className="flex gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                            <span>جوال: {member?.phone ? member.phone.replace(/(\d{3})\d+(\d{2})/, "$1••••••$2") : ''}</span>
                            <span>•</span>
                            <span>كود: {member?.barcode}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.type === 'check_in' 
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' 
                            : log.type === 'session' 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10' 
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10'
                        }`}>
                          {log.type === 'check_in' && '🔑 بوابات الجيم'}
                          {log.type === 'session' && '💪 حصة مدرب خاص'}
                          {log.type === 'amenity' && '🛁 حمامات استرخاء VIP'}
                        </span>
                        {log.details && <span className="text-slate-400 text-[11px]">({log.details})</span>}
                      </div>

                      <div className="text-slate-500 font-mono text-[11px]">
                        {log.check_in_time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* Right context pane resembling FITBOT mockup exactly - ONLY visible inside the Member Profile view */}
        {navState.view === 'member_profile' && activeMember && (
          <aside className="w-full lg:w-80 bg-[#0a1321] border-r lg:border-r-0 lg:border-l-0 lg:border-r border-slate-800/80 p-4 shrink-0 overflow-y-auto animate-fadeIn">
            <ActiveMemberContext
              member={activeMember}
              subscription={activeSubscription}
              privateSession={activePrivateSession}
              attendanceLogs={attendanceLogs}
              onCheckIn={handleGymCheckIn}
              onViewDetails={() => setNavState({ view: 'member_profile', params: { memberId: selectedMemberId || undefined } })}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
