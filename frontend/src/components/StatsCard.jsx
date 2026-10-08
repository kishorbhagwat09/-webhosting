import React from 'react';

const StatsCard = ({ title, icon: Icon, value, subtext, percent, color = 'indigo' }) => {
  const colorStyles = {
    indigo: {
      border: 'border-indigo-500/30',
      bgIcon: 'bg-indigo-950/60 text-indigo-400',
      bar: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    },
    cyan: {
      border: 'border-cyan-500/30',
      bgIcon: 'bg-cyan-950/60 text-cyan-400',
      bar: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    },
    emerald: {
      border: 'border-emerald-500/30',
      bgIcon: 'bg-emerald-950/60 text-emerald-400',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    },
    amber: {
      border: 'border-amber-500/30',
      bgIcon: 'bg-amber-950/60 text-amber-400',
      bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
    },
  }[color] || {
    border: 'border-slate-800',
    bgIcon: 'bg-slate-800 text-slate-300',
    bar: 'bg-indigo-500',
  };

  return (
    <div className={`glass-panel glass-panel-hover p-5 rounded-2xl border ${colorStyles.border}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl ${colorStyles.bgIcon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-2xl font-black text-slate-100">{value}</span>
        {subtext && <span className="text-xs text-slate-400">{subtext}</span>}
      </div>
      {percent !== undefined && (
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full ${colorStyles.bar} transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default StatsCard;
