from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.models.user_model import User, UserRole
from app.repositories.user_repository import UserRepository
from app.utils.jwt import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if not isinstance(user_id, str):
        raise credentials_exception

    user = await UserRepository().get_by_id(user_id)
    if user is None or not user.is_active:
        raise credentials_exception

    return user


async def current_admin(user: User = Depends(current_user)) -> User:
    if user.role not in {UserRole.SUPER_ADMIN, UserRole.ADMIN}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return user


async def require_fellow(user: User = Depends(current_user)) -> User:
    if user.role != UserRole.FELLOW:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Fellow access required",
        )

    return user


async def current_submission_reviewer(user: User = Depends(current_user)) -> User:
    if user.role not in {
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.INSTRUCTOR,
        UserRole.HR,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required to review submissions",
        )

    return user


async def current_track_catalog_reader(user: User = Depends(current_user)) -> User:
    """List tracks (read-only) for admins and staff who review submissions."""
    if user.role not in {
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.INSTRUCTOR,
        UserRole.HR,
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to list tracks",
        )

    return user
