import React from 'react'
import { CheckCircle, Circle } from 'lucide-react'

export const CalendarWidget = ({ upcomingClasses = [], todoList = [] }) => {
  return (
    <div className="space-y-6">
      {/* Calendar Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-slate-800">Upcoming classes</h3>
        </div>
        <div className="space-y-4">
          {upcomingClasses.map((cls, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold">{cls.date.split(' ')[0]}</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">{cls.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{cls.type} • {cls.date}</p>
              </div>
            </div>
          ))}
          {upcomingClasses.length === 0 && (
            <p className="text-sm text-slate-500">No upcoming classes.</p>
          )}
        </div>
      </div>

      {/* Todo List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-base font-semibold text-slate-800 mb-4">To Do List</h3>
        <div className="space-y-3">
          {todoList.map((todo, idx) => (
            <div key={idx} className="flex items-start gap-3">
              {todo.completed ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {todo.title}
              </span>
            </div>
          ))}
          {todoList.length === 0 && (
            <p className="text-sm text-slate-500">All caught up!</p>
          )}
        </div>
      </div>
    </div>
  )
}
