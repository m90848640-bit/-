import React, { useState, useMemo } from 'react';
import { Member, Subscription } from '../types';
import { Search, UserCheck, ShieldAlert, BadgeInfo, Users, Phone, Barcode, ChevronRight, PlusCircle, CreditCard, Dumbbell } from 'lucide-react';

interface MemberSearchProps {
  members: Member[];
  subscriptions: Subscription[];
  onSelectMember: (memberId: string) => void;
  onAddNewMemberClick: () => void;
}

type FilterStatus = 'all' | 'gym' | 'private' | 'active' | 'expired';

export default function MemberSearch({
  members,
  subscriptions,
  onSelectMember,
  onAddNewMemberClick
}: MemberSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  // Match each member to their subscription
  const memberSubscriptionMap = useMemo(() => {
    const map = new Map<string, Subscription>();
    subscriptions.forEach((sub) => {
      // If active, override or pick the latest
      const existing = map.get(sub.member_id);
      if (!existing || (sub.status === 'active' && existing.status !== 'active')) {
        map.set(sub.member_id, sub);
      }
    });
    return map;
  }, [subscriptions]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const sub = memberSubscriptionMap.get(member.id);
      
      // 1. Search text filter (Name, Phone, Barcode, Card ID)
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.phone.includes(query) ||
        member.barcode.includes(query) ||
        member.card_id.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Tab filter
      switch (activeFilter) {
        case 'gym':
          return sub && sub.plan_id.includes('gym');
        case 'private':
          return sub && sub.plan_id.includes('private');
        case 'active':
          return sub && sub.status === 'active';
        case 'expired':
          return !sub || sub.status === 'expired';
        case 'all':
        default:
          return true;
      }
    });
  }, [members, memberSubscriptionMap, searchTerm, activeFilter]);

  // Statistics calculation for filter pills
  const stats = useMemo(() => {
    let active = 0;
    let expired = 0;
    let gymCount = 0;
    let privateCount = 0;

    members.forEach((m) => {
      const sub = memberSubscriptionMap.get(m.id);
      if (sub) {
        if (sub.status === 'active') active++;
        else expired++;

        if (sub.plan_id.includes('private')) privateCount++;
        else gymCount++;
      } else {
        expired++;
      }
    });

    return { active, expired, gymCount, privateCount, total: members.length };
  }, [members, memberSubscriptionMap]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
      {/* Header with quick registration button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>البحث وإدارة أعضاء الجيم</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            ابحث عن الأعضاء المشتركين، وسجّل حضورهم، أو تصفّح باقاتهم ومستويات الاستهلاك فوراً.
          </p>
        </div>

        <button
          onClick={onAddNewMemberClick}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/10 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة عضو جديد واشتراك</span>
        </button>
      </div>

      {/* Main Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث بالاسم، رقم الهاتف، الباركود، أو رقم الكارت الشريطي..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pr-10 pl-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-sans text-right"
          dir="rtl"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            className="absolute inset-y-0 left-3 flex items-center text-xs text-slate-500 hover:text-white"
          >
            مسح الكل
          </button>
        )}
      </div>

      {/* Filter Tabs / Stat Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <span>الكل ({stats.total})</span>
        </button>

        <button
          onClick={() => setActiveFilter('active')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === 'active'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>النشطين ({stats.active})</span>
        </button>

        <button
          onClick={() => setActiveFilter('expired')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === 'expired'
              ? 'bg-rose-500/10 border-rose-500 text-rose-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          <span>منتهي الصلاحية ({stats.expired})</span>
        </button>

        <button
          onClick={() => setActiveFilter('gym')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === 'gym'
              ? 'bg-blue-500/10 border-blue-500 text-blue-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>باقة جيم عادية ({stats.gymCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('private')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            activeFilter === 'private'
              ? 'bg-purple-500/10 border-purple-500 text-purple-400'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>باقة خاصة Private VIP ({stats.privateCount})</span>
        </button>
      </div>

      {/* Members Grid / List */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member) => {
            const sub = memberSubscriptionMap.get(member.id);
            const isActive = sub && sub.status === 'active';
            const isPrivate = sub && sub.plan_id.includes('private');

            return (
              <div
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/30 rounded-xl p-4 transition-all duration-200 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.photo_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=150'}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-800 group-hover:border-cyan-500/30 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                      {member.name}
                    </h4>
                    
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{member.phone.replace(/(\d{3})\d+(\d{2})/, "$1••••••$2")}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Barcode className="w-3 h-3 text-slate-500" />
                        <span>{member.barcode}</span>
                      </span>
                    </div>

                    <div className="flex gap-1.5 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                      }`}>
                        {isActive ? 'نشط' : 'منتهي'}
                      </span>
                      {sub && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isPrivate 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/10'
                        }`}>
                          {isPrivate ? 'باقة خاصة Private' : 'باقة جيم Gym'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-slate-500 group-hover:text-cyan-400 transition-colors pl-1">
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-950 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm">لم يتم العثور على نتائج تطابق معايير البحث.</p>
          <p className="text-slate-600 text-xs mt-1">تأكد من كتابة الاسم صحيحاً أو الرقم الشريطي بالكامل.</p>
        </div>
      )}
    </div>
  );
}
