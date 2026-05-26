import logging

from twilio.base.exceptions import TwilioRestException

logger = logging.getLogger(__name__)

# https://www.twilio.com/docs/api/errors
_TRIAL_UNVERIFIED = {21608, 21610}
_GEO_BLOCKED = {60600, 60605}
_RATE_LIMIT = {60203, 20429}


def log_twilio_error(exc: TwilioRestException, action: str) -> None:
    logger.error(
        "Twilio %s failed: code=%s status=%s msg=%s",
        action,
        exc.code,
        exc.status,
        exc.msg,
    )


def twilio_http_status(exc: TwilioRestException) -> int:
    if exc.code in _TRIAL_UNVERIFIED:
        return 403
    if exc.code in _GEO_BLOCKED:
        return 403
    if exc.code in _RATE_LIMIT:
        return 429
    if exc.status and 400 <= exc.status < 500:
        return exc.status
    return 502


def twilio_user_message(exc: TwilioRestException) -> str:
    if exc.code in _TRIAL_UNVERIFIED:
        return (
            "This mobile number is not verified on your Twilio trial account. "
            "In Twilio Console go to Phone Numbers → Manage → Verified Caller IDs, "
            "add this number, then try again. For any user without pre-verification, "
            "upgrade your Twilio account to a paid plan."
        )
    if exc.code in _GEO_BLOCKED:
        return (
            "SMS to this country is blocked in your Twilio account. "
            "Enable the country under Messaging → Settings → Geo permissions."
        )
    if exc.code in _RATE_LIMIT:
        return "Too many verification attempts. Please wait a few minutes and try again."
    if exc.code == 60200:
        return "Invalid mobile number for SMS delivery."
    return "Could not send verification code. Please try again shortly."
