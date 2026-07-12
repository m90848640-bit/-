import React, { useState } from 'react';
import { MembershipPlan, AmenityType } from '../types';
import { PlusCircle, Trash2, CheckCircle, Dumbbell, ShieldCheck, Flame, Waves, Activity, Sparkles, CloudSnow } from 'lucide-react';

interface PlansManagerProps {
  plans: MembershipPlan[];
  amenityTypes: AmenityType[];
  onAddPlan: (newPlan: MembershipPlan) => void;
}

export default function PlansManager({ plans, amenityTypes, onAddPlan }: PlansManagerProps) {
  // New plan form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'gym' | 'private'>('gym');
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [price, setPrice] = useState<number>(600);
  
  // Private options
  const [sessionsCount, setSessionsCount] = useState<number>(12);
  const [amenitiesQuotas, setAmenitiesQuotas] = useState<{ [key: string]: number }>({
    sauna: 8,
    jacuzzi: 8,
    steam: 8,
    inbody: 2
  });

  const handleQuotaChange = (amenityId: string, value: number) => {
    setAmenitiesQuotas((prev) => ({
      ...prev,
      [amenityId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlan: MembershipPlan = {
      id: `plan-${Date.now()}`,
      name: name.trim(),
      type,
      duration_months: Number(durationMonths),
      price: Number(price),
      ...(type === 'private' && {
        sessions_count: Number(sessionsCount),
        amenities_quotas: amenitiesQuotas
      })
    };

    onAddPlan(newPlan);
    
    // Reset fields
    setName('');
    setType('gym');
    setDurationMonths(1);
    setPrice(600);
    setSessionsCount(12);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List Existing Plans */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-base font-bold text-white mb-2">الباقات والاشتراكات الحالية (Existing Membership Plans)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800/80 hover:border-cyan-500/20 rounded-xl p-5 flex flex-col justify-between transition-all">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    p.type === 'private' 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                  }`}>
                    {p.type === 'private' ? 'خاص Private VIP' : 'عادي Gym Plan'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">المدة: {p.duration_months} شهر</span>
                </div>

                <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">{p.name}</h4>
                <p className="text-lg text-emerald-400 font-bold font-mono">{p.price} EGP</p>

                {p.type === 'private' && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                    <p className="font-semibold text-slate-300">مرافق الباقة المشمولة:</p>
                    <div className="flex justify-between">
                      <span>حصص مدرب خاص:</span>
                      <strong className="text-cyan-400 font-mono">{p.sessions_count} حصة</strong>
                    </div>
                    {p.amenities_quotas && Object.entries(p.amenities_quotas).map(([id, quota]) => {
                      const title = amenityTypes.find(t => t.id === id)?.name_ar || id;
                      return (
                        <div key={id} className="flex justify-between text-[11px]">
                          <span>عداد {title}:</span>
                          <strong className="text-slate-300 font-mono">{quota} مرات</strong>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>كود الباقة: {p.id}</span>
                <span className="text-emerald-500 flex items-center gap-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>مفعلة بالبيع</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Plan Configuration Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl h-fit">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
          <PlusCircle className="w-5 h-5 text-cyan-400" />
          <span>تكوين باقة عضوية جديدة</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Plan Name */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">اسم باقة العضوية:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: الباقة البلاتينية الشاملة - 3 شهور"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white focus:outline-none"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">نوع العضوية وهيكلة العرض:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('gym')}
                className={`py-2 px-3 rounded font-bold border transition-all cursor-pointer ${
                  type === 'gym'
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                جيم عادي Gym
              </button>
              <button
                type="button"
                onClick={() => setType('private')}
                className={`py-2 px-3 rounded font-bold border transition-all cursor-pointer ${
                  type === 'private'
                    ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                خاصة Private VIP
              </button>
            </div>
          </div>

          {/* Duration & Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">مدة الاشتراك بالشهور:</label>
              <input
                type="number"
                min={1}
                max={48}
                required
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">سعر البيع الافتراضي:</label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded px-3 py-2 text-white focus:outline-none font-mono text-emerald-400"
              />
            </div>
          </div>

          {/* Condition Private Configuration */}
          {type === 'private' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/15 space-y-3.5">
              <p className="font-bold text-purple-400 border-b border-slate-800 pb-1.5 flex items-center gap-1">
                <span>⚙️ تكوين العدادات الخاصة بالباقة</span>
              </p>

              {/* Coach sessions count */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">عدد حصص المدرب الخاص الممنوحة:</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={sessionsCount}
                  onChange={(e) => setSessionsCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded px-3 py-1.5 text-white focus:outline-none font-mono text-purple-400"
                />
              </div>

              {/* Amenities counts configs */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="block text-[11px] font-bold text-slate-300">عداد استخدام المرافق الاسترخائية:</span>
                
                {amenityTypes.map((type) => (
                  <div key={type.id} className="flex justify-between items-center gap-2">
                    <span className="text-slate-400">{type.name_ar}:</span>
                    <input
                      type="number"
                      min={0}
                      value={amenitiesQuotas[type.id] ?? 0}
                      onChange={(e) => handleQuotaChange(type.id, Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center text-white focus:outline-none font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 cursor-pointer"
          >
            تثبيت وإضافة الباقة الجديدة
          </button>
        </form>
      </div>
    </div>
  );
}
