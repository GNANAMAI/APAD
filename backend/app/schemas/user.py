from pydantic import BaseModel, EmailStr, Field, field_validator

from app.utils.phone import normalize_mobile


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    mobile: str = Field(min_length=8, max_length=20)
    email: EmailStr
    age: int = Field(ge=1, le=120)
    gender: str
    area: str

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        return normalize_mobile(v)


class UserLogin(BaseModel):
    mobile: str

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        return normalize_mobile(v)


class AdminLoginRequest(BaseModel):
    mobile: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        return normalize_mobile(v)


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
