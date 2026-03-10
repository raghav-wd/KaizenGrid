from PIL import Image, ImageDraw, ImageFont
import pytz
from datetime import datetime
import io

from wallpaper_gen.config import build_config
from wallpaper_gen.components.hour_grid import HourGrid
from wallpaper_gen.components.year_grid import YearGrid
from wallpaper_gen.components.week_grid import WeekGrid
from wallpaper_gen.components.motivational_text import MotivationalText


def generate_wallpaper(country=None, theme=None, accent=None, device=None,
                       quotes_enabled=True, anime=None, preview=True):
    # Build dynamic config from parameters
    cfg = build_config(
        country=country,
        theme=theme,
        accent=accent,
        device=device,
        quotes_enabled=quotes_enabled,
        anime=anime,
    )

    # 1. Get Calculation Data
    tz = pytz.timezone(cfg['TIMEZONE'])
    now = datetime.now(tz)

    day_of_year = now.timetuple().tm_yday
    is_leap = now.year % 4 == 0 and (now.year % 100 != 0 or now.year % 400 == 0)
    total_days = 366 if is_leap else 365

    current_hour = now.hour
    current_minute = now.minute
    current_weekday = now.weekday()

    # 2. Setup Canvas
    img = Image.new('RGB', (cfg['WIDTH'], cfg['HEIGHT']), cfg['BG_COLOR'])
    draw = ImageDraw.Draw(img)

    # 3. Create Components
    hour_grid = HourGrid(current_hour, current_minute, cfg)
    hour_grid.draw(draw)
    hour_grid.draw_text(draw)

    # Motivational Text (above hour grid) – only if quotes are enabled
    if cfg['QUOTE_SOURCES'] is not None:
        motivational_text = MotivationalText(hour_grid.start_y, cfg)
        motivational_text.draw(draw)

    # Year Grid
    year_grid = YearGrid(day_of_year, total_days, hour_grid.get_bottom_y(), now.year, cfg)
    year_grid.draw(draw)
    year_grid.draw_text(draw)

    # Week Grid
    week_grid = WeekGrid(current_weekday, year_grid.get_bounds(), cfg)
    week_grid.draw(draw)

    # Preview watermark
    if preview:
        _draw_preview_watermark(img, draw, cfg)

    # 4. Export
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)

    return img_io


def _load_font(size):
    """Try to load a bold truetype font, fall back to default."""
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


def _draw_preview_watermark(img, draw, cfg):
    """Render 'Preview Only' horizontally at top + repeated vertically on right side."""
    width, height = cfg['WIDTH'], cfg['HEIGHT']

    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    # Theme-aware colour
    if cfg['THEME'] == 'light':
        text_color = (0, 0, 0, 50)
        side_text_color = (0, 0, 0, 100)
    else:
        text_color = (255, 255, 255, 50)
        side_text_color = (255, 255, 255, 100)

    text = "Preview Only"

    # ── 1. Large horizontal text centred near the top ──
    top_font_size = max(width // 2, 48)
    top_font = _load_font(top_font_size)
    bbox = overlay_draw.textbbox((0, 0), text, font=top_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    top_x = (width - tw) // 2
    top_y = int(height * 0.17)
    overlay_draw.text((top_x, top_y), text, fill=text_color, font=top_font)

    # ── 2. Smaller text repeated vertically along the right edge ──
    side_font_size = max(width // 18, 28)
    side_font = _load_font(side_font_size)

    # Measure text to create a properly-sized canvas for rotation
    sbbox = overlay_draw.textbbox((0, 0), text, font=side_font)
    stw = sbbox[2] - sbbox[0]
    sth = sbbox[3] - sbbox[1]

    # Draw text on a tight canvas, then rotate 90° CCW (reads bottom-to-top)
    pad = 6
    txt_canvas = Image.new('RGBA', (stw + pad, sth + pad), (0, 0, 0, 0))
    ImageDraw.Draw(txt_canvas).text((pad // 2, pad // 2), text,
                                     fill=side_text_color, font=side_font)
    rotated_txt = txt_canvas.rotate(90, expand=True, resample=Image.BICUBIC)

    rt_w, rt_h = rotated_txt.size
    # Position near the right edge
    paste_x = width - rt_w - int(width * 0.04)

    # Tile vertically with generous spacing
    gap = int(height * 0.04)
    y = int(height * 0.10)
    while y + rt_h < height - int(height * 0.04):
        overlay.paste(rotated_txt, (paste_x, y), rotated_txt)
        y += rt_h + gap

    # Composite onto the original image
    img.paste(Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB'))
