from PIL import Image, ImageDraw
import pytz
from datetime import datetime
import io

from wallpaper_gen.config import build_config
from wallpaper_gen.components.hour_grid import HourGrid
from wallpaper_gen.components.year_grid import YearGrid
from wallpaper_gen.components.week_grid import WeekGrid
from wallpaper_gen.components.motivational_text import MotivationalText


def generate_wallpaper(country=None, theme=None, accent=None, device=None,
                       quotes_enabled=True, anime=None):
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

    # 4. Export
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)

    return img_io
