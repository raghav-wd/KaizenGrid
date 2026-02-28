from wallpaper_gen.components.common import draw_centered_text, get_font
from wallpaper_gen.components.drawing_utils import draw_shape


class HourGrid:
    def __init__(self, current_hour, current_minute, cfg):
        self.current_hour = current_hour
        self.current_minute = current_minute
        self.cfg = cfg

        grid_width = (cfg['HOUR_GRID_COLS'] - 1) * cfg['HOUR_SPACING']
        self.start_x = (cfg['WIDTH'] - grid_width) // 2
        self.start_y = int(cfg['HEIGHT'] * cfg['HOUR_GRID_TOP_FACTOR'])

    def draw(self, drawer):
        c = self.cfg
        for h in range(24):
            row = h // c['HOUR_GRID_COLS']
            col = h % c['HOUR_GRID_COLS']
            x = self.start_x + col * c['HOUR_SPACING']
            y = self.start_y + row * c['HOUR_SPACING']

            if h < self.current_hour:
                color = c['DOT_COLOR_PAST']
            elif h == self.current_hour:
                color = c['DOT_COLOR_TODAY']
            else:
                color = c['DOT_COLOR_FUTURE']

            draw_shape(drawer, x, y, c['HOUR_DOT_RADIUS'], color, c['HOUR_GRID_SHAPE'])

    def draw_text(self, drawer):
        c = self.cfg
        hours_left = 24 - self.current_hour
        minutes_passed = self.current_hour * 60 + self.current_minute
        percent_day = (minutes_passed / (24 * 60)) * 100

        text = f"{hours_left} hours left • {percent_day:.0f}% Completed"

        bottom_y = self.start_y + (c['HOUR_GRID_ROWS'] - 1) * c['HOUR_SPACING']
        text_y = bottom_y + c['GRID_TO_TEXT_SPACING']

        font = get_font(c['FONT_SIZE'])
        draw_centered_text(drawer, text, text_y, c['WIDTH'], font, c['TEXT_COLOR'])

    def get_bottom_y(self):
        c = self.cfg
        return self.start_y + (c['HOUR_GRID_ROWS'] - 1) * c['HOUR_SPACING']
