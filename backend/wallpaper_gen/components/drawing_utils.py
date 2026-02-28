def draw_shape(drawer, x, y, radius, color, shape='circle'):
    """
    Draws a shape (circle or square) centered at (x, y) with the given radius (or half-side).
    """
    coords = (x - radius, y - radius, x + radius, y + radius)
    
    if shape == 'square':
        drawer.rectangle(coords, fill=color)
    else:
        # Default to circle
        drawer.ellipse(coords, fill=color)
