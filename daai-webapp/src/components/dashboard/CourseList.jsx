import React from 'react'
import { Link } from 'react-router-dom'

export const CourseList = ({ title, courses }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">See All</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {courses.map((course) => (
          <Link 
            to={`/fellow/learning/${course.id}`} 
            key={course.id} 
            className="block min-w-[260px] bg-slate-50 p-4 rounded-xl border border-slate-100 flex-shrink-0 hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mb-3">
              <span className="text-2xl">📚</span>
            </div>
            <h4 className="font-semibold text-slate-800 mb-2 truncate" title={course.title}>
              {course.title}
            </h4>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {course.lessons_count} lessons
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.duration}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-slate-600">{course.progress}%</span>
            </div>
          </Link>
        ))}
        {courses.length === 0 && (
          <div className="text-sm text-slate-500 py-4">No active courses found.</div>
        )}
      </div>
    </div>
  )
}
