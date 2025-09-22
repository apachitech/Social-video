

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { mockAdminStats, mockRevenueData, mockTopCreatorsData } from '../../services/mockApi';

const StatCard: React.FC<{ title: string; value: string | number; change?: string; changeType?: 'up' | 'down' }> = ({ title, value, change, changeType }) => (
  <div className="bg-zinc-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-sm font-medium text-gray-400">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
    {change && (
      <p className={`text-sm mt-1 ${changeType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {change} vs last month
      </p>
    )}
  </div>
);

const AdminDashboardView: React.FC = () => {
  return (
    <div className="h-full w-full bg-zinc-900 text-white overflow-y-auto pb-16 p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Users" value={mockAdminStats.activeUsers.toLocaleString()} change="+5.4%" changeType="up" />
        {/* FIX: Replaced non-existent 'videosUploadedToday' with 'newUsersToday' from mockAdminStats and updated the title. */}
        <StatCard title="New Users Today" value={mockAdminStats.newUsersToday.toLocaleString()} />
        <StatCard title="Live Streams Now" value={mockAdminStats.liveStreamsNow.toLocaleString()} />
        <StatCard title="Revenue Today" value={`$${mockAdminStats.revenueToday.toLocaleString()}`} change="-1.2%" changeType="down" />
      </div>

      <div className="bg-zinc-800 p-4 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-zinc-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Top Creators (by Likes)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockTopCreatorsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={100} stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} cursor={{fill: '#333'}} />
            <Legend />
            <Bar dataKey="value" fill="#be185d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboardView;
