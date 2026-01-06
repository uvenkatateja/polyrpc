"""
Electron + Python Backend Example

This FastAPI server runs locally and communicates with the Electron app.
PolyRPC generates TypeScript types from these Pydantic models.
"""

from enum import Enum
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="PolyRPC Electron Example")

# Allow Electron app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Enums ============

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Priority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3

# ============ Generic Types ============

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    """Generic API response wrapper"""
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response for lists"""
    items: List[T]
    total: int
    page: int
    page_size: int
    has_more: bool

# ============ Models ============

class Task(BaseModel):
    """A task in the todo list"""
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    priority: Priority = Priority.MEDIUM

class CreateTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM

class AIModelInfo(BaseModel):
    """Information about a loaded AI model"""
    name: str
    version: str
    loaded: bool
    memory_usage_mb: float

class PredictionRequest(BaseModel):
    model_name: str
    input_text: str

class PredictionResult(BaseModel):
    model_name: str
    input_text: str
    output: str
    confidence: float
    processing_time_ms: int

# ============ In-memory storage ============

tasks: List[Task] = [
    Task(id=1, title="Learn PolyRPC", status=TaskStatus.COMPLETED, priority=Priority.HIGH),
    Task(id=2, title="Build Electron app", status=TaskStatus.RUNNING),
    Task(id=3, title="Deploy to production", status=TaskStatus.PENDING),
]

models: List[AIModelInfo] = [
    AIModelInfo(name="gpt-mini", version="1.0", loaded=True, memory_usage_mb=512.5),
    AIModelInfo(name="sentiment", version="2.1", loaded=False, memory_usage_mb=0),
]

# ============ Routes ============

@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "polyrpc-electron-backend"}

@app.get("/tasks")
def get_tasks() -> List[Task]:
    return tasks

@app.get("/tasks/{task_id}")
def get_task(task_id: int) -> ApiResponse[Task]:
    task = next((t for t in tasks if t.id == task_id), None)
    if task:
        return ApiResponse(success=True, data=task)
    return ApiResponse(success=False, error="Task not found")

@app.post("/tasks")
def create_task(request: CreateTaskRequest) -> Task:
    new_id = max(t.id for t in tasks) + 1 if tasks else 1
    task = Task(
        id=new_id,
        title=request.title,
        description=request.description,
        priority=request.priority,
    )
    tasks.append(task)
    return task

@app.put("/tasks/{task_id}/status")
def update_task_status(task_id: int, status: TaskStatus) -> ApiResponse[Task]:
    task = next((t for t in tasks if t.id == task_id), None)
    if task:
        task.status = status
        return ApiResponse(success=True, data=task)
    return ApiResponse(success=False, error="Task not found")

@app.get("/models")
def get_models() -> List[AIModelInfo]:
    return models

@app.post("/predict")
def predict(request: PredictionRequest) -> ApiResponse[PredictionResult]:
    """Simulate AI prediction (replace with real model inference)"""
    model = next((m for m in models if m.name == request.model_name), None)
    if not model:
        return ApiResponse(success=False, error=f"Model '{request.model_name}' not found")
    if not model.loaded:
        return ApiResponse(success=False, error=f"Model '{request.model_name}' is not loaded")
    
    # Simulate prediction
    result = PredictionResult(
        model_name=request.model_name,
        input_text=request.input_text,
        output=f"Processed: {request.input_text[:50]}...",
        confidence=0.95,
        processing_time_ms=42,
    )
    return ApiResponse(success=True, data=result)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
