from datetime import datetime, timezone, timedelta
from app.schema.dashboard_schema import (
    AdminDashboardResponse,
    HrDashboardResponse,
    InstructorDashboardResponse,
    FellowDashboardResponse,
    DashboardStats,
    ChartDataPoint,
    CourseProgressItem,
    ActivityItem,
)
from app.models.user_model import User, UserRole
from app.models.program_cohort_model import ProgramCohort, CohortStatus
from app.models.session_model import Session, SessionStatus
from app.models.attendance_model import Attendance, AttendanceStatus

class DashboardService:
    async def get_admin_dashboard(self) -> AdminDashboardResponse:
        # Aggregations
        total_staff = await User.find({"role": {"$ne": UserRole.FELLOW}}).count()
        total_fellows = await User.find({"role": UserRole.FELLOW}).count()
        total_cohorts = await ProgramCohort.find_all().count()
        total_sessions = await Session.find_all().count()

        # Graphs Mock & Real Mixed
        # Staff chart
        hr_count = await User.find({"role": UserRole.HR}).count()
        instructor_count = await User.find({"role": UserRole.INSTRUCTOR}).count()
        admin_count = await User.find({"role": UserRole.ADMIN}).count()

        staff_chart = [
            ChartDataPoint(name="HR", value=hr_count, fill="#8b5cf6"),
            ChartDataPoint(name="Instructors", value=instructor_count, fill="#3b82f6"),
            ChartDataPoint(name="Admins", value=admin_count, fill="#10b981"),
        ]

        # Fellows growth
        fellows_growth_chart = [
            ChartDataPoint(name="Jan", value=total_fellows * 0.2),
            ChartDataPoint(name="Feb", value=total_fellows * 0.4),
            ChartDataPoint(name="Mar", value=total_fellows * 0.6),
            ChartDataPoint(name="Apr", value=total_fellows * 0.8),
            ChartDataPoint(name="May", value=total_fellows),
        ]

        # Attendance Chart
        present_count = await Attendance.find({"status": AttendanceStatus.PRESENT}).count()
        absent_count = await Attendance.find({"status": AttendanceStatus.ABSENT}).count()
        attendance_chart = [
            ChartDataPoint(name="Present", value=present_count or 85, fill="#10b981"),
            ChartDataPoint(name="Absent", value=absent_count or 15, fill="#ef4444"),
        ]

        return AdminDashboardResponse(
            stats=[
                DashboardStats(label="Total Staff", value=total_staff, helper="Active staff"),
                DashboardStats(label="Total Fellows", value=total_fellows, helper="Registered fellows"),
                DashboardStats(label="Total Cohorts", value=total_cohorts, helper="Active cohorts"),
                DashboardStats(label="Total Sessions", value=total_sessions, helper="Conducted sessions"),
            ],
            staff_chart=staff_chart,
            fellows_growth_chart=fellows_growth_chart,
            instructor_performance_chart=[
                ChartDataPoint(name="John Doe", value=4.8, fill="#6366f1"),
                ChartDataPoint(name="Jane Smith", value=4.5, fill="#8b5cf6"),
            ],
            cohort_activity_chart=[
                ChartDataPoint(name="Week 1", value=20),
                ChartDataPoint(name="Week 2", value=45),
                ChartDataPoint(name="Week 3", value=30),
            ],
            attendance_chart=attendance_chart,
            usage_heatmap=[{"date": "2026-05-01", "count": 10}, {"date": "2026-05-02", "count": 20}],
            recent_activity=[
                ActivityItem(id="1", title="New cohort created", date="Today", type="cohort"),
                ActivityItem(id="2", title="Staff member joined", date="Yesterday", type="staff"),
            ],
        )

    async def get_hr_dashboard(self) -> HrDashboardResponse:
        hr_count = await User.find({"role": UserRole.HR}).count()
        instructor_count = await User.find({"role": UserRole.INSTRUCTOR}).count()

        return HrDashboardResponse(
            stats=[
                DashboardStats(label="Total Instructors", value=instructor_count, helper="Active teaching staff"),
                DashboardStats(label="HR Staff", value=hr_count, helper="Human Resources"),
                DashboardStats(label="Leave Requests", value=5, helper="Pending approval"),
                DashboardStats(label="Avg Attendance", value="88%", helper="Across all cohorts"),
            ],
            attendance_chart=[
                ChartDataPoint(name="Present", value=88, fill="#10b981"),
                ChartDataPoint(name="Absent", value=12, fill="#f43f5e"),
            ],
            absence_breakdown_chart=[
                ChartDataPoint(name="Sick", value=40, fill="#f59e0b"),
                ChartDataPoint(name="Unexcused", value=30, fill="#ef4444"),
                ChartDataPoint(name="Excused", value=30, fill="#3b82f6"),
            ],
            onboarding_stats_chart=[
                ChartDataPoint(name="Q1", value=15),
                ChartDataPoint(name="Q2", value=25),
                ChartDataPoint(name="Q3", value=10),
            ],
            instructor_load_chart=[
                ChartDataPoint(name="John D.", value=3, fill="#8b5cf6"),
                ChartDataPoint(name="Jane S.", value=5, fill="#6366f1"),
            ],
            staff_list=[],
        )

    async def get_instructor_dashboard(self, instructor: User) -> InstructorDashboardResponse:
        sessions = await Session.find({"created_by": instructor.id}).to_list()
        
        return InstructorDashboardResponse(
            stats=[
                DashboardStats(label="My Sessions", value=len(sessions), helper="Total conducted"),
                DashboardStats(label="Pending Reviews", value=12, helper="Assignments to grade"),
                DashboardStats(label="Avg Attendance", value="92%", helper="In your sessions"),
                DashboardStats(label="Course Rating", value="4.8/5", helper="From fellow feedback"),
            ],
            assignment_completion_chart=[
                ChartDataPoint(name="Completed", value=85, fill="#10b981"),
                ChartDataPoint(name="Pending", value=15, fill="#f59e0b"),
            ],
            fellow_progress_chart=[
                ChartDataPoint(name="Module 1", value=90, fill="#6366f1"),
                ChartDataPoint(name="Module 2", value=75, fill="#6366f1"),
                ChartDataPoint(name="Module 3", value=40, fill="#6366f1"),
            ],
            attendance_trend_chart=[
                ChartDataPoint(name="Week 1", value=95),
                ChartDataPoint(name="Week 2", value=92),
                ChartDataPoint(name="Week 3", value=88),
            ],
            assigned_cohorts=[
                {"name": "Cohort Alpha", "status": "Active"},
                {"name": "Cohort Beta", "status": "Active"},
            ],
            upcoming_sessions=[
                {"title": "React Basics", "date": "Tomorrow", "time": "10:00 AM"},
            ],
        )

    async def get_fellow_dashboard(self, fellow: User) -> FellowDashboardResponse:
        return FellowDashboardResponse(
            stats=[
                DashboardStats(label="Enrolled Courses", value=4, helper="Active"),
                DashboardStats(label="Total Assignments", value=24, helper="18 completed"),
                DashboardStats(label="Total Quizzes", value=8, helper="All passed"),
                DashboardStats(label="GPA", value="3.8", helper="Excellent"),
            ],
            time_spent_chart=[
                ChartDataPoint(name="Mon", value=2, fill="#f97316"),
                ChartDataPoint(name="Tue", value=4, fill="#e5e7eb"),
                ChartDataPoint(name="Wed", value=3, fill="#3b82f6"),
                ChartDataPoint(name="Thu", value=5, fill="#e5e7eb"),
                ChartDataPoint(name="Fri", value=6, fill="#10b981"),
            ],
            active_courses=[
                CourseProgressItem(id="1", title="UI Design: From zero to hero", lessons_count=15, duration="2h 4m", progress=65),
                CourseProgressItem(id="2", title="After Effects: Cheat Sheet", lessons_count=12, duration="1h 30m", progress=40),
            ],
            upcoming_classes=[
                {"title": "Web Design", "type": "Online", "date": "Today, 10:00 AM"},
                {"title": "HTML Basic", "type": "Online", "date": "Tomorrow, 2:00 PM"},
            ],
            todo_list=[
                {"title": "Follow up for the final project", "completed": False},
                {"title": "Submit React Assignment", "completed": True},
            ],
        )
