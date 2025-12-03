import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MINISTRY_STATS } from '../data';
import StatCard from '../components/StatCard';
import { Package, Factory, Building2, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const sortedStats = [...MINISTRY_STATS].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total HS Codes Mapped" 
          value="11,651" 
          color="bg-blue-500" 
          icon={<Package size={24} />} 
          trend="+12% vs last year"
        />
        <StatCard 
          title="Ministries Covered" 
          value="31" 
          color="bg-indigo-500" 
          icon={<Building2 size={24} />} 
        />
        <StatCard 
          title="Top Sector (Codes)" 
          value="Chemicals" 
          color="bg-emerald-500" 
          icon={<Factory size={24} />} 
          trend="1,900 codes"
        />
        <StatCard 
          title="Active PLI Schemes" 
          value="14" 
          color="bg-orange-500" 
          icon={<TrendingUp size={24} />} 
          trend="Growth Focused"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top 10 Ministries by Product Count</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Sectoral Distribution</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {sortedStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Updates / Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Key Initiatives</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-blue-700 mb-2">Manufacture in India</h4>
            <p className="text-sm text-slate-600">Product-centric policy interventions to boost domestic production capabilities and value chain integration.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-blue-700 mb-2">Strengthen Brand India</h4>
            <p className="text-sm text-slate-600">Robust quality ecosystem through Quality Control Orders (QCOs) to enhance global competitiveness.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-blue-700 mb-2">Make for the World</h4>
            <p className="text-sm text-slate-600">Developing trade prowess through import monitoring, substitution, and export promotion strategies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
