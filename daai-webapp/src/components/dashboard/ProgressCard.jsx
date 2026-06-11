import React from 'react'

export const ProgressCard = ({ title, progress, subtitle }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h4 className="text-base font-semibold text-slate-800">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className="text-sm font-medium text-slate-700">{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3">
        <div 
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}
