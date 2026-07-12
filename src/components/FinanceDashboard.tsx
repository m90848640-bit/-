import React, { useMemo } from 'react';
import { FinanceTransaction, Member, MembershipPlan, Subscription } from '../types';
import { DollarSign, Wallet, ArrowUpRight, TrendingUp, Users, Calendar, Activity, CheckSquare, CreditCard, Landmark, CircleDot } from 'lucide-react';

interface FinanceDashboardProps {
  transactions: FinanceTransaction[];
  members: Member[];
  plans: MembershipPlan[];
  subscriptions: Subscription[];
}

export default function FinanceDashboard({
  transactions,
  members,
  plans,
  subscriptions
}: FinanceDashboardProps) {
  // 1. Calculate overall metrics
  const totalRevenue = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const activeSubscriptionsCount = useMemo(() => {
    return subscriptions.filter(sub => sub.status === 'active').length;
  }, [subscriptions]);

  const planStats = useMemo(() => {
    const stats: { [planId: string]: { name: string; salesCount: number; revenue: number } } = {};
    
    // Initialize
    plans.forEach(plan => {
      stats[plan.id] = { name: plan.name, salesCount: 0, revenue: 0 };
    });

    // Compute
    transactions.forEach(t => {
      if (stats[t.subscription_id]) {
        // Direct mapping
        stats[t.subscription_id].revenue += t.amount;
        stats[t.subscription_id].salesCount += 1;
      } else {
        // Fallback by checking the subscription
        const sub = subscriptions.find(s => s.id === t.subscription_id);
        if (sub && stats[sub.plan_id]) {
          stats[sub.plan_id].revenue += t.amount;
          stats[sub.plan_id].salesCount += 1;
        }
      }
    });

    return Object.values(stats);
  }, [transactions, plans, subscriptions]);

  // Payment method totals
  const paymentMethodsStats = useMemo(() => {
    const methods = { cash: 0, card: 0, instapay: 0, bank_transfer: 0 };
    transactions.forEach(t => {
      if (t.payment_method in methods) {
        methods[t.payment_method] += t.amount;
      }
    });
    return methods;
  }, [transactions]);

  // Target calculation (e.g., target 50,000 EGP per month)
  const monthlyTarget = 50000;
  const targetPercent = Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100));

  return (
    <div className="space-y-6">
      {/* 4 Cards Row for Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">إجمالي الإيرادات والتحصيل</span>
            <strong className="text-2xl text-white font-mono block mt-1.5">{totalRevenue.toLocaleString()} EGP</strong>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>معدل نمو مستقر +12%</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Active Subscriptions */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">الاشتراكات النشطة حالياً</span>
            <strong className="text-2xl text-white font-mono block mt-1.5">{activeSubscriptionsCount}</strong>
            <span className="text-[10px] text-slate-500 block mt-1">من أصل {members.length} عضو مسجلين بالسيستم</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Target sales */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">نسبة تحقيق الهدف الشهري</span>
            <strong className="text-2xl text-white font-mono block mt-1.5">{targetPercent}%</strong>
            <div className="h-1.5 w-28 bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${targetPercent}%` }}></div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-950/40 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Average sale ticket */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">متوسط قيمة الاشتراك الواحد</span>
            <strong className="text-2xl text-white font-mono block mt-1.5">
              {transactions.length > 0 ? Math.round(totalRevenue / transactions.length).toLocaleString() : 0} EGP
            </strong>
            <span className="text-[10px] text-slate-500 block mt-1">بناءً على {transactions.length} مبيعات</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Plan Performance & Payment breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Plan performance analytics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex justify-between items-center">
              <span>تحليل الإيرادات حسب نوع الباقة (Revenue by Membership Plan)</span>
              <span className="text-xs text-slate-500">حركة المبيعات</span>
            </h3>

            <div className="space-y-4">
              {planStats.map((pStat, index) => {
                const percentage = totalRevenue > 0 ? Math.round((pStat.revenue / totalRevenue) * 100) : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-200">{pStat.name}</span>
                        <span className="text-[10px] text-slate-500 block">عدد مبيعات: {pStat.salesCount}</span>
                      </div>
                      <div className="text-right font-mono text-slate-300 font-semibold">
                        <span>{pStat.revenue.toLocaleString()} EGP</span>
                        <span className="text-cyan-400 text-[10px] block font-normal">({percentage}%)</span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                      <div 
                        className={`h-full rounded-full ${
                          pStat.name.includes('VIP') 
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">طرق الدفع والتحصيل (Collection Methods)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">كاش | Cash</span>
                <strong className="text-base text-emerald-400 font-mono block mt-1">{paymentMethodsStats.cash.toLocaleString()} EGP</strong>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full inline-block mt-2">
                  {totalRevenue > 0 ? Math.round((paymentMethodsStats.cash / totalRevenue) * 100) : 0}%
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">فيزا | Card</span>
                <strong className="text-base text-cyan-400 font-mono block mt-1">{paymentMethodsStats.card.toLocaleString()} EGP</strong>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full inline-block mt-2">
                  {totalRevenue > 0 ? Math.round((paymentMethodsStats.card / totalRevenue) * 100) : 0}%
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">إنستا باي | InstaPay</span>
                <strong className="text-base text-purple-400 font-mono block mt-1">{paymentMethodsStats.instapay.toLocaleString()} EGP</strong>
                <span className="text-[9px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full inline-block mt-2">
                  {totalRevenue > 0 ? Math.round((paymentMethodsStats.instapay / totalRevenue) * 100) : 0}%
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">تحويل بنكي</span>
                <strong className="text-base text-yellow-400 font-mono block mt-1">{paymentMethodsStats.bank_transfer.toLocaleString()} EGP</strong>
                <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full inline-block mt-2">
                  {totalRevenue > 0 ? Math.round((paymentMethodsStats.bank_transfer / totalRevenue) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Ledger of Recent Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex justify-between items-center">
              <span>دفتر القيود والمعاملات السريعة</span>
              <span className="text-xs text-slate-500">Finance Ledger</span>
            </h3>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => {
                const member = members.find(m => m.id === t.member_id);
                return (
                  <div key={t.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1.5 hover:border-slate-700/80 transition-all">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-200 block truncate max-w-[130px]">{member?.name || 'عضو جديد'}</strong>
                      <strong className="text-emerald-400 font-mono">+{t.amount} EGP</strong>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>{t.date}</span>
                      <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[9px] text-cyan-400 uppercase font-semibold">
                        {t.payment_method === 'cash' && <Wallet className="w-2.5 h-2.5" />}
                        {t.payment_method === 'card' && <CreditCard className="w-2.5 h-2.5" />}
                        {t.payment_method === 'instapay' && <CircleDot className="w-2.5 h-2.5" />}
                        {t.payment_method === 'bank_transfer' && <Landmark className="w-2.5 h-2.5" />}
                        <span>{t.payment_method}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-500 text-center">
            إجمالي عدد المعاملات المسجلة: <strong>{transactions.length} إيصالات تحصيل</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
