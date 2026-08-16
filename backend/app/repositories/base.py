import uuid
from typing import Any

from sqlalchemy import Result, select
from sqlalchemy.ext.asyncio import AsyncSession


class BaseRepository:
    model: type

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, id: str | uuid.UUID) -> Any | None:
        return await self._session.get(self.model, uuid.UUID(str(id)))

    async def list_all(self) -> list[Any]:
        result: Result[Any] = await self._session.execute(select(self.model))
        return list(result.scalars().all())

    async def add(self, obj: Any) -> Any:
        self._session.add(obj)
        await self._session.commit()
        await self._session.refresh(obj)
        return obj
