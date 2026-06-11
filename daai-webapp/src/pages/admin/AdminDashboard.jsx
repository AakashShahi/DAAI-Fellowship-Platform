import React, { useState, useEffect } from 'react'
import {
  Users,
  Briefcase,
  Layers,
  CalendarCheck,
  Search,
  Bell,
  Sun
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import useAuthStore from '../../store/authStore'
import { getAdminDashboard } from '../../services/dashboardService'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { GraphCard } from '../../components/dashboard/GraphCard'
import { ProfileSidebar } from '../../components/dashboard/ProfileSidebar'
import ComingSoonPage from '../ComingSoonPage'

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e']

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getAdminDashboard()
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Admin Dashboard...</div>
  }

  if (!data) return <ComingSoonPage />

  return (
    <div className="flex flex-col xl:flex-row gap-6 font-sans">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              Morning, {user?.full_name?.split(' ')[0]} <Sun className="text-orange-400" size={28} />
            </h1>
            <p className="text-slate-500 mt-1">System Overview Dashboard</p>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={Briefcase} title="Total Staff" value={data.stats[0]?.value} helper="Active staff" color="blue" />
          <StatsCard icon={Users} title="Total Fellows" value={data.stats[1]?.value} helper="Registered fellows" color="purple" />
          <StatsCard icon={Layers} title="Total Cohorts" value={data.stats[2]?.value} helper="Active cohorts" color="orange" />
          <StatsCard icon={CalendarCheck} title="Total Sessions" value={data.stats[3]?.value} helper="Conducted sessions" color="green" />
        </div>

        {/* Graphs Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraphCard title="Staff Distribution">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.staff_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                  {data.staff_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraphCard>

          <GraphCard title="Fellow Growth">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.fellows_growth_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ strokeWidth: 4, r: 6, fill: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>

        {/* Graphs Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraphCard title="Platform Attendance Overview">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.attendance_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.attendance_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </GraphCard>
          
          <GraphCard title="Instructor Performance">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.instructor_performance_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {data.instructor_performance_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      </div>

      {/* Right Sidebar */}
      <ProfileSidebar 
        user={user} 
        upcomingClasses={data.upcoming_sessions?.length > 0 ? data.upcoming_sessions : [
          { title: "No upcoming sessions", type: "Internal", date: "-" },
        ]} 
        todoList={[
          { title: "Review platform metrics", completed: false },
          { title: "Approve new HR account", completed: true },
        ]} 
      />
    </div>
  )
}
