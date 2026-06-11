import React, { useState, useEffect } from 'react'
import {
  Users,
  CalendarCheck,
  CheckCircle,
  Star,
  Search,
  Bell,
  Sun
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import useAuthStore from '../../store/authStore'
import { getInstructorDashboard } from '../../services/dashboardService'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { GraphCard } from '../../components/dashboard/GraphCard'
import { ProfileSidebar } from '../../components/dashboard/ProfileSidebar'
import ComingSoonPage from '../ComingSoonPage'

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#8b5cf6']

export default function InstructorDashboard() {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getInstructorDashboard()
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Instructor Dashboard...</div>
  }

  if (!data) return <ComingSoonPage />

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-slate-50/50 p-6 xl:p-8 gap-8 font-sans">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              Morning, {user?.full_name?.split(' ')[0]} <Sun className="text-orange-400" size={28} />
            </h1>
            <p className="text-slate-500 mt-1">Teaching & Learning Hub</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-64 transition-all"
              />
            </div>
            <button className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={CalendarCheck} title="My Sessions" value={data.stats[0]?.value} helper="Total conducted" color="blue" />
          <StatsCard icon={CheckCircle} title="Pending Reviews" value={data.stats[1]?.value} helper="Assignments to grade" color="orange" />
          <StatsCard icon={Users} title="Avg Attendance" value={data.stats[2]?.value} helper="In your sessions" color="green" />
          <StatsCard icon={Star} title="Course Rating" value={data.stats[3]?.value} helper="From fellow feedback" color="purple" />
        </div>

        {/* Graphs Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraphCard title="Assignment Completion">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.assignment_completion_chart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.assignment_completion_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </GraphCard>

          <GraphCard title="Fellow Progress by Module">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fellow_progress_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                  {data.fellow_progress_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>

        {/* Graphs Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          <GraphCard title="Attendance Trend" className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.attendance_trend_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={4} dot={{ strokeWidth: 4, r: 6, fill: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </GraphCard>
        </div>
      </div>

      {/* Right Sidebar */}
      <ProfileSidebar 
        user={user} 
        upcomingClasses={data.upcoming_sessions} 
        todoList={[
          { title: "Grade React Final Assignments", completed: false },
          { title: "Upload Module 3 Materials", completed: false },
          { title: "Review attendance records", completed: true }
        ]} 
      />
    </div>
  )
}
