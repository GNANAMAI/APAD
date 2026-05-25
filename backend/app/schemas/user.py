from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    mobile: str = Field(min_length=10, max_length=15)
    email: EmailStr
    age: int = Field(ge=1, le=120)
    gender: str
    area: str


class UserLogin(BaseModel):
    mobile: str


class AdminLoginRequest(BaseModel):
    mobile: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    name: str
    mobile: str
    email: str
    age: int
    gender: str
    area: str
    role: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
