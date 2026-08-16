import pytest_asyncio
from fakeredis import FakeAsyncRedis
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool

from app.db.base import Base
from app.db.session import get_db_session
from app.main import app

TEST_DATABASE_URL = "postgresql+asyncpg://zapsters:zapsters@localhost:5432/zapsters_test"


@pytest_asyncio.fixture(scope="session")
async def engine():
    test_engine = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool, pool_pre_ping=True)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield test_engine
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture
async def db_session(engine):
    """Async session bound to an external transaction with a SAVEPOINT.

    Each service-level ``commit()`` releases the SAVEPOINT; the event listener
    immediately opens a new one so the outer transaction survives every commit
    and the whole test can be rolled back at teardown (SOP §12.4).
    """
    connection = await engine.connect()
    trans = await connection.begin()
    session = AsyncSession(bind=connection, expire_on_commit=False)

    nested = await connection.begin_nested()

    @event.listens_for(session.sync_session, "after_transaction_end")
    def _restart_savepoint(_session, _transaction):
        nonlocal nested
        if not nested.is_active:
            nested = session.sync_session.connection().begin_nested()

    try:
        yield session
    finally:
        await session.close()
        await trans.rollback()
        await connection.close()


@pytest_asyncio.fixture
async def client(db_session):
    """httpx ASGI client with the DB dependency overridden to the SAVEPOINT session."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.pop(get_db_session, None)


@pytest_asyncio.fixture(autouse=True)
async def fake_redis(monkeypatch):
    fake = FakeAsyncRedis()
    monkeypatch.setattr("app.core.redis_client.redis_client", fake)
    yield fake
