import os
import json
from flask import Flask, send_file, send_from_directory, request, jsonify
from wallpaper_gen import generate_wallpaper
from wallpaper_gen.config import COUNTRY_TIMEZONES, DEVICE_RESOLUTIONS, get_available_anime

import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'projectId': 'grid-wallpaper',
})
db = firestore.client()

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
    """Generate a wallpaper PNG from GET query parameters.

    If `phno` is present, the config is fetched from Firestore (paid user).
    Otherwise the config comes from query-string params (free preview).
    """
    phno = request.args.get('phno', None)

    if phno:
        # ── Paid path: look up config in Firestore ──
        doc_ref = db.collection('users').document(phno)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({'error': 'User not found'}), 404

        user_data = doc.to_dict()
        cfg = user_data.get('config', {})
        country = cfg.get('country', None)
        theme = cfg.get('theme', None)
        accent = cfg.get('accent', None)
        device = cfg.get('device', None)
        quotes_param = cfg.get('quotes', 'enabled')
        anime = cfg.get('anime', None)
        preview = False
    else:
        # ── Free preview path: config from query string ──
        country = request.args.get('country', None)
        theme = request.args.get('theme', None)
        accent = request.args.get('accent', None)
        device = request.args.get('device', None)
        quotes_param = request.args.get('quotes', 'enabled')
        anime = request.args.get('anime', None)
        preview = True

    quotes_enabled = quotes_param.lower() != 'disabled'

    img_io = generate_wallpaper(
        country=country,
        theme=theme,
        accent=accent,
        device=device,
        quotes_enabled=quotes_enabled,
        anime=anime,
        preview=preview,
    )
    return send_file(img_io, mimetype='image/png')


@app.route('/api/save-user', methods=['POST'])
def save_user():
    """Store a user's phone number and wallpaper config in Firestore.

    Expected JSON body:
    {
        "phone": "+919876543210",
        "config": { "country": "...", "theme": "...", ... },
        "paymentId": "pay_xxx",
        "orderId": "order_xxx"
    }
    """
    data = request.get_json(force=True)
    phone = data.get('phone')
    config = data.get('config')

    if not phone or not config:
        return jsonify({'error': 'phone and config are required'}), 400

    try:
        doc_ref = db.collection('users').document(phone)
        doc_ref.set({
            'phone': phone,
            'config': config,
            'paymentId': data.get('paymentId'),
            'orderId': data.get('orderId'),
            'createdAt': firestore.SERVER_TIMESTAMP,
        }, merge=True)
    except Exception as e:
        return jsonify({'error': f'Firestore write failed: {e}'}), 500

    return jsonify({'success': True, 'phone': phone})


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
