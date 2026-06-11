import math
import secrets
import string
from datetime import datetime, timezone

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.models.activity_log_model import ActivityAction
from app.models.user_model import User, UserRole
from app.repositories.activity_log_repository import ActivityLogRepository
from app.repositories.staff_repository import StaffRepository
from app.schema.staff_schema import (
    ActivityLogItem,
    ActivityLogListResponse,
    StaffCreate,
    StaffCreateResponse,
    StaffDetail,
    StaffListItem,
    StaffListResponse,
    StaffStatusResponse,
    StaffUpdate,
    StaffUpdateResponse,
)
from app.services.email_service import EmailService
from app.utils.password import hash_password


TEMPORARY_PASSWORD_LENGTH = 12

# ── RBAC creation rules ──────────────────────────────────────────
# Maps the logged-in user's role to the set of roles they can create.
ROLE_CREATION_RULES: dict[UserRole, set[UserRole]] = {
    UserRole.SUPER_ADMIN: {
        UserRole.ADMIN,
        UserRole.TRAINER,
        UserRole.MENTOR,
        UserRole.FELLOW,
    },
    UserRole.ADMIN: {
        UserRole.ADMIN,
        UserRole.TRAINER,
        UserRole.MENTOR,
        UserRole.FELLOW,
    },
    UserRole.MENTOR: {
        UserRole.FELLOW,
    },
    UserRole.TRAINER: set(),
    UserRole.FELLOW: set(),
    UserRole.EMPLOYER: set(),
}

# Roles allowed to access staff management
STAFF_MANAGER_ROLES: set[UserRole] = {
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MENTOR,
}


def _generate_temporary_password() -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return "".join(secrets.choice(alphabet) for _ in range(TEMPORARY_PASSWORD_LENGTH))


def _user_to_list_item(user: User) -> StaffListItem:
    return StaffListItem(
        id=str(user.id),
        full_name=user.full_name,
        email=str(user.email),
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
    )


def _user_to_detail(user: User) -> StaffDetail:
    return StaffDetail(
        id=str(user.id),
        full_name=user.full_name,
        email=str(user.email),
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        location=user.location,
        bio=user.bio,
        avatar_url=user.avatar_url,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


def _log_to_item(log) -> ActivityLogItem:
    return ActivityLogItem(
        id=str(log.id),
        actor_id=log.actor_id,
        actor_name=log.actor_name,
        actor_role=log.actor_role,
        action=log.action,
        target_id=log.target_id,
        target_name=log.target_name,
        description=log.description,
        created_at=log.created_at,
    )


class StaffService:
    def __init__(
        self,
        staff_repo: StaffRepository | None = None,
        log_repo: ActivityLogRepository | None = None,
        email_service: EmailService | None = None,
    ):
        self.staff_repo = staff_repo or StaffRepository()
        self.log_repo = log_repo or ActivityLogRepository()
        self.email_service = email_service or EmailService()

    # ── helpers ──────────────────────────────────────────────────

    def get_allowed_roles(self, actor_role: UserRole) -> list[UserRole]:
        return sorted(ROLE_CREATION_RULES.get(actor_role, set()), key=lambda r: r.value)

    def _check_role_permission(self, actor: User, target_role: UserRole) -> None:
        allowed = ROLE_CREATION_RULES.get(actor.role, set())
        if target_role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have permission to assign the role '{target_role.value}'",
            )

    async def _log(
        self,
        actor: User,
        action: ActivityAction,
        target: User | None = None,
        description: str = "",
    ) -> None:
        await self.log_repo.create(
            actor_id=str(actor.id),
            actor_name=actor.full_name,
            actor_role=actor.role.value,
            action=action,
            target_id=str(target.id) if target else None,
            target_name=target.full_name if target else None,
            description=description,
        )

    # ── list ─────────────────────────────────────────────────────

    async def list_staff(
        self,
        *,
        role_filter: str | None = None,
        status_filter: str | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> StaffListResponse:
        role_enum = None
        if role_filter:
            try:
                role_enum = UserRole(role_filter.upper())
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid role filter: {role_filter}",
                )

        is_active = None
        if status_filter:
            normalized = status_filter.strip().lower()
            if normalized == "active":
                is_active = True
            elif normalized == "inactive":
                is_active = False

        users, total = await self.staff_repo.list_staff(
            role_filter=role_enum,
            status_filter=is_active,
            search=search,
            page=page,
            page_size=page_size,
        )

        return StaffListResponse(
            items=[_user_to_list_item(u) for u in users],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=max(1, math.ceil(total / page_size)),
        )

    # ── get detail ───────────────────────────────────────────────

    async def get_staff_detail(self, staff_id: str) -> StaffDetail:
        user = await self.staff_repo.get_by_id(staff_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found",
            )
        return _user_to_detail(user)

    # ── create ───────────────────────────────────────────────────

    async def create_staff(
        self,
        data: StaffCreate,
        actor: User,
    ) -> StaffCreateResponse:
        self._check_role_permission(actor, data.role)

        existing = await self.staff_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        temp_password = _generate_temporary_password()

        try:
            user = await self.staff_repo.create(
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(temp_password),
                role=data.role,
                phone=data.phone,
            )
        except DuplicateKeyError as exc:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            ) from exc

        await self._log(
            actor,
            ActivityAction.STAFF_CREATED,
            target=user,
            description=f"Created staff member {user.full_name} with role {user.role.value}",
        )

        await self.email_service.send_email(
            to_email=str(user.email),
            subject="Welcome to DAAI Fellowship Platform",
            body=(
                f"Hello {user.full_name},\n\n"
                f"Your account has been created on the DAAI Fellowship Platform.\n\n"
                f"Email: {user.email}\n"
                f"Temporary Password: {temp_password}\n\n"
                f"Please log in and change your password.\n\n"
                f"— DAAI Fellowship Team"
            ),
        )

        return StaffCreateResponse(
            message=f"Staff member '{user.full_name}' created successfully",
            staff=_user_to_list_item(user),
            temporary_password=temp_password,
        )

    # ── update ───────────────────────────────────────────────────

    async def update_staff(
        self,
        staff_id: str,
        data: StaffUpdate,
        actor: User,
    ) -> StaffUpdateResponse:
        user = await self.staff_repo.get_by_id(staff_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found",
            )

        if data.role is not None and data.role != user.role:
            self._check_role_permission(actor, data.role)

        changes = []
        kwargs: dict = {}

        if data.full_name is not None and data.full_name != user.full_name:
            kwargs["full_name"] = data.full_name
            changes.append(f"name: {user.full_name} → {data.full_name}")

        if data.phone is not None:
            kwargs["phone"] = data.phone
            if data.phone != user.phone:
                changes.append(f"phone updated")

        if data.role is not None and data.role != user.role:
            kwargs["role"] = data.role
            changes.append(f"role: {user.role.value} → {data.role.value}")

        if kwargs:
            user = await self.staff_repo.update(user, **kwargs)

        description = "; ".join(changes) if changes else "No changes"
        action = (
            ActivityAction.STAFF_ROLE_CHANGED
            if "role" in kwargs
            else ActivityAction.STAFF_UPDATED
        )

        await self._log(
            actor,
            action,
            target=user,
            description=f"Updated staff member {user.full_name}: {description}",
        )

        return StaffUpdateResponse(
            message=f"Staff member '{user.full_name}' updated successfully",
            staff=_user_to_list_item(user),
        )

    # ── toggle status ────────────────────────────────────────────

    async def toggle_status(
        self,
        staff_id: str,
        is_active: bool,
        actor: User,
    ) -> StaffStatusResponse:
        user = await self.staff_repo.get_by_id(staff_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found",
            )

        if str(user.id) == str(actor.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot change your own account status",
            )

        user = await self.staff_repo.set_active_status(user, is_active=is_active)
        action = (
            ActivityAction.STAFF_ACTIVATED if is_active
            else ActivityAction.STAFF_DEACTIVATED
        )
        status_label = "activated" if is_active else "deactivated"

        await self._log(
            actor,
            action,
            target=user,
            description=f"{status_label.capitalize()} staff member {user.full_name}",
        )

        return StaffStatusResponse(
            message=f"Staff member '{user.full_name}' {status_label} successfully",
            staff=_user_to_list_item(user),
        )

    # ── activity logs ────────────────────────────────────────────

    async def get_activity_logs(
        self,
        staff_id: str,
        *,
        skip: int = 0,
        limit: int = 50,
    ) -> ActivityLogListResponse:
        logs = await self.log_repo.find_by_target(staff_id, skip=skip, limit=limit)
        total = await self.log_repo.count_by_target(staff_id)

        return ActivityLogListResponse(
            items=[_log_to_item(log) for log in logs],
            total=total,
        )

    async def get_allowed_roles_for_actor(self, actor: User) -> list[str]:
        return [r.value for r in self.get_allowed_roles(actor.role)]
