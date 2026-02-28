from wallpaper_gen.components.common import get_font, draw_centered_text
from wallpaper_gen.components.drawing_utils import draw_shape


class WeekGrid:
    def __init__(self, current_weekday, year_grid_bounds, cfg):
        self.current_weekday = current_weekday
        self.cfg = cfg

        self.height = (cfg['WEEK_GRID_ROWS'] - 1) * cfg['WEEK_SPACING']

        year_cy = year_grid_bounds['y'] + (year_grid_bounds['height'] / 2)
        self.start_y = year_cy - (self.height / 2)

        left_margin_width = year_grid_bounds['x']
        self.start_x = left_margin_width // 2

    def draw(self, drawer):
        c = self.cfg
        for w in range(c['WEEK_GRID_ROWS']):
            x = self.start_x
            y = self.start_y + w * c['WEEK_SPACING']

            if w < self.current_weekday:
                color = c['DOT_COLOR_PAST']
            elif w == self.current_weekday:
                color = c['DOT_COLOR_TODAY']
            else:
                color = c['DOT_COLOR_FUTURE']

            draw_shape(drawer, x, y, c['WEEK_DOT_RADIUS'], color, c['WEEK_GRID_SHAPE'])

    def draw_text(self, drawer):
        pass
