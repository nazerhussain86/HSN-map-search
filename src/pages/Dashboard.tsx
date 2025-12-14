
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,  ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MINISTRY_STATS } from '../data';
import StatCard from '../components/StatCard';
import { Package, Factory, Building2, TrendingUp, Search } from 'lucide-react';

const Dashboard: React.FC = () => {
  const sortedStats = [...MINISTRY_STATS].sort((a, b) => b.count - a.count).slice(0, 10);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#19FF19', '#1919FF', '#FF19FF', '#19FFFF'];

  return (
    <div className="space-y-8 bg-gray-50 text-gray-800">

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back,</h1>
          <p className="text-slate-500 mt-1">Here's a snapshot of the HSN code landscape.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search HSN codes..."
            className="pl-10 pr-4 py-2 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total HS Codes"
          value="11,651"
          color="text-blue-500"
          icon={<Package size={24} />}
          trend="+12% vs last year"
        />
        <StatCard
          title="Ministries Covered"
          value="31"
          color="text-indigo-500"
          icon={<Building2 size={24} />}
        />
        <StatCard
          title="Top Sector"
          value="Chemicals"
          color="text-emerald-500"
          icon={<Factory size={24} />}
          trend="1,900 codes"
        />
        <StatCard
          title="Active PLI Schemes"
          value="14"
          color="text-orange-500"
          icon={<TrendingUp size={24} />}
          trend="Growth Focused"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart - taking 2/3 of the space */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top 10 Ministries by Product Count</h3>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedStats} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="url(#colorUv)" radius={[0, 4, 4, 0]} barSize={20}>
                  {sortedStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - taking 1/3 of the space */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Sectoral Distribution</h3>
          <div className="h-96 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {sortedStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Key Initiatives */}
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-blue-800 mb-2">HSN Code Lookup</h4>
            <p className="text-sm text-slate-600">Find specific HSN codes and their details.</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-emerald-800 mb-2">AI Product Classifier</h4>
            <p className="text-sm text-slate-600">Get assistance in classifying your products.</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:shadow-lg transition-shadow">
            <h4 className="font-semibold text-indigo-800 mb-2">Landed Cost Calculator</h4>
            <p className="text-sm text-slate-600">Estimate the total cost of imported goods.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
