import React from 'react'
import { CalendarWidget } from './CalendarWidget'

export const ProfileSidebar = ({ user, upcomingClasses, todoList }) => {
  return (
    <div className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 mb-4 overflow-hidden shadow-inner flex items-center justify-center">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-blue-600 font-bold">
              {user?.full_name?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-slate-800">{user?.full_name}</h2>
        <p className="text-sm text-slate-500 mb-4">@{user?.email?.split('@')[0]}</p>
        
        <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Role</p>
            <p className="text-sm font-medium text-slate-800 capitalize">{user?.role?.toLowerCase() || 'Fellow'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status</p>
            <p className="text-sm font-medium text-emerald-600">Active</p>
          </div>
        </div>
        
        <button className="w-full mt-6 py-2 px-4 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors text-sm">
          Edit Profile
        </button>
      </div>

      {/* Widgets */}
      <CalendarWidget upcomingClasses={upcomingClasses} todoList={todoList} />
    </div>
  )
}
