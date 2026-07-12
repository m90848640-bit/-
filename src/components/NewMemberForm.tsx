import React, { useState, useEffect } from 'react';
import { MembershipPlan, Employee, Member, Subscription, PrivateSession } from '../types';
import { UserPlus, Sparkles, Barcode, HelpCircle, CheckCircle } from 'lucide-react';

interface NewMemberFormProps {
  plans: MembershipPlan[];
  trainers: Employee[];
  members: Member[];
  onAddMemberComplete: (
    member: Member,
    subscription: Subscription,
    privateSession: PrivateSession | null,
    paidAmount: number,
    paymentMethod: 'cash' | 'card' | 'instapay' | 'bank_transfer'
  ) => void;
  onCancel: () => void;
}

export default function NewMemberForm({
  plans,
  trainers,
  members,
  onAddMemberComplete,
  onCancel
}: NewMemberFormProps) {
  // Member details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [barcode, setBarcode] = useState('');
  const [cardId, setCardId] = useState('');
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(175);
  const [age, setAge] = useState<number>(25);
  
  // Track auto-detected member
  const [detectedMember, setDetectedMember] = useState<Member | null>(null);

  // 1. Listen for global barcode scans
  useEffect(() => {
    const handleBarcodeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const code = customEvent.detail;
      if (code) {
        setBarcode(code);
        setCardId(`CARD-${code.slice(-4).toUpperCase()}`);
        
        // Immediately check if this barcode belongs to an existing member
        const found = members.find((m) => m.barcode === code || m.card_id === code || m.id === code);
        if (found) {
          setDetectedMember(found);
          setName(found.name);
          setPhone(found.phone);
          setAge(found.age || 25);
          setWeight(found.weight || 75);
          setHeight(found.height || 175);
        }
      }
    };
    window.addEventListener('barcode-scanned', handleBarcodeEvent);
    return () => {
      window.removeEventListener('barcode-scanned', handleBarcodeEvent);
    };
  }, [members]);

  // 2. React to manual phone inputs to detect existing member
  useEffect(() => {
    if (phone.trim().length >= 8) {
      const found = members.find((m) => m.phone === phone.trim());
      if (found && (!detectedMember || detectedMember.id !== found.id)) {
        setDetectedMember(found);
        setName(found.name);
        setAge(found.age || 25);
        setWeight(found.weight || 75);
        setHeight(found.height || 175);
        if (found.barcode) setBarcode(found.barcode);
        if (found.card_id) setCardId(found.card_id);
      }
    }
  }, [phone, members, detectedMember]);

  // 3. React to manual barcode/ID inputs to detect existing member
  useEffect(() => {
    if (barcode.trim().length >= 3) {
      const found = members.find((m) => m.barcode === barcode.trim() || m.card_id === barcode.trim());
      if (found && (!detectedMember || detectedMember.id !== found.id)) {
        setDetectedMember(found);
        setName(found.name);
        setPhone(found.phone);
        setAge(found.age || 25);
        setWeight(found.weight || 75);
        setHeight(found.height || 175);
        if (found.card_id) setCardId(found.card_id);
      }
    }
  }, [barcode, members, detectedMember]);

  // Subscription details
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [amountPaid, setAmountPaid] = useState<number>(plans[0]?.price || 0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'instapay' | 'bank_transfer'>('cash');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(trainers[0]?.id || '');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  // Auto-fill price when plan changes
  useEffect(() => {
    if (selectedPlan) {
      setAmountPaid(selectedPlan.price);
    }
  }, [selectedPlanId, plans]);

  // Generate random barcode helper
  const handleAutoGenerateBarcode = () => {
    const code = Math.floor(100000000 + Math.random() * 900000000).toString();
    setBarcode(code);
    setCardId(`CARD-${code.substring(5)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !barcode.trim() || !selectedPlanId) return;

    const newMemberId = detectedMember ? detectedMember.id : `mem-${Date.now()}`;
    const newSubscriptionId = `sub-${Date.now()}`;

    const memberData: Member = {
      id: newMemberId,
      name: name.trim(),
      phone: phone.trim(),
      barcode: barcode.trim(),
      card_id: cardId.trim() || `CARD-${barcode.slice(-4)}`,
      photo_url: detectedMember?.photo_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=250', // standard avatar
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      joined_date: detectedMember?.joined_date || new Date().toISOString().split('T')[0]
    };

    // Subscription dates (Starts today, ends based on plan duration)
    const startDate = new Date();
    const durationMonths = selectedPlan?.duration_months || 1;
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + durationMonths);

    const subscriptionData: Subscription = {
      id: newSubscriptionId,
      member_id: newMemberId,
      plan_id: selectedPlanId,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
      payment_status: Number(amountPaid) >= (selectedPlan?.price || 0) ? 'paid' : 'partial',
      amount_paid: Number(amountPaid)
    };

    // Private Coaching Session if Private
    let privateSessionData: PrivateSession | null = null;
    if (selectedPlan?.type === 'private') {
      privateSessionData = {
        id: `ps-${Date.now()}`,
        subscription_id: newSubscriptionId,
        trainer_id: selectedTrainerId,
        total_sessions: selectedPlan.sessions_count || 12,
        used_sessions: 0
      };
    }

    onAddMemberComplete(
      memberData,
      subscriptionData,
      privateSessionData,
      Number(amountPaid),
      paymentMethod
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-cyan-400" />
          <span>تسجيل عضوية جديدة وعقد اشتراك (New Gym Member Registration)</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          أدخل تفاصيل العضو الجديد بالكامل، وحدد باقة الاشتراك ومستحقات الدفع للتسجيل الفوري بالسيستم.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs text-right" dir="rtl">
        {/* State detected banner */}
        {detectedMember && (
          <div className="bg-cyan-950/75 border border-cyan-500/30 p-4 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-right animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-900/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-sm shrink-0">
                ✨
              </div>
              <div>
                <span className="text-cyan-300 font-bold block">💡 تم العثور على بيانات عضو مسجل مسبقاً!</span>
                <span className="text-slate-300 text-[11px] font-sans">
                  العضو <strong className="text-white">{detectedMember.name}</strong> مسجل مسبقاً برقم جوال <strong className="text-cyan-400 font-mono">{detectedMember.phone}</strong>. تم تحميل بياناته وقياساته تلقائياً لتتمكن من تجديد اشتراكه أو تعديل قياساته البدنية وصرف الباقة الجديدة له فوراً.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setDetectedMember(null);
                setName('');
                setPhone('');
                setBarcode('');
                setCardId('');
                setWeight(75);
                setHeight(175);
                setAge(25);
              }}
              className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 transition-colors font-bold shrink-0 cursor-pointer"
            >
              تفريغ الحقول وإدخال جديد
            </button>
          </div>
        )}

        {/* Section 1: Member Personal Info */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white border-b border-slate-900 pb-1.5 flex items-center justify-between">
            <span>👤 البيانات الشخصية الأساسية</span>
            <span className="text-[10px] text-slate-500 font-mono">Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">اسم العضو بالكامل:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: يوسف عمرو محمد"
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white text-xs focus:outline-none font-sans text-right"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">رقم الهاتف الجوال:</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 01012345678"
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white text-xs focus:outline-none font-mono text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">العمر:</label>
              <input
                type="number"
                min={10}
                max={100}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white text-xs focus:outline-none font-mono text-center text-yellow-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">الوزن الحالي (كجم):</label>
              <input
                type="number"
                min={30}
                max={250}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white text-xs focus:outline-none font-mono text-center text-emerald-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">الطول الحالي (سم):</label>
              <input
                type="number"
                min={100}
                max={230}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white text-xs focus:outline-none font-mono text-center text-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Barcode Card Settings */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white border-b border-slate-900 pb-1.5 flex items-center justify-between">
            <span>💳 منظومة الكارت الشريطي والباركود</span>
            <span className="text-[10px] text-slate-500 font-mono">Barcode & Card ID System</span>
          </h3>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            لربط كارت الباركود الورقي أو البلاستيكي للعضو، يمكنك كتابة الرقم يدوياً، مسحه مباشرة من القارئ أثناء فتح هذه الشاشة، أو توليد كود تلقائي فوري:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-slate-400 font-semibold mb-1">رقم الباركود (Barcode Sequence):</label>
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="اكتب الباركود أو اضغط توليد..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white text-xs focus:outline-none font-mono text-right"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">معرف الكارت المطبوع (Card ID):</label>
              <input
                type="text"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                placeholder="مثال: CARD-001"
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white text-xs focus:outline-none font-mono text-right"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAutoGenerateBarcode}
                className="w-full bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-400 font-bold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>توليد باركود تلقائي</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Subscriptions and Finance Ledger */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-white border-b border-slate-900 pb-1.5 flex items-center justify-between">
            <span>💵 باقة العضوية والمحاسبة والمدفوعات</span>
            <span className="text-[10px] text-slate-500 font-mono">Plan Purchase & Ledger Transaction</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">اختر باقة العضوية المطلوبة:</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ({p.price} EGP)
                  </option>
                ))}
              </select>
            </div>

            {selectedPlan?.type === 'private' ? (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">المدرب الخاص المسؤول (Trainer Assignment):</label>
                <select
                  value={selectedTrainerId}
                  onChange={(e) => setSelectedTrainerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none"
                >
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-slate-900/60 p-3 rounded border border-slate-800 flex items-center text-slate-500 text-[11px]">
                باقة الجيم العادية لا تتطلب تعيين مدرب خاص.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">المبلغ المحصل فعلياً (EGP):</label>
              <input
                type="number"
                min={0}
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-emerald-400 font-bold text-xs focus:outline-none font-mono text-right"
              />
              <p className="text-[10px] text-slate-500 mt-1">المستحق الإجمالي للباقة: {selectedPlan?.price || 0} EGP</p>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">وسيلة الدفع والتحصيل:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white text-xs focus:outline-none"
              >
                <option value="cash">نقدي | Cash</option>
                <option value="card">فيزا | Card</option>
                <option value="instapay">إنستا باي | InstaPay</option>
                <option value="bank_transfer">تحويل بنكي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer font-bold text-xs"
          >
            إلغاء وتراجع
          </button>
          
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl transition-all shadow-lg shadow-cyan-500/10 cursor-pointer font-bold text-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>إتمام التسجيل وإثبات الفواتير</span>
          </button>
        </div>
      </form>
    </div>
  );
}
