import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  GraduationCap,
  Search,
  Bell,
  Sun
} from 'lucide-react'
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import useAuthStore from '../../store/authStore'
import { getFellowDashboard } from '../../services/dashboardService'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { GraphCard } from '../../components/dashboard/GraphCard'
import { CourseList } from '../../components/dashboard/CourseList'
import { ProfileSidebar } from '../../components/dashboard/ProfileSidebar'
import ComingSoonPage from '../ComingSoonPage'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e']

export default function FellowDashboard() {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getFellowDashboard()
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>
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
            <p className="text-slate-500 mt-1">e-Learning Dashboard</p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Top Stats */}
          <div className="flex flex-col gap-4 w-full lg:w-1/3">
            <StatsCard icon={BookOpen} title="Total Courses" value={data.stats[0]?.value} color="purple" />
            <StatsCard icon={ClipboardList} title="Total Assignments" value={data.stats[1]?.value} color="orange" />
            <StatsCard icon={HelpCircle} title="Total Quizzes" value={data.stats[2]?.value} color="green" />
          </div>

          {/* Time Spent Graph */}
          <div className="w-full lg:w-2/3">
            <GraphCard title="Time spends" className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.time_spent_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                    {data.time_spent_chart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GraphCard>
          </div>
        </div>

        {/* Active Courses */}
        <CourseList title="Active courses" courses={data.active_courses} />
      </div>

      {/* Right Sidebar */}
      <ProfileSidebar 
        user={user} 
        upcomingClasses={data.upcoming_classes} 
        todoList={data.todo_list} 
      />
    </div>
  )
}
