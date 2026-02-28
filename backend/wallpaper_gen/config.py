import json
import os
import random

_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def _load_json(filename):
    with open(os.path.join(_DATA_DIR, filename), "r") as f:
        return json.load(f)

# ---------- Static data (loaded once) ----------
COUNTRY_TIMEZONES = _load_json("timezones.json")
DEVICE_RESOLUTIONS = {
    entry["device"]: (entry["width"], entry["height"])
    for entry in _load_json("devices.json")
}
ACTIVE_DOT_COLORS = _load_json("dot_colors.json")

def _hex_to_rgb(hex_color):
    """Convert a hex color string like '#FFD700' to an (r, g, b) tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_available_anime():
    """Return list of anime keys available in quotes.json."""
    quotes = _load_json("quotes.json")
    return list(quotes.keys())

# ---------- Dynamic config builder ----------
def build_config(country=None, theme=None, accent=None, device=None,
                 quotes_enabled=True, anime=None):
    """
    Build a complete configuration dict from user parameters.
    All parameters are optional and fall back to sensible defaults.
    """
    # --- Country / Timezone ---
    country = country or "India"
    tz_str = COUNTRY_TIMEZONES.get(country, "Asia/Kolkata")

    # --- Device / Dimensions ---
    device = device or "iPhone 13 / 13 Pro / 14"
    res = DEVICE_RESOLUTIONS.get(device, (1170, 2532))
    width, height = res

    # --- Theme ---
    theme = theme or "dark"
    if theme == "light":
        bg_color = (255, 255, 255)
        dot_future = (200, 200, 200)
        dot_past = (80, 80, 80)
        text_color = (0, 0, 0)
    else:
        bg_color = (0, 0, 0)
        dot_future = (40, 40, 40)
        dot_past = (100, 100, 100)
        text_color = (255, 255, 255)

    # --- Accent (active dot colour) ---
    if accent:
        dot_today = _hex_to_rgb(accent)
    else:
        dot_today = _hex_to_rgb(ACTIVE_DOT_COLORS[0])

    # --- Quotes ---
    if not quotes_enabled:
        quote_sources = None  # signals "no quotes"
    else:
        quote_sources = anime or "all"

    return {
        "COUNTRY": country,
        "TIMEZONE": tz_str,
        "THEME": theme,
        "WIDTH": width,
        "HEIGHT": height,
        "BG_COLOR": bg_color,
        "DOT_COLOR_FUTURE": dot_future,
        "DOT_COLOR_PAST": dot_past,
        "DOT_COLOR_TODAY": dot_today,
        "TEXT_COLOR": text_color,
        "QUOTE_SOURCES": quote_sources,
        # Hour Grid
        "HOUR_GRID_COLS": 8,
        "HOUR_GRID_ROWS": 3,
        "HOUR_DOT_RADIUS": 15,
        "HOUR_SPACING": 60,
        "HOUR_GRID_SHAPE": "circle",
        "HOUR_GRID_TOP_FACTOR": 0.35,
        # Day / Year Grid
        "DAY_GRID_COLS": 16,
        "DAY_DOT_RADIUS": 14,
        "DAY_SPACING": 45,
        "DAY_GRID_SHAPE": "circle",
        "DAY_GRID_TOP_OFFSET_FROM_HOUR": 180,
        "MONTH_GAP": 12,
        # Week Grid
        "WEEK_GRID_SHAPE": "square",
        "WEEK_GRID_ROWS": 7,
        "WEEK_DOT_RADIUS": 10,
        "WEEK_SPACING": 45,
        # Text
        "FONT_SIZE": 28,
        "GRID_TO_TEXT_SPACING": 80,
    }


# ============================================================
# Legacy module-level constants (kept for backward compat)
# ============================================================
COUNTRY = "India"

def get_timezone():
    tz = COUNTRY_TIMEZONES.get(COUNTRY)
    if tz is None:
        raise ValueError(f"Unknown country '{COUNTRY}'.")
    return tz

DEVICE = "iPhone 13 / 13 Pro / 14"

def get_device_resolution():
    res = DEVICE_RESOLUTIONS.get(DEVICE)
    if res is None:
        raise ValueError(f"Unknown device '{DEVICE}'.")
    return res

WIDTH, HEIGHT = get_device_resolution()
THEME = "dark"

if THEME == "light":
    BG_COLOR = (255, 255, 255)
    DOT_COLOR_FUTURE = (200, 200, 200)
    DOT_COLOR_PAST = (80, 80, 80)
    TEXT_COLOR = (0, 0, 0)
else:
    BG_COLOR = (0, 0, 0)
    DOT_COLOR_FUTURE = (40, 40, 40)
    DOT_COLOR_PAST = (100, 100, 100)
    TEXT_COLOR = (255, 255, 255)

DOT_COLOR_TODAY = _hex_to_rgb(ACTIVE_DOT_COLORS[0])

HOUR_GRID_COLS = 8
HOUR_GRID_ROWS = 3
HOUR_DOT_RADIUS = 15
HOUR_SPACING = 60
HOUR_GRID_SHAPE = 'circle'
HOUR_GRID_TOP_FACTOR = 0.35

DAY_GRID_COLS = 16
DAY_DOT_RADIUS = 14
DAY_SPACING = 45
DAY_GRID_SHAPE = 'circle'
DAY_GRID_TOP_OFFSET_FROM_HOUR = 180
MONTH_GAP = 12
WEEK_GRID_SHAPE = 'square'
FONT_SIZE = 28
GRID_TO_TEXT_SPACING = 80
QUOTE_SOURCES = "all"
WEEK_GRID_ROWS = 7
WEEK_DOT_RADIUS = 10
WEEK_SPACING = 45
