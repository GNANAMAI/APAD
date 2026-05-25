"""Demo ad catalog — playable MP4s (public CDNs that work in HTML5 video)."""

from sqlalchemy.orm import Session

from app.models.campaign import Campaign, TargetingRule

# These hosts allow browser playback (Google gtv-videos-bucket often returns 403 now).
_PLAYABLE_MP4 = [
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/fruits.mp4",
    "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10sec_1MB.mp4",
    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
]

DEFAULT_CREATIVE_URL = _PLAYABLE_MP4[0]


def _clip(index: int) -> str:
    return _PLAYABLE_MP4[index % len(_PLAYABLE_MP4)]


CATALOG: list[dict] = [
    {
        "name": "Whisper Comfort",
        "title_template": "Feel fresh all day with Whisper Comfort",
        "description": "Whisper — comfort and protection you can trust.",
        "promo_suffix": "Whisper Comfort — limited offer",
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
        "creative_url": _clip(0),
        "priority": 80,
        "rules": [{"min_age": 18, "max_age": 35, "gender": "female", "area": "Mumbai"}],
    },
    {
        "name": "Amul Fresh Milk",
        "title_template": "Farm-fresh Amul milk delivered daily",
        "description": "Amul — the taste of home, straight to your door.",
        "promo_suffix": "Amul Fresh Milk — order today",
        "image_url": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800",
        "creative_url": _clip(1),
        "priority": 70,
        "rules": [{"min_age": 25, "max_age": 55, "gender": "any", "area": "Delhi"}],
    },
    {
        "name": "Crocin Pain Relief",
        "title_template": "Crocin — fast pain relief",
        "description": "Trusted by families for quick, effective relief.",
        "promo_suffix": "Crocin — pharmacy offer",
        "image_url": "https://images.unsplash.com/photo-1584308664944-24d5f47fdad9?w=800",
        "creative_url": _clip(2),
        "priority": 75,
        "rules": [{"min_age": 35, "max_age": 65, "gender": "any", "area": "any"}],
    },
    {
        "name": "Bali Getaway",
        "title_template": "Get 30% OFF on Bali getaways",
        "description": "Exclusive island package — book your dream trip today.",
        "promo_suffix": "Bali Getaway — 30% off",
        "image_url": "https://images.unsplash.com/photo-1537953773345-d172ccf13cf0?w=800",
        "creative_url": _clip(3),
        "priority": 90,
        "rules": [{"min_age": 20, "max_age": 35, "gender": "male", "area": "Hyderabad"}],
    },
    {
        "name": "Swiggy Instamart",
        "title_template": "Groceries in 10 minutes with Instamart",
        "description": "Swiggy Instamart — essentials delivered fast in Bangalore.",
        "promo_suffix": "Swiggy Instamart — free delivery",
        "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
        "creative_url": _clip(4),
        "priority": 65,
        "rules": [{"min_age": 18, "max_age": 45, "gender": "any", "area": "Bangalore"}],
    },
    {
        "name": "HDFC Credit Card",
        "title_template": "HDFC lifetime-free credit card",
        "description": "Earn rewards on every spend with zero annual fee.",
        "promo_suffix": "HDFC Credit Card — apply now",
        "image_url": "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
        "creative_url": _clip(0),
        "priority": 60,
        "rules": [{"min_age": 28, "max_age": 50, "gender": "any", "area": "Chennai"}],
    },
    {
        "name": "Nike Run Club",
        "title_template": "Nike Run Club — new season gear",
        "description": "Push your limits with the latest running collection.",
        "promo_suffix": "Nike Run Club — member discount",
        "image_url": "https://images.unsplash.com/photo-1460353581641-37baddab0a0e?w=800",
        "creative_url": _clip(1),
        "priority": 55,
        "rules": [{"min_age": 18, "max_age": 30, "gender": "male", "area": "Mumbai"}],
    },
    {
        "name": "Lakme Salon",
        "title_template": "Lakme festive makeover package",
        "description": "Salon-style glow-up packages for the festive season.",
        "promo_suffix": "Lakme Salon — book now",
        "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
        "creative_url": _clip(2),
        "priority": 68,
        "rules": [{"min_age": 22, "max_age": 40, "gender": "female", "area": "Hyderabad"}],
    },
    {
        "name": "BYJU'S Learning",
        "title_template": "BYJU'S free trial for students",
        "description": "Interactive learning — start your free trial today.",
        "promo_suffix": "BYJU'S — student offer",
        "image_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        "creative_url": _clip(3),
        "priority": 50,
        "rules": [{"min_age": 14, "max_age": 22, "gender": "any", "area": "any"}],
    },
    {
        "name": "SBI Home Loan",
        "title_template": "SBI Home Loan — lowest rate this quarter",
        "description": "Make your dream home a reality with competitive rates.",
        "promo_suffix": "SBI Home Loan — check eligibility",
        "image_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
        "creative_url": _clip(4),
        "priority": 72,
        "rules": [{"min_age": 30, "max_age": 55, "gender": "any", "area": "Pune"}],
    },
    {
        "name": "Zomato Gold",
        "title_template": "Zomato Gold — 50% off dining",
        "description": "Premium dining membership at partner restaurants.",
        "promo_suffix": "Zomato Gold — join today",
        "image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        "creative_url": _clip(0),
        "priority": 58,
        "rules": [{"min_age": 21, "max_age": 40, "gender": "any", "area": "Delhi"}],
    },
    {
        "name": "Ponds Skin Care",
        "title_template": "Ponds winter hydration kit",
        "description": "Keep skin soft and hydrated through winter.",
        "promo_suffix": "Ponds — skincare sale",
        "image_url": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800",
        "creative_url": _clip(1),
        "priority": 62,
        "rules": [{"min_age": 20, "max_age": 45, "gender": "female", "area": "Kolkata"}],
    },
    {
        "name": "Royal Enfield Classic",
        "title_template": "Test ride the Royal Enfield Classic 350",
        "description": "Built for the road — book a test ride near you.",
        "promo_suffix": "Royal Enfield — test ride",
        "image_url": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800",
        "creative_url": _clip(2),
        "priority": 66,
        "rules": [{"min_age": 25, "max_age": 45, "gender": "male", "area": "Chennai"}],
    },
    {
        "name": "Flipkart Big Billion",
        "title_template": "Flipkart Big Billion — early access",
        "description": "Shop early and unlock exclusive sale prices.",
        "promo_suffix": "Flipkart — early access",
        "image_url": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
        "creative_url": _clip(3),
        "priority": 64,
        "rules": [{"min_age": 18, "max_age": 50, "gender": "any", "area": "Hyderabad"}],
    },
    {
        "name": "ICICI iPhone EMI",
        "title_template": "Zero-cost EMI on iPhone with ICICI",
        "description": "Upgrade to the latest iPhone with easy monthly payments.",
        "promo_suffix": "ICICI — iPhone EMI",
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
        "creative_url": _clip(4),
        "priority": 61,
        "rules": [{"min_age": 22, "max_age": 35, "gender": "any", "area": "Mumbai"}],
    },
    {
        "name": "Dettol Hygiene",
        "title_template": "Dettol family health pack",
        "description": "Protect what matters with trusted hygiene products.",
        "promo_suffix": "Dettol — family pack offer",
        "image_url": "https://images.unsplash.com/photo-1585421514758-efb8aef8350e?w=800",
        "creative_url": _clip(0),
        "priority": 45,
        "rules": [{"min_age": 30, "max_age": 60, "gender": "any", "area": "Bangalore"}],
    },
    {
        "name": "MakeMyTrip Kerala",
        "title_template": "Kerala backwaters package on MakeMyTrip",
        "description": "Houseboats, greenery, and curated travel deals.",
        "promo_suffix": "MakeMyTrip Kerala — book now",
        "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        "creative_url": _clip(1),
        "priority": 67,
        "rules": [{"min_age": 25, "max_age": 50, "gender": "any", "area": "Kochi"}],
    },
    {
        "name": "Gillette Grooming",
        "title_template": "Gillette premium grooming kit",
        "description": "Look sharp with pro-grade razors and care products.",
        "promo_suffix": "Gillette — grooming kit",
        "image_url": "https://images.unsplash.com/photo-1622286342621-fbf556a02e3d?w=800",
        "creative_url": _clip(2),
        "priority": 52,
        "rules": [{"min_age": 18, "max_age": 40, "gender": "male", "area": "any"}],
    },
    {
        "name": "Nykaa Beauty Sale",
        "title_template": "Nykaa Beauty Sale — up to 40% off",
        "description": "Top beauty brands at unbeatable prices.",
        "promo_suffix": "Nykaa — beauty sale",
        "image_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
        "creative_url": _clip(3),
        "priority": 69,
        "rules": [{"min_age": 18, "max_age": 35, "gender": "female", "area": "any"}],
    },
    {
        "name": "General Offers",
        "title_template": "Explore top offers on APAD",
        "description": "Hand-picked deals across travel, shopping, and more.",
        "promo_suffix": "APAD — browse offers",
        "image_url": "https://images.unsplash.com/photo-1607082349569-187342175a2f?w=800",
        "creative_url": _clip(4),
        "priority": 1,
        "rules": [{"min_age": 0, "max_age": 120, "gender": "any", "area": "any"}],
    },
]


def refresh_campaign_creatives(db: Session) -> None:
    """Sync catalog copy and media on existing rows (no DB reset needed)."""
    for item in CATALOG:
        row = db.query(Campaign).filter(Campaign.name == item["name"]).first()
        if not row:
            continue
        row.title_template = item["title_template"]
        row.description = item["description"]
        row.promo_suffix = item["promo_suffix"]
        row.image_url = item["image_url"]
        row.creative_url = item["creative_url"]
        row.creative_type = "video"
    db.commit()

    # Fix any campaign still pointing at blocked Google sample URLs
    blocked = "gtv-videos-bucket"
    stale = db.query(Campaign).filter(Campaign.creative_url.contains(blocked)).all()
    for i, row in enumerate(stale):
        row.creative_url = _clip(i)
        row.creative_type = "video"
    if stale:
        db.commit()


def seed_campaign_catalog(db: Session) -> None:
    if db.query(Campaign).filter(Campaign.name == "General Offers").first() is None:
        for item in CATALOG:
            campaign = Campaign(
                name=item["name"],
                title_template=item["title_template"],
                description=item["description"],
                image_url=item["image_url"],
                creative_url=item["creative_url"],
                creative_type="video",
                min_watch_seconds=5,
                promo_suffix=item["promo_suffix"],
                priority=item["priority"],
                is_active=True,
            )
            db.add(campaign)
            db.flush()
            for rule in item["rules"]:
                db.add(
                    TargetingRule(
                        campaign_id=campaign.id,
                        min_age=rule["min_age"],
                        max_age=rule["max_age"],
                        gender=rule["gender"],
                        area=rule["area"],
                    )
                )
        db.commit()

    refresh_campaign_creatives(db)
