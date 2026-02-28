import math
import calendar
from wallpaper_gen.components.common import draw_centered_text, get_font
from wallpaper_gen.components.drawing_utils import draw_shape


class YearGrid:
    def __init__(self, day_of_year, total_days, hour_grid_bottom_y, year, cfg):
        self.day_of_year = day_of_year
        self.total_days = total_days
        self.year = year
        self.cfg = cfg

        DAY_GRID_COLS = cfg['DAY_GRID_COLS']
        DAY_SPACING = cfg['DAY_SPACING']
        MONTH_GAP = cfg['MONTH_GAP']

        self.month_days = [calendar.monthrange(year, m)[1] for m in range(1, 13)]

        # Float-based row tracking for precise gap placement
        self._day_positions = []
        current_y_offset = 0.0
        for month_idx, mdays in enumerate(self.month_days):
            col_in_month = 0
            for d in range(mdays):
                col = col_in_month % DAY_GRID_COLS
                y = current_y_offset + (col_in_month // DAY_GRID_COLS) * DAY_SPACING
                self._day_positions.append((col, y))
                col_in_month += 1
            month_rows = math.ceil(mdays / DAY_GRID_COLS)
            current_y_offset += (month_rows - 1) * DAY_SPACING
            if month_idx < 11:
                current_y_offset += DAY_SPACING + MONTH_GAP

        self._total_height = current_y_offset

        grid_width = (DAY_GRID_COLS - 1) * DAY_SPACING
        self.start_x = (cfg['WIDTH'] - grid_width) // 2
        self.start_y = hour_grid_bottom_y + cfg['DAY_GRID_TOP_OFFSET_FROM_HOUR']

    def draw(self, drawer):
        c = self.cfg
        for d in range(1, self.total_days + 1):
            col, y_offset = self._day_positions[d - 1]

            x = self.start_x + col * c['DAY_SPACING']
            y = self.start_y + y_offset

            if d < self.day_of_year:
                color = c['DOT_COLOR_PAST']
            elif d == self.day_of_year:
                color = c['DOT_COLOR_TODAY']
            else:
                color = c['DOT_COLOR_FUTURE']

            draw_shape(drawer, x, y, c['DAY_DOT_RADIUS'], color, c['DAY_GRID_SHAPE'])

    def draw_text(self, drawer):
        c = self.cfg
        percent_year = (self.day_of_year / self.total_days) * 100
        days_left = self.total_days - self.day_of_year

        text = f"{days_left} days left \u2022 {percent_year:.1f}% Completed"

        bottom_y = self.start_y + self._total_height
        text_y = bottom_y + c['GRID_TO_TEXT_SPACING']

        font = get_font(c['FONT_SIZE'])
        draw_centered_text(drawer, text, text_y, c['WIDTH'], font, c['TEXT_COLOR'])

    def get_bounds(self):
        c = self.cfg
        width = (c['DAY_GRID_COLS'] - 1) * c['DAY_SPACING']
        height = self._total_height
        return {
            'x': self.start_x,
            'y': self.start_y,
            'width': width,
            'height': height
        }
