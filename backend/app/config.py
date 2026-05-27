"""Application settings loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "APAD"
    debug: bool = True
    api_prefix: str = "/api"

    database_url: str = "sqlite:///./apad.db"
    db_pool_size: int = 5
    db_max_overflow: int = 10

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    cors_origins: str = "http://localhost:5173"

    frontend_base_url: str = "http://localhost:5173"
    backend_base_url: str = "http://localhost:8000"

    sms_provider: str = "mock"
    otp_simulation_mode: bool = True
    otp_show_on_screen: bool = True
    poc_sms_preview_panel: bool = True
    otp_ttl_seconds: int = 300
    otp_length: int = 6
    ad_completion_ttl_minutes: int = 15
    min_watch_seconds: int = 5

    seed_demo_data: bool = True
    admin_mobile: str = "9999999999"
    admin_password: str = "admin123"

    msg91_auth_key: str = ""
    msg91_template_id: str = ""
    fast2sms_api_key: str = ""
    fast2sms_route: str = "dlt"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""
    twilio_verify_service_sid: str = ""
    twilio_otp_channel: str = "sms"

    login_link_sms_enabled: bool = True
    login_link_message_template: str = (
        "Hi {user_name}, {promo}. Tap to view your offer: {link}"
    )

    default_phone_region: str = "IN"

    @property
    def uses_twilio_verify(self) -> bool:
        return self.sms_provider.lower() == "twilio"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def database_url_normalized(self) -> str:
        url = self.database_url
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def is_sqlite(self) -> bool:
        return self.database_url_normalized.startswith("sqlite")

    @property
    def is_postgres(self) -> bool:
        return self.database_url_normalized.startswith("postgresql")


@lru_cache
def get_settings() -> Settings:
    return Settings()
