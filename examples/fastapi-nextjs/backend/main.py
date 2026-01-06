"""
Example FastAPI backend for PolyRPC demo.

Run with: uvicorn main:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

app = FastAPI(title="PolyRPC Demo API")

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Models ============
# These will be automatically converted to TypeScript interfaces!


class UserRole(str, Enum):
    """User role enumeration"""
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"


class User(BaseModel):
    """A user in the system"""
    id: int
    name: str
    email: str
    phone_number: Optional[str] = None  # 🆕 I JUST ADDED THIS!
    role: UserRole = UserRole.USER
    is_premium: bool = False
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)


class CreateUserRequest(BaseModel):
    """Request body for creating a user"""
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    role: Optional[UserRole] = UserRole.USER


class UpdateUserRequest(BaseModel):
    """Request body for updating a user"""
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None
    is_premium: Optional[bool] = None


class Post(BaseModel):
    """A blog post"""
    id: int
    title: str
    content: str
    author_id: int
    tags: List[str] = []
    published: bool = False


class CreatePostRequest(BaseModel):
    """Request body for creating a post"""
    title: str
    content: str
    tags: Optional[List[str]] = []


class PaginatedResponse(BaseModel):
    """Generic paginated response"""
    items: List[User]
    total: int
    page: int
    per_page: int


# ============ In-memory database ============

users_db: dict[int, User] = {
    1: User(id=1, name="Alice", email="alice@example.com", role=UserRole.ADMIN),
    2: User(id=2, name="Bob", email="bob@example.com", is_premium=True),
}

posts_db: dict[int, Post] = {}
next_user_id = 3
next_post_id = 1


# ============ Routes ============
# These decorators will be parsed to generate API types!


@app.get("/users")
async def list_users(
    page: int = 1,
    per_page: int = 10,
    role: Optional[UserRole] = None
) -> PaginatedResponse:
    """List all users with pagination"""
    items = list(users_db.values())
    
    if role:
        items = [u for u in items if u.role == role]
    
    start = (page - 1) * per_page
    end = start + per_page
    
    return PaginatedResponse(
        items=items[start:end],
        total=len(items),
        page=page,
        per_page=per_page
    )


@app.get("/users/{user_id}")
async def get_user(user_id: int) -> User:
    """Get a single user by ID"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]


@app.post("/users")
async def create_user(request: CreateUserRequest) -> User:
    """Create a new user"""
    global next_user_id
    
    user = User(
        id=next_user_id,
        name=request.name,
        email=request.email,
        role=request.role or UserRole.USER
    )
    
    users_db[next_user_id] = user
    next_user_id += 1
    
    return user


@app.put("/users/{user_id}")
async def update_user(user_id: int, request: UpdateUserRequest) -> User:
    """Update an existing user"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = users_db[user_id]
    
    if request.name is not None:
        user.name = request.name
    if request.email is not None:
        user.email = request.email
    if request.role is not None:
        user.role = request.role
    if request.is_premium is not None:
        user.is_premium = request.is_premium
    
    users_db[user_id] = user
    return user


@app.delete("/users/{user_id}")
async def delete_user(user_id: int) -> dict:
    """Delete a user"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    del users_db[user_id]
    return {"success": True, "deleted_id": user_id}


@app.get("/posts")
async def list_posts(author_id: Optional[int] = None) -> List[Post]:
    """List all posts, optionally filtered by author"""
    posts = list(posts_db.values())
    
    if author_id:
        posts = [p for p in posts if p.author_id == author_id]
    
    return posts


@app.post("/posts")
async def create_post(request: CreatePostRequest, author_id: int) -> Post:
    """Create a new post"""
    global next_post_id
    
    post = Post(
        id=next_post_id,
        title=request.title,
        content=request.content,
        author_id=author_id,
        tags=request.tags or []
    )
    
    posts_db[next_post_id] = post
    next_post_id += 1
    
    return post


# Health check
@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
