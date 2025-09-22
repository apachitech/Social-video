
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { mockAdminStats, mockRevenueData, mockTopCreatorsData } from '../../services/mockApi';
import { useCurrency } from '../../contexts/CurrencyContext';

const StatCard: React.FC<{ title: string; value: string | number; change?: string; changeType?: 'up' | 'down' }> = ({ title, value, change, changeType }) => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
    <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{value}</p>
    {change && (
      <p className={`text-sm mt-1 ${changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {change} vs last 24h
      </p>
    )}
  </div>
);

const DashboardView: React.FC = () => {
  const formatCurrency = useCurrency();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Revenue Today" value={formatCurrency(mockAdminStats.revenueToday)} change="+5.4%" changeType="up" />
        <StatCard title="Daily Active Users (DAU)" value={mockAdminStats.dau.toLocaleString()} />
        <StatCard title="New Users Today" value={mockAdminStats.newUsersToday.toLocaleString()} change="+12%" changeType="up" />
        <StatCard title="Pending Reports" value={mockAdminStats.reportsPending.toLocaleString()} change="+2" changeType="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" stroke="#999" fontSize={12} />
              <YAxis stroke="#999" fontSize={12} />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                }}
                />
              <Legend />
              <Line type="monotone" dataKey="value" name="Revenue ($)" stroke="#ec4899" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Live Stats</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-baseline p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md">
                    <span className="text-gray-500 dark:text-gray-400">Total Users</span>
                    <span className="font-bold text-lg">{mockAdminStats.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md">
                    <span className="text-gray-500 dark:text-gray-400">Total Videos</span>
                    <span className="font-bold text-lg">{mockAdminStats.totalVideos.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md">
                    <span className="text-gray-500 dark:text-gray-400">Live Now</span>
                    <span className="font-bold text-lg text-red-500">{mockAdminStats.liveStreamsNow.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md">
                    <span className="text-gray-500 dark:text-gray-400">MAU</span>
                    <span className="font-bold text-lg">{mockAdminStats.mau.toLocaleString()}</span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold mb-4">Top Creators (by Likes)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockTopCreatorsData} layout="vertical">
             <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={100} stroke="#999" fontSize={12} />
            <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff'
                }}
                 cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
            />
            <Bar dataKey="value" name="Total Likes" fill="#be185d" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardView;