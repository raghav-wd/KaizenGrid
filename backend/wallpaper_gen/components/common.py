from PIL import ImageFont

def get_font(size):
    """
    Attempts to load a standard system font or falls back to default.
    """
    try:
        # standard macOS font location
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size, index=0)
    except IOError:
        try:
            # Fallback for other systems
            return ImageFont.truetype("arial.ttf", size)
        except:
            # Last resort fallback
            try:
                return ImageFont.load_default(size=size)
            except TypeError:
                return ImageFont.load_default()

def draw_centered_text(draw, text, y, width, font, color):
    """
    Draws text centered horizontally at y position.
    """
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    text_width = right - left
    draw.text(((width - text_width) / 2, y), text, font=font, fill=color)
