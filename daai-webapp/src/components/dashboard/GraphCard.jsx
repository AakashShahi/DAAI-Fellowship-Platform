import React from 'react'

export const GraphCard = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="w-full h-64 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
