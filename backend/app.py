import os
from flask import Flask, send_file, send_from_directory, request, jsonify
from wallpaper_gen import generate_wallpaper
from wallpaper_gen.config import COUNTRY_TIMEZONES, DEVICE_RESOLUTIONS, get_available_anime

# React build output lives in static/dist after `npm run build`
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static', 'dist')

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')


# ── API ─────────────────────────────────────────────
@app.route('/api/config')
def api_config():
    """Return dropdown data for the frontend."""
    return jsonify({
        'countries': sorted(COUNTRY_TIMEZONES.keys()),
        'devices': sorted(DEVICE_RESOLUTIONS.keys()),
        'anime': sorted(get_available_anime()),
    })


@app.route('/wallpaper')
def get_wallpaper():
    """Generate a wallpaper PNG from GET query parameters."""
    country = request.args.get('country', None)
    theme = request.args.get('theme', None)
    accent = request.args.get('accent', None)
    device = request.args.get('device', None)
    quotes_param = request.args.get('quotes', 'enabled')
    anime = request.args.get('anime', None)

    quotes_enabled = quotes_param.lower() != 'disabled'

    img_io = generate_wallpaper(
        country=country,
        theme=theme,
        accent=accent,
        device=device,
        quotes_enabled=quotes_enabled,
        anime=anime,
    )
    return send_file(img_io, mimetype='image/png')


# ── Serve React SPA ─────────────────────────────────
@app.route('/')
def index():
    return send_from_directory(STATIC_DIR, 'index.html')


@app.errorhandler(404)
def fallback(e):
    """SPA fallback — serve index.html for any unmatched route."""
    return send_from_directory(STATIC_DIR, 'index.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
