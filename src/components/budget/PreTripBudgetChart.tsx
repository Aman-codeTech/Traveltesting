import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Wallet, Hotel, Utensils, Car, Ticket, ShieldCheck, Sparkles } from 'lucide-react';

interface PreTripBudgetChartProps {
  budgetTarget: number;
  daysCount: number;
  travellersCount: number;
  transportMode?: string;
  className?: string;
  compact?: boolean;
}

export const PreTripBudgetChart: React.FC<PreTripBudgetChartProps> = ({
  budgetTarget,
  daysCount,
  travellersCount,
  transportMode = 'Self / Own Vehicle',
  className = '',
  compact = false,
}) => {
  const { t } = useLanguage();

  const safeBudget = Math.max(1000, Number(budgetTarget) || 25000);
  const safeDays = Math.max(1, Number(daysCount) || 1);
  const safeNights = Math.max(0, safeDays <= 1 ? 0 : safeDays - 1);
  const safeTravellers = Math.max(1, Number(travellersCount) || 1);

  // 5 Strategic Cost Allocations
  const stayCost = safeNights > 0 ? Math.round(safeBudget * 0.35) : 0;
  const foodCost = Math.round(safeBudget * (safeNights > 0 ? 0.30 : 0.45));
  const transportCost = Math.round(safeBudget * (safeNights > 0 ? 0.15 : 0.25));
  const sightseeingCost = Math.round(safeBudget * (safeNights > 0 ? 0.10 : 0.18));
  const bufferCost = safeBudget - stayCost - foodCost - transportCost - sightseeingCost;

  const perDay = Math.round(safeBudget / safeDays);
  const perPerson = Math.round(safeBudget / safeTravellers);
  const perPersonPerDay = Math.round(safeBudget / (safeDays * safeTravellers));

  const categories = [
    {
      key: 'stay',
      name: t('budgetChartStay', 'Stays & Accommodation'),
      amount: stayCost,
      pct: safeNights > 0 ? 35 : 0,
      color: '#0F766E', // Teal Blue
      bg: 'bg-[#0F766E]',
      lightBg: 'bg-[#0F766E]/10',
      border: 'border-[#0F766E]/30',
      icon: <Hotel className="w-4 h-4 text-[#0F766E]" />,
      desc: safeNights > 0
        ? `${safeNights} ${safeNights === 1 ? 'night' : 'nights'} comfortable stay with high hygiene & breakfast`
        : 'Day trip (0 overnight hotel stays required)',
    },
    {
      key: 'food',
      name: t('budgetChartFood', 'Food & Authentic Dining'),
      amount: foodCost,
      pct: 30,
      color: '#FF6B35', // Orange
      bg: 'bg-[#FF6B35]',
      lightBg: 'bg-[#FF6B35]/10',
      border: 'border-[#FF6B35]/30',
      icon: <Utensils className="w-4 h-4 text-[#FF6B35]" />,
      desc: t('budgetChartFoodDesc', 'Covers wholesome regional thalis, snacks & famous local dhabas'),
    },
    {
      key: 'transport',
      name: t('budgetChartTransport', 'Transport, Fuel & Cabs'),
      amount: transportCost,
      pct: 15,
      color: '#2DD4BF', // Muted Aqua
      bg: 'bg-[#2DD4BF]',
      lightBg: 'bg-[#2DD4BF]/10',
      border: 'border-[#2DD4BF]/30',
      icon: <Car className="w-4 h-4 text-[#0F766E]" />,
      desc: t('budgetChartTransportDesc', 'Covers local transit, cab fares, highway tolls & parking'),
    },
    {
      key: 'sightseeing',
      name: t('budgetChartSightseeing', 'Sightseeing & Entry Fees'),
      amount: sightseeingCost,
      pct: 10,
      color: '#0B192C', // Dark Navy
      bg: 'bg-[#0B192C]',
      lightBg: 'bg-slate-100',
      border: 'border-slate-300',
      icon: <Ticket className="w-4 h-4 text-[#0B192C]" />,
      desc: t('budgetChartSightseeingDesc', 'Covers monument tickets, museum passes & cultural entry'),
    },
    {
      key: 'buffer',
      name: t('budgetChartBuffer', 'Emergency Reserve & Buffer'),
      amount: bufferCost,
      pct: 10,
      color: '#94A3B8',
      bg: 'bg-slate-400',
      lightBg: 'bg-slate-50',
      border: 'border-slate-200',
      icon: <ShieldCheck className="w-4 h-4 text-slate-600" />,
      desc: t('budgetChartBufferDesc', 'Emergency fund for unplanned experiences & local shopping'),
    },
  ];

  // Health check verdict
  let healthVerdict = t('budgetHealthOptimal', '✨ Balanced & Optimal: Comfortable standard hotels, authentic local thalis, and hassle-free transit.');
  let healthBadge = 'Balanced';
  let healthBadgeColor = 'bg-[#0F766E] text-white';

  if (perPersonPerDay >= 3500) {
    healthVerdict = t('budgetHealthLuxury', '🌟 Luxury & Experiential: High comfort with premium stays and fine dining.');
    healthBadge = 'Luxury / Premium';
    healthBadgeColor = 'bg-[#FF6B35] text-white';
  } else if (perPersonPerDay < 1400) {
    healthVerdict = t('budgetHealthBudget', '🎒 Budget Backpacker: Best suited for verified homestays, public transit and iconic street eats.');
    healthBadge = 'Budget Saver';
    healthBadgeColor = 'bg-[#2DD4BF] text-[#0B192C]';
  }

  if (compact) {
    return (
      <div className={`p-4 rounded-2xl bg-[#FAF9F6] border border-[#2DD4BF]/30 space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-[#0F766E]" />
            <h4 className="text-xs font-bold text-[#0B192C] uppercase tracking-wider">
              {t('budgetChartTitle', 'Estimated Budget Distribution Chart')}
            </h4>
          </div>
          <span className="text-xs font-bold text-[#0F766E]">₹{safeBudget.toLocaleString('en-IN')}</span>
        </div>

        {/* Multi-segment bar */}
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
          {categories.map((c) => (
            <div
              key={c.key}
              style={{ width: `${c.pct}%` }}
              className={`h-full ${c.bg} transition-all duration-500`}
              title={`${c.name}: ₹${c.amount.toLocaleString('en-IN')} (${c.pct}%)`}
            />
          ))}
        </div>

        {/* Quick pill stats */}
        <div className="flex flex-wrap gap-2 text-[11px]">
          {categories.map((c) => (
            <div key={c.key} className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="font-medium text-slate-700">{c.name}:</span>
              <span className="font-bold text-slate-900">₹{c.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#FAF9F6] rounded-3xl border-2 border-[#0F766E]/20 p-5 sm:p-6 space-y-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-[#2DD4BF]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-[#0B192C] font-heading">
                {t('budgetChartTitle', 'Estimated Budget Distribution Chart')}
              </h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${healthBadgeColor}`}>
                {healthBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('budgetChartSubtitle', 'Smart AI pre-allocation based on your duration and group size')}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right bg-white p-2.5 px-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('targetBudgetLabel', 'Budget Target')}</span>
          <span className="text-xl font-black text-[#FF6B35] font-heading">
            ₹{safeBudget.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
          <span>{t('catAccommodation', 'Stays')} (35%)</span>
          <span>{t('catFood', 'Food')} (30%)</span>
          <span>{t('catTransportation', 'Transit')} (15%)</span>
          <span>{t('catActivities', 'Sightseeing')} (10%)</span>
          <span>{t('budgetChartBuffer', 'Buffer')} (10%)</span>
        </div>
        <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden flex shadow-inner p-0.5 gap-0.5">
          {categories.map((c) => (
            <div
              key={c.key}
              style={{ width: `${c.pct}%` }}
              className={`h-full ${c.bg} rounded-full transition-all duration-500 hover:opacity-90 cursor-help`}
              title={`${c.name}: ₹${c.amount.toLocaleString('en-IN')} (${c.pct}%)`}
            />
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('durationLabel', 'Duration')}</span>
          <p className="text-base font-bold text-slate-900 font-heading">
            {safeDays} {safeDays === 1 ? t('dayUnit', 'Day') : `${safeDays} ${t('daysUnit', 'Days')} (${safeNights} ${safeNights === 1 ? 'Night' : 'Nights'})`}
          </p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('travellersCountLabel', 'Travellers')}</span>
          <p className="text-base font-bold text-slate-900 font-heading">{safeTravellers} {t('travellersCountLabel', 'Guests')}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-[#0F766E] block">{t('budgetChartDailyAvg', 'Daily Average')}</span>
          <p className="text-base font-bold text-[#0F766E] font-heading">₹{perDay.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-[#FF6B35] block">{t('budgetChartPerPerson', 'Per Person Avg')}</span>
          <p className="text-base font-bold text-[#FF6B35] font-heading">₹{perPerson.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Category Breakdown Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {categories.map((c) => (
          <div
            key={c.key}
            className={`p-3.5 bg-white rounded-2xl border ${c.border} flex flex-col justify-between space-y-2 hover:shadow-xs transition`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className={`p-1.5 rounded-lg ${c.lightBg}`}>
                  {c.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  {c.pct}%
                </span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 leading-snug">{c.name}</h5>
              <p className="text-[10px] text-slate-500 leading-tight">{c.desc}</p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-sm font-black font-heading" style={{ color: c.color }}>
                ₹{c.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Budget Health Check Box */}
      <div className="p-3.5 bg-white rounded-2xl border border-[#2DD4BF]/40 flex items-start space-x-3 text-xs">
        <Sparkles className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#0F766E] uppercase tracking-wider text-[10px] block">
            {t('budgetHealthLabel', 'AI Budget Health Check')}
          </span>
          <p className="text-slate-700 font-medium mt-0.5 leading-relaxed">
            {healthVerdict}
          </p>
        </div>
      </div>
    </div>
  );
};