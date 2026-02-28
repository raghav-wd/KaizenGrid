import json
import os
import random
from wallpaper_gen.components.common import get_font

TEXT_ABOVE_GRID_SPACING = 50
LINE_SPACING = 8

QUOTES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "quotes.json")


def _load_quotes(sources):
    """Load quotes from the JSON file and filter by sources."""
    with open(QUOTES_FILE, "r", encoding="utf-8") as f:
        all_quotes = json.load(f)

    if sources == "all" or sources is None:
        selected_keys = list(all_quotes.keys())
    elif isinstance(sources, str):
        selected_keys = [sources]
    elif isinstance(sources, list):
        selected_keys = sources
    else:
        selected_keys = list(all_quotes.keys())

    pool = []
    for key in selected_keys:
        if key in all_quotes:
            pool.extend(all_quotes[key])

    if not pool:
        for quotes in all_quotes.values():
            pool.extend(quotes)

    return pool


class MotivationalText:
    def __init__(self, hour_grid_top_y, cfg):
        self.cfg = cfg
        quotes = _load_quotes(cfg['QUOTE_SOURCES'])
        self.text = " ".join(w.capitalize() for w in random.choice(quotes).split())
        self.font = get_font(cfg['FONT_SIZE'])
        self.hour_grid_top_y = hour_grid_top_y
        self.text_max_width = cfg['WIDTH'] - 300

    def _wrap_text(self, drawer):
        words = self.text.split()
        lines = []
        current_line = ""

        for word in words:
            test_line = f"{current_line} {word}".strip()
            bbox = drawer.textbbox((0, 0), test_line, font=self.font)
            if bbox[2] - bbox[0] <= self.text_max_width:
                current_line = test_line
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word

        if current_line:
            lines.append(current_line)

        return lines

    def draw(self, drawer):
        lines = self._wrap_text(drawer)

        line_height = self.font.size + LINE_SPACING
        total_height = len(lines) * line_height - LINE_SPACING

        start_y = self.hour_grid_top_y - TEXT_ABOVE_GRID_SPACING - total_height

        width = self.cfg['WIDTH']
        text_color = self.cfg['TEXT_COLOR']
        for i, line in enumerate(lines):
            bbox = drawer.textbbox((0, 0), line, font=self.font)
            text_width = bbox[2] - bbox[0]
            x = (width - text_width) / 2
            y = start_y + i * line_height
            drawer.text((x, y), line, font=self.font, fill=text_color)
