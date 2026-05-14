#!/usr/bin/env python3
"""
Development seed for DAAI Fellowship Platform.

Run from daai-backend (loads .env from cwd):
  python seed.py

Optional full reset of seed-owned catalog (development only):
  SEED_RESET=1 python seed.py

Safety:
  - Refuses to run when APP_ENV is production (unless SEED_ALLOW=1 is set).
  - SEED_RESET removes seed track slugs and users whose email starts with daai-seed- @example.com

Test accounts (password for all: Password123):
  daai-seed-admin@example.com
  daai-seed-mentor@example.com
  daai-seed-fellow-aws@example.com
  daai-seed-fellow-aws2@example.com
  daai-seed-fellow-arch@example.com
  daai-seed-fellow-qa@example.com
  daai-seed-fellow-sf@example.com
"""
from __future__ import annotations

import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.core.database import close_mongo_connection, init_db
from app.models.assignment_model import Assignment, AssignmentStatus
from app.models.batch_model import Batch, BatchStatus
from app.models.enrollment_model import Enrollment, EnrollmentStatus
from app.models.learning_module_model import LearningModule, LearningModuleStatus
from app.models.lesson_model import Lesson, LessonStatus
from app.models.lesson_progress_model import LessonProgress, LessonProgressStatus
from app.models.submission_model import Submission, SubmissionStatus
from app.models.track_model import Track, TrackStatus
from app.models.user_model import LearningTrack, User, UserRole
from app.utils.password import hash_password
from beanie import PydanticObjectId
from pymongo.errors import DuplicateKeyError

# Seed accounts use @example.com (RFC-friendly for validators). Local part prefix scopes wipes.
SEED_EMAILS = {
    "admin": "daai-seed-admin@example.com",
    "mentor": "daai-seed-mentor@example.com",
    "fellow_aws": "daai-seed-fellow-aws@example.com",
    "fellow_aws2": "daai-seed-fellow-aws2@example.com",
    "fellow_arch": "daai-seed-fellow-arch@example.com",
    "fellow_qa": "daai-seed-fellow-qa@example.com",
    "fellow_sf": "daai-seed-fellow-sf@example.com",
}
SEED_PASSWORD = "Password123"
SEED_TRACK_SLUGS = (
    "aws-cloud-practitioner",
    "aws-solutions-architect",
    "qa-engineering",
    "salesforce",
)


def _log(msg: str) -> None:
    print(msg, flush=True)


def _require_safe_env() -> None:
    env = (os.getenv("APP_ENV") or getattr(settings, "APP_ENV", None) or "development")
    env = str(env).strip().lower()
    production_like = env in {"production", "prod", "live"}
    if production_like and os.getenv("SEED_ALLOW", "").strip() != "1":
        _log("Refusing to seed: APP_ENV looks like production. Set SEED_ALLOW=1 to override.")
        sys.exit(1)


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _wipe_seed_catalog() -> None:
    """Remove seed tracks (and dependent rows) plus seed test users."""

    async def _delete_many(model, q: dict) -> None:
        docs = await model.find(q).to_list()
        for d in docs:
            await d.delete()

    tracks = await Track.find({"slug": {"$in": list(SEED_TRACK_SLUGS)}}).to_list()
    tids = [t.id for t in tracks]
    if not tids:
        _log("Seed reset: no matching tracks found; cleaning seed test users only.")
    else:
        await _delete_many(Submission, {"track_id": {"$in": tids}})
        await _delete_many(LessonProgress, {"track_id": {"$in": tids}})
        await _delete_many(Enrollment, {"track_id": {"$in": tids}})
        await _delete_many(Assignment, {"track_id": {"$in": tids}})
        await _delete_many(Lesson, {"track_id": {"$in": tids}})
        await _delete_many(LearningModule, {"track_id": {"$in": tids}})
        await _delete_many(Batch, {"track_id": {"$in": tids}})
        await _delete_many(Track, {"_id": {"$in": tids}})

    seed_users = await User.find(
        {"email": {"$regex": r"^daai-seed-.*@example\.com$"}},
    ).to_list()
    for u in seed_users:
        await _delete_many(LessonProgress, {"fellow_id": u.id})
        await _delete_many(Submission, {"fellow_id": u.id})
        await _delete_many(Enrollment, {"fellow_id": u.id})
        await u.delete()

    _log("Seed reset: cleared seed tracks and seed test users.")


async def _ensure_user(
    *,
    email: str,
    full_name: str,
    role: UserRole,
    learning_track: LearningTrack | None = None,
) -> User:
    existing = await User.find_one(User.email == email.lower())
    hp = hash_password(SEED_PASSWORD)
    if existing:
        existing.full_name = full_name
        existing.hashed_password = hp
        existing.role = role
        existing.learning_track = learning_track
        existing.is_active = True
        existing.updated_at = _now()
        await existing.save()
        return existing
    u = User(
        full_name=full_name,
        email=email.lower(),
        hashed_password=hp,
        role=role,
        learning_track=learning_track,
        created_at=_now(),
        updated_at=_now(),
    )
    await u.insert()
    return u


async def _ensure_track(
    *,
    slug: str,
    title: str,
    description: str,
    duration: str,
    difficulty: str,
) -> Track:
    t = await Track.find_one(Track.slug == slug)
    if t:
        t.title = title
        t.description = description
        t.duration = duration
        t.difficulty = difficulty
        t.status = TrackStatus.ACTIVE
        t.updated_at = _now()
        await t.save()
        return t
    t = Track(
        title=title,
        slug=slug,
        description=description,
        duration=duration,
        difficulty=difficulty,
        status=TrackStatus.ACTIVE,
        created_at=_now(),
        updated_at=_now(),
    )
    await t.insert()
    return t


async def _ensure_batch(*, name: str, track_id: PydanticObjectId) -> Batch:
    b = await Batch.find_one(Batch.name == name, Batch.track_id == track_id)
    start = datetime(2026, 1, 15, tzinfo=timezone.utc)
    end = datetime(2026, 12, 15, tzinfo=timezone.utc)
    if b:
        b.start_date = start
        b.end_date = end
        b.status = BatchStatus.ACTIVE
        b.updated_at = _now()
        await b.save()
        return b
    b = Batch(
        name=name,
        track_id=track_id,
        start_date=start,
        end_date=end,
        status=BatchStatus.ACTIVE,
        created_at=_now(),
        updated_at=_now(),
    )
    await b.insert()
    return b


async def _ensure_module(
    *,
    track_id: PydanticObjectId,
    title: str,
    description: str,
    order: int,
) -> LearningModule:
    m = await LearningModule.find_one(
        LearningModule.track_id == track_id,
        LearningModule.title == title,
    )
    if m:
        m.description = description
        m.order = order
        m.status = LearningModuleStatus.PUBLISHED
        m.updated_at = _now()
        await m.save()
        return m
    m = LearningModule(
        title=title,
        description=description,
        track_id=track_id,
        order=order,
        status=LearningModuleStatus.PUBLISHED,
        created_at=_now(),
        updated_at=_now(),
    )
    await m.insert()
    return m


async def _ensure_lesson(
    *,
    module_id: PydanticObjectId,
    track_id: PydanticObjectId,
    title: str,
    content: str,
    order: int,
    minutes: int,
) -> Lesson:
    les = await Lesson.find_one(Lesson.module_id == module_id, Lesson.title == title)
    if les:
        les.content = content
        les.order = order
        les.estimated_minutes = minutes
        les.status = LessonStatus.PUBLISHED
        les.updated_at = _now()
        await les.save()
        return les
    les = Lesson(
        title=title,
        content=content,
        video_url="",
        resource_url="",
        module_id=module_id,
        track_id=track_id,
        order=order,
        estimated_minutes=minutes,
        status=LessonStatus.PUBLISHED,
        created_at=_now(),
        updated_at=_now(),
    )
    await les.insert()
    return les


async def _ensure_assignment(
    *,
    admin_id: PydanticObjectId,
    track_id: PydanticObjectId,
    module_id: PydanticObjectId | None,
    title: str,
    description: str,
    instructions: str,
    status: AssignmentStatus,
    due_days: int,
    max_score: int,
) -> Assignment:
    a = await Assignment.find_one(Assignment.track_id == track_id, Assignment.title == title)
    due = _now()
    if due_days:
        due = due + timedelta(days=due_days)
    if a:
        a.description = description
        a.instructions = instructions
        a.module_id = module_id
        a.status = status
        a.due_date = due
        a.max_score = max_score
        a.updated_at = _now()
        await a.save()
        return a
    a = Assignment(
        title=title,
        description=description,
        instructions=instructions,
        track_id=track_id,
        module_id=module_id,
        due_date=due,
        max_score=max_score,
        status=status,
        created_by=admin_id,
        created_at=_now(),
        updated_at=_now(),
    )
    await a.insert()
    return a


async def _ensure_enrollment(*, fellow_id: PydanticObjectId, track_id: PydanticObjectId, batch_id: PydanticObjectId) -> None:
    existing = await Enrollment.find_one(
        Enrollment.fellow_id == fellow_id,
        Enrollment.status == EnrollmentStatus.ACTIVE,
    )
    if existing:
        if existing.track_id == track_id and existing.batch_id == batch_id:
            return
        existing.status = EnrollmentStatus.WITHDRAWN
        existing.updated_at = _now()
        await existing.save()
    e = Enrollment(
        fellow_id=fellow_id,
        track_id=track_id,
        batch_id=batch_id,
        status=EnrollmentStatus.ACTIVE,
        enrolled_at=_now(),
        created_at=_now(),
        updated_at=_now(),
    )
    await e.insert()


async def _ensure_submission(
    *,
    assignment: Assignment,
    fellow_id: PydanticObjectId,
    text: str,
    status: SubmissionStatus,
    score: int | None,
    feedback: str,
    reviewed_by: PydanticObjectId | None,
) -> None:
    s = await Submission.find_one(
        Submission.assignment_id == assignment.id,
        Submission.fellow_id == fellow_id,
    )
    now = _now()
    reviewed_at = now if status != SubmissionStatus.SUBMITTED else None
    if s:
        s.submission_text = text
        s.status = status
        s.score = score
        s.feedback = feedback
        s.reviewed_by = reviewed_by
        s.reviewed_at = reviewed_at
        s.updated_at = now
        await s.save()
        return
    s = Submission(
        assignment_id=assignment.id,
        fellow_id=fellow_id,
        track_id=assignment.track_id,
        module_id=assignment.module_id,
        submission_text=text,
        submission_link="",
        file_url="",
        status=status,
        score=score,
        feedback=feedback,
        reviewed_by=reviewed_by,
        submitted_at=now,
        reviewed_at=reviewed_at,
        created_at=now,
        updated_at=now,
    )
    await s.insert()


async def _lessons_for_track_ordered(track_id: PydanticObjectId) -> list[Lesson]:
    mods = await LearningModule.find(
        LearningModule.track_id == track_id,
        LearningModule.status == LearningModuleStatus.PUBLISHED,
    ).sort(LearningModule.order).to_list()
    out: list[Lesson] = []
    for m in mods:
        lessons = await Lesson.find(
            Lesson.module_id == m.id,
            Lesson.status == LessonStatus.PUBLISHED,
        ).sort(Lesson.order).to_list()
        out.extend(lessons)
    return out


async def _seed_progress_fraction(fellow_id: PydanticObjectId, track_id: PydanticObjectId, fraction: float) -> None:
    lessons = await _lessons_for_track_ordered(track_id)
    if not lessons:
        return
    n = max(1, int(len(lessons) * fraction))
    for les in lessons[:n]:
        p = await LessonProgress.find_one(
            LessonProgress.fellow_id == fellow_id,
            LessonProgress.lesson_id == les.id,
        )
        if p:
            continue
        mod = await LearningModule.get(les.module_id)
        if mod is None:
            continue
        now = _now()
        try:
            await LessonProgress(
                fellow_id=fellow_id,
                track_id=track_id,
                module_id=les.module_id,
                lesson_id=les.id,
                status=LessonProgressStatus.COMPLETED,
                completed_at=now,
                created_at=now,
                updated_at=now,
            ).insert()
        except DuplicateKeyError:
            pass


async def run_seed() -> None:
    _require_safe_env()

    if os.getenv("SEED_RESET", "").strip().lower() in {"1", "true", "yes"}:
        await init_db()
        await _wipe_seed_catalog()
        await close_mongo_connection()

    await init_db()

    _log("--- DAAI development seed ---")

    admin = await _ensure_user(
        email=SEED_EMAILS["admin"],
        full_name="DAAI Admin",
        role=UserRole.ADMIN,
    )
    _log("Admin account ready: daai-seed-admin@example.com")

    mentor = await _ensure_user(
        email=SEED_EMAILS["mentor"],
        full_name="Jordan Mentor",
        role=UserRole.MENTOR,
    )
    _log("Mentor account ready: daai-seed-mentor@example.com")

    fellow_aws = await _ensure_user(
        email=SEED_EMAILS["fellow_aws"],
        full_name="Alex Rivera",
        role=UserRole.FELLOW,
        learning_track=LearningTrack.AWS_PRACTITIONER,
    )
    fellow_aws2 = await _ensure_user(
        email=SEED_EMAILS["fellow_aws2"],
        full_name="Sam Okonkwo",
        role=UserRole.FELLOW,
        learning_track=LearningTrack.AWS_PRACTITIONER,
    )
    fellow_arch = await _ensure_user(
        email=SEED_EMAILS["fellow_arch"],
        full_name="Priya Nair",
        role=UserRole.FELLOW,
        learning_track=LearningTrack.AWS_ARCHITECT,
    )
    fellow_qa = await _ensure_user(
        email=SEED_EMAILS["fellow_qa"],
        full_name="Morgan Lee",
        role=UserRole.FELLOW,
        learning_track=LearningTrack.QA,
    )
    fellow_sf = await _ensure_user(
        email=SEED_EMAILS["fellow_sf"],
        full_name="Casey Kim",
        role=UserRole.FELLOW,
        learning_track=LearningTrack.SALESFORCE,
    )
    _log("Fellow accounts ready (daai-seed-fellow-*@example.com)")

    t_aws_cp = await _ensure_track(
        slug="aws-cloud-practitioner",
        title="AWS Cloud Practitioner",
        description="Foundational AWS cloud concepts, billing, security, and core services.",
        duration="10 weeks",
        difficulty="Beginner",
    )
    t_aws_sa = await _ensure_track(
        slug="aws-solutions-architect",
        title="AWS Solutions Architect",
        description="Design resilient, high-performing, secure, and cost-optimized architectures on AWS.",
        duration="12 weeks",
        difficulty="Intermediate",
    )
    t_qa = await _ensure_track(
        slug="qa-engineering",
        title="QA Engineering",
        description="Practical quality assurance skills from manual testing through automation basics.",
        duration="8 weeks",
        difficulty="Beginner",
    )
    t_sf = await _ensure_track(
        slug="salesforce",
        title="Salesforce",
        description="Salesforce platform fundamentals, configuration, and declarative automation.",
        duration="9 weeks",
        difficulty="Beginner",
    )
    _log("Tracks created/updated: AWS CP, AWS SA, QA, Salesforce")

    b_aws_cp = await _ensure_batch(name="AWS Cloud Practitioner Batch 2026", track_id=t_aws_cp.id)
    b_aws_sa = await _ensure_batch(name="AWS Solutions Architect Batch 2026", track_id=t_aws_sa.id)
    b_qa = await _ensure_batch(name="QA Engineering Batch 2026", track_id=t_qa.id)
    b_sf = await _ensure_batch(name="Salesforce Batch 2026", track_id=t_sf.id)
    _log("Batches created/updated for 2026 cohorts")

    # --- AWS CP modules & lessons ---
    m_cp_cf = await _ensure_module(
        track_id=t_aws_cp.id,
        title="Cloud Fundamentals",
        description="Cloud concepts, global infrastructure, and shared responsibility.",
        order=0,
    )
    m_cp_iam = await _ensure_module(
        track_id=t_aws_cp.id,
        title="IAM and Security",
        description="Identity, access management, and baseline security practices.",
        order=1,
    )
    m_cp_ec2 = await _ensure_module(
        track_id=t_aws_cp.id,
        title="EC2 and Compute",
        description="Virtual machines, sizing, and compute options on AWS.",
        order=2,
    )
    m_cp_vpc = await _ensure_module(
        track_id=t_aws_cp.id,
        title="VPC and Networking",
        description="Virtual networks, subnets, routing, and connectivity patterns.",
        order=3,
    )
    m_cp_mon = await _ensure_module(
        track_id=t_aws_cp.id,
        title="Monitoring and Cost Optimization",
        description="Observability, budgets, and cost-aware architectures.",
        order=4,
    )
    for mod, titles in [
        (
            m_cp_cf,
            [
                ("What is cloud computing?", "Shared responsibility model and consumption-based pricing."),
                ("AWS global infrastructure", "Regions, AZs, edge locations, and choosing where to run workloads."),
                ("Well-Architected overview", "Reliability, security, performance, cost, and sustainability pillars."),
            ],
        ),
        (
            m_cp_iam,
            [
                ("IAM users and groups", "When to use IAM users vs roles and least-privilege basics."),
                ("Policies in practice", "JSON policy structure, managed policies, and evaluation logic."),
                ("MFA and root account hygiene", "Protecting privileged access and break-glass accounts."),
            ],
        ),
        (
            m_cp_ec2,
            [
                ("Launching your first EC2 instance", "AMIs, instance types, key pairs, and security groups."),
                ("Storage on EC2", "EBS volumes, snapshots, and instance store tradeoffs."),
                ("Scaling patterns", "Launch templates, Auto Scaling groups, and load balancers overview."),
            ],
        ),
        (
            m_cp_vpc,
            [
                ("VPC building blocks", "CIDR planning, subnets, route tables, and IGW."),
                ("Public vs private connectivity", "NAT gateways, endpoints, and hybrid patterns at a high level."),
                ("Troubleshooting connectivity", "Flow logs and common misconfiguration checks."),
            ],
        ),
        (
            m_cp_mon,
            [
                ("CloudWatch fundamentals", "Metrics, alarms, and dashboards for EC2 and platform services."),
                ("Cost Explorer and budgets", "Tracking spend and setting guardrails."),
                ("Tagging and accountability", "Cost allocation tags and ownership models."),
            ],
        ),
    ]:
        for i, (title, body) in enumerate(titles):
            await _ensure_lesson(
                module_id=mod.id,
                track_id=t_aws_cp.id,
                title=title,
                content=body,
                order=i,
                minutes=25 + i * 5,
            )

    # --- AWS SA modules ---
    m_sa_wa = await _ensure_module(
        track_id=t_aws_sa.id,
        title="Well-Architected Foundations",
        description="Design principles for reliable and secure AWS workloads.",
        order=0,
    )
    m_sa_net = await _ensure_module(
        track_id=t_aws_sa.id,
        title="Networking at Scale",
        description="Advanced VPC, hybrid connectivity, and traffic engineering.",
        order=1,
    )
    m_sa_ha = await _ensure_module(
        track_id=t_aws_sa.id,
        title="High Availability Compute",
        description="Multi-AZ patterns, resilience, and operational readiness.",
        order=2,
    )
    m_sa_data = await _ensure_module(
        track_id=t_aws_sa.id,
        title="Data Store Patterns",
        description="Choosing databases, caching, and durability models.",
        order=3,
    )
    for mod, titles in [
        (
            m_sa_wa,
            [
                ("Reliability pillar deep dive", "Fault isolation, recovery objectives, and chaos thinking."),
                ("Security pillar for architects", "Defense in depth, encryption, and identity boundaries."),
                ("Cost optimization tradeoffs", "Performance vs cost decisions and FinOps collaboration."),
            ],
        ),
        (
            m_sa_net,
            [
                ("Transit Gateway and peering", "When to centralize routing vs keep isolation."),
                ("Private connectivity patterns", "VPC endpoints, PrivateLink, and service boundaries."),
                ("Hybrid DNS", "Route 53 Resolver and on-prem integration considerations."),
            ],
        ),
        (
            m_sa_ha,
            [
                ("Multi-AZ and multi-region", "RTO/RPO language and concrete failover stories."),
                ("Blue/green and canary", "Release risk reduction on AWS."),
                ("Capacity planning", "Right-sizing and predictive scaling signals."),
            ],
        ),
        (
            m_sa_data,
            [
                ("RDS vs self-managed", "Operational ownership and patching responsibilities."),
                ("DynamoDB access patterns", "Single-table thinking at a high level."),
                ("Caching with ElastiCache", "TTL, invalidation, and stampede mitigation."),
            ],
        ),
    ]:
        for i, (title, body) in enumerate(titles):
            await _ensure_lesson(
                module_id=mod.id,
                track_id=t_aws_sa.id,
                title=title,
                content=body,
                order=i,
                minutes=30 + i * 5,
            )

    # --- QA modules ---
    m_qa_man = await _ensure_module(
        track_id=t_qa.id,
        title="Manual Testing Basics",
        description="Testing mindset, environments, and quality gates.",
        order=0,
    )
    m_qa_tc = await _ensure_module(
        track_id=t_qa.id,
        title="Test Case Design",
        description="Equivalence partitions, boundaries, and traceability.",
        order=1,
    )
    m_qa_bug = await _ensure_module(
        track_id=t_qa.id,
        title="Bug Reporting",
        description="Clear reproductions, severity, and collaboration with developers.",
        order=2,
    )
    m_qa_api = await _ensure_module(
        track_id=t_qa.id,
        title="API Testing",
        description="Contracts, status codes, and negative testing with tools.",
        order=3,
    )
    m_qa_auto = await _ensure_module(
        track_id=t_qa.id,
        title="Automation Testing Introduction",
        description="Selectors, stability, and when automation pays off.",
        order=4,
    )
    for mod, titles in [
        (
            m_qa_man,
            [
                ("What is quality?", "Prevention vs detection and the cost of defects."),
                ("Test types overview", "Smoke, regression, exploratory, and sanity testing."),
                ("Test environments", "Data masking, refresh cadence, and configuration drift."),
            ],
        ),
        (
            m_qa_tc,
            [
                ("Writing clear steps", "Given/when/then style and unambiguous expected results."),
                ("Boundary value analysis", "Choosing inputs at edges of valid ranges."),
                ("Traceability to requirements", "Mapping cases to user stories and risks."),
            ],
        ),
        (
            m_qa_bug,
            [
                ("Reproduction recipes", "Logs, timestamps, and minimal steps."),
                ("Severity vs priority", "How triage works in cross-functional teams."),
                ("Regression risks", "When to add a new automated check after a bugfix."),
            ],
        ),
        (
            m_qa_api,
            [
                ("REST fundamentals for testers", "Verbs, idempotency, and common error payloads."),
                ("Postman collections", "Variables, environments, and sharing with the team."),
                ("Contract testing intro", "Consumer-driven contracts at a glance."),
            ],
        ),
        (
            m_qa_auto,
            [
                ("Choosing what to automate", "ROI, flakiness, and maintenance costs."),
                ("Stable selectors", "Prefer role-based or data-testid strategies."),
                ("CI smoke suites", "Fast feedback loops and gating releases."),
            ],
        ),
    ]:
        for i, (title, body) in enumerate(titles):
            await _ensure_lesson(
                module_id=mod.id,
                track_id=t_qa.id,
                title=title,
                content=body,
                order=i,
                minutes=20 + i * 4,
            )

    # --- Salesforce modules ---
    m_sf_sc = await _ensure_module(
        track_id=t_sf.id,
        title="Sales Cloud Basics",
        description="Leads, opportunities, and core CRM workflows.",
        order=0,
    )
    m_sf_sec = await _ensure_module(
        track_id=t_sf.id,
        title="Security & Access",
        description="Profiles, permission sets, and sharing rules overview.",
        order=1,
    )
    m_sf_flow = await _ensure_module(
        track_id=t_sf.id,
        title="Automation with Flow",
        description="Record-triggered vs screen flows and guardrails.",
        order=2,
    )
    m_sf_rep = await _ensure_module(
        track_id=t_sf.id,
        title="Reports & Dashboards",
        description="Operational visibility for cohorts and stakeholders.",
        order=3,
    )
    for mod, titles in [
        (
            m_sf_sc,
            [
                ("Lead lifecycle", "Conversion, deduplication, and handoff to sales."),
                ("Opportunity stages", "Forecast categories and pipeline hygiene."),
                ("Activities and collaboration", "Tasks, events, and Chatter basics."),
            ],
        ),
        (
            m_sf_sec,
            [
                ("Org-wide defaults", "Public read/write vs private models."),
                ("Profiles vs permission sets", "Least privilege for fellowship projects."),
                ("Sharing rules when to use them", "Criteria-based vs ownership-based sharing."),
            ],
        ),
        (
            m_sf_flow,
            [
                ("Flow builder tour", "Elements, variables, and debugging."),
                ("Record-triggered patterns", "Before-save vs after-save performance notes."),
                ("Fault paths", "Handling errors gracefully in automation."),
            ],
        ),
        (
            m_sf_rep,
            [
                ("Report types", "Choosing the right primary object relationships."),
                ("Bucket fields", "Segmenting cohorts for fellowship reporting."),
                ("Dashboard filters", "Dynamic views for mentors and admins."),
            ],
        ),
    ]:
        for i, (title, body) in enumerate(titles):
            await _ensure_lesson(
                module_id=mod.id,
                track_id=t_sf.id,
                title=title,
                content=body,
                order=i,
                minutes=22 + i * 4,
            )

    _log("Modules and lessons created/updated (published)")

    await _ensure_enrollment(fellow_id=fellow_aws.id, track_id=t_aws_cp.id, batch_id=b_aws_cp.id)
    await _ensure_enrollment(fellow_id=fellow_aws2.id, track_id=t_aws_cp.id, batch_id=b_aws_cp.id)
    await _ensure_enrollment(fellow_id=fellow_arch.id, track_id=t_aws_sa.id, batch_id=b_aws_sa.id)
    await _ensure_enrollment(fellow_id=fellow_qa.id, track_id=t_qa.id, batch_id=b_qa.id)
    await _ensure_enrollment(fellow_id=fellow_sf.id, track_id=t_sf.id, batch_id=b_sf.id)
    _log("Enrollments: one active cohort per fellow")

    a_aws_tier = await _ensure_assignment(
        admin_id=admin.id,
        track_id=t_aws_cp.id,
        module_id=None,
        title="Design a basic 3-tier AWS architecture",
        description="Produce a diagram and short write-up suitable for a junior architect review.",
        instructions="Include presentation, application, and data tiers. Note security groups, routing, and one recovery consideration.",
        status=AssignmentStatus.OPEN,
        due_days=21,
        max_score=100,
    )
    await _ensure_assignment(
        admin_id=admin.id,
        track_id=t_aws_cp.id,
        module_id=m_cp_iam.id,
        title="IAM least-privilege mini-lab",
        description="Document two IAM policies that follow least privilege for a sample microservice.",
        instructions="Provide policy JSON snippets and explain each statement in plain language.",
        status=AssignmentStatus.OPEN,
        due_days=14,
        max_score=50,
    )

    a_qa_login = await _ensure_assignment(
        admin_id=admin.id,
        track_id=t_qa.id,
        module_id=m_qa_tc.id,
        title="Write test cases for login and registration",
        description="Cover positive, negative, and edge paths for authentication flows.",
        instructions="Use a table with ID, steps, data, and expected result. Assume email verification is required.",
        status=AssignmentStatus.OPEN,
        due_days=10,
        max_score=100,
    )
    await _ensure_assignment(
        admin_id=admin.id,
        track_id=t_qa.id,
        module_id=None,
        title="Bug bash reflection",
        description="Reflect on a 45-minute exploratory session on a sample e-commerce app.",
        instructions="List at least five findings with severity and one suggested regression test.",
        status=AssignmentStatus.CLOSED,
        due_days=-5,
        max_score=40,
    )

    await _ensure_assignment(
        admin_id=admin.id,
        track_id=t_aws_sa.id,
        module_id=m_sa_net.id,
        title="Multi-tier VPC design memo",
        description="One-page memo comparing two connectivity options for a hybrid workload.",
        instructions="Include a simple diagram reference (link or ASCII) and risks for each option.",
        status=AssignmentStatus.OPEN,
        due_days=18,
        max_score=100,
    )
    await _ensure_assignment(
        admin_id=admin.id,
        track_id=t_sf.id,
        module_id=m_sf_flow.id,
        title="Automate a simple approval with Flow",
        description="Describe a record-triggered flow for a fellowship leave request.",
        instructions="List objects, entry criteria, decision nodes, and failure notifications.",
        status=AssignmentStatus.OPEN,
        due_days=12,
        max_score=80,
    )
    _log("Assignments created/updated")

    await _ensure_submission(
        assignment=a_aws_tier,
        fellow_id=fellow_aws.id,
        text="Architecture uses ALB in two AZs, private subnets for app and RDS Multi-AZ. Included diagram link in appendix.",
        status=SubmissionStatus.SUBMITTED,
        score=None,
        feedback="",
        reviewed_by=None,
    )
    arch_assign = await Assignment.find_one(
        Assignment.track_id == t_aws_sa.id,
        Assignment.title == "Multi-tier VPC design memo",
    )
    if arch_assign is not None:
        await _ensure_submission(
            assignment=arch_assign,
            fellow_id=fellow_arch.id,
            text="Compared VPN and Direct Connect for steady-state hybrid traffic; included risk table.",
            status=SubmissionStatus.REVIEWED,
            score=88,
            feedback="Strong analysis; expand failover testing next sprint.",
            reviewed_by=mentor.id,
        )
    await _ensure_submission(
        assignment=a_qa_login,
        fellow_id=fellow_qa.id,
        text="Initial test case table for login; registration cases still thin on invalid email formats.",
        status=SubmissionStatus.NEEDS_REVISION,
        score=None,
        feedback="Add negative cases for expired tokens and rate limiting. Resubmit with traceability IDs.",
        reviewed_by=mentor.id,
    )
    sf_assign = await Assignment.find_one(
        Assignment.track_id == t_sf.id,
        Assignment.title == "Automate a simple approval with Flow",
    )
    if sf_assign is not None:
        await _ensure_submission(
            assignment=sf_assign,
            fellow_id=fellow_sf.id,
            text="Outlined record-triggered flow with manager approval and chatter notification on rejection.",
            status=SubmissionStatus.REVIEWED,
            score=95,
            feedback="Accepted — clear entry criteria and fault path.",
            reviewed_by=mentor.id,
        )
    _log("Submissions created/updated (submitted, reviewed, needs revision)")

    await _seed_progress_fraction(fellow_aws.id, t_aws_cp.id, 0.20)
    await _seed_progress_fraction(fellow_aws2.id, t_aws_cp.id, 0.50)
    await _seed_progress_fraction(fellow_arch.id, t_aws_sa.id, 0.80)
    await _seed_progress_fraction(fellow_qa.id, t_qa.id, 0.35)
    await _seed_progress_fraction(fellow_sf.id, t_sf.id, 0.60)
    _log("Lesson progress added (partial completion per fellow)")

    await close_mongo_connection()

    _log("")
    _log("Seed completed successfully.")
    _log("Test logins (password for all: Password123):")
    _log("  daai-seed-admin@example.com  |  daai-seed-mentor@example.com")
    _log("  daai-seed-fellow-aws@example.com  |  daai-seed-fellow-qa@example.com")
    _log("  daai-seed-fellow-aws2@example.com  |  daai-seed-fellow-arch@example.com  |  daai-seed-fellow-sf@example.com")


def main() -> None:
    asyncio.run(run_seed())


if __name__ == "__main__":
    main()
