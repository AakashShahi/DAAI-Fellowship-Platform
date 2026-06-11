from pydantic import BaseModel
from typing import Any

class ChartDataPoint(BaseModel):
    name: str
    value: int | float
    fill: str | None = None

class DashboardStats(BaseModel):
    label: str
    value: str | int | float
    trend: str | None = None
    helper: str | None = None

class CourseProgressItem(BaseModel):
    id: str
    title: str
    lessons_count: int
    duration: str
    progress: int

class ActivityItem(BaseModel):
    id: str
    title: str
    date: str
    type: str

class AdminDashboardResponse(BaseModel):
    stats: list[DashboardStats]
    staff_chart: list[ChartDataPoint]
    fellows_growth_chart: list[ChartDataPoint]
    instructor_performance_chart: list[ChartDataPoint]
    cohort_activity_chart: list[ChartDataPoint]
    attendance_chart: list[ChartDataPoint]
    usage_heatmap: list[dict[str, Any]]
    recent_activity: list[ActivityItem]

class HrDashboardResponse(BaseModel):
    stats: list[DashboardStats]
    attendance_chart: list[ChartDataPoint]
    absence_breakdown_chart: list[ChartDataPoint]
    onboarding_stats_chart: list[ChartDataPoint]
    instructor_load_chart: list[ChartDataPoint]
    staff_list: list[dict[str, Any]]

class InstructorDashboardResponse(BaseModel):
    stats: list[DashboardStats]
    assignment_completion_chart: list[ChartDataPoint]
    fellow_progress_chart: list[ChartDataPoint]
    attendance_trend_chart: list[ChartDataPoint]
    assigned_cohorts: list[dict[str, Any]]
    upcoming_sessions: list[dict[str, Any]]

class FellowDashboardResponse(BaseModel):
    stats: list[DashboardStats]
    time_spent_chart: list[ChartDataPoint]
    active_courses: list[CourseProgressItem]
    upcoming_classes: list[dict[str, Any]]
    todo_list: list[dict[str, Any]]
