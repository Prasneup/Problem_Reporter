import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';
import type { Report } from '../../types';

interface ChartProps {
  reports: Report[];
}

export const CategoryBarChart: React.FC<ChartProps> = ({ reports }) => {
  const data = reports.reduce((acc: { name: string; count: number }[], report) => {
    const existing = acc.find(item => item.name === report.category);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: report.category, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="w-full h-64 bg-slate-900/40 border border-slate-800/60 rounded-xl p-4">
      <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Reports by Category</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
            labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '11px' }}
            itemStyle={{ color: '#60a5fa', fontSize: '11px' }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ResolutionLineChart: React.FC<ChartProps> = ({ reports }) => {
  const data = [
    { month: 'Jan', submitted: 12, resolved: 8 },
    { month: 'Feb', submitted: 18, resolved: 14 },
    { month: 'Mar', submitted: 25, resolved: 17 },
    { month: 'Apr', submitted: 30, resolved: 22 },
    { month: 'May', submitted: 42, resolved: 31 },
    { month: 'Jun', submitted: reports.length + 15, resolved: reports.filter(r => r.status === 'Resolved').length + 8 }
  ];

  return (
    <div className="w-full h-64 bg-slate-900/40 border border-slate-800/60 rounded-xl p-4">
      <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Submission vs Resolution Trends</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
            labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '11px' }}
            itemStyle={{ fontSize: '11px' }}
          />
          <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSubmitted)" name="Submitted" strokeWidth={2} />
          <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default CategoryBarChart;
