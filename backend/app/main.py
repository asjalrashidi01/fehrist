from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.api.routes import tasks
from app.api.routes import plan
from app.api.routes import session
from app.api.routes import ping

origins = [
    "http://localhost:3000",      # local frontend
    # "https://fehrist.app",        # production frontend
    # "https://www.fehrist.app",    # optional www subdomain
]

app = FastAPI(title="Fehrist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(plan.router)
app.include_router(session.router)
app.include_router(ping.router)

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}