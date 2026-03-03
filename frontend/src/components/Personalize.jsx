import { useState, useCallback } from "react";
import PhoneMock from "./PhoneMock";
import useFadeIn from "../hooks/useFadeIn";

const WORKER_URL =
  import.meta.env.VITE_WORKER_URL ||
  "https://kaizengrid.raghav-gupta-gpt.workers.dev";
const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SLsTSE3jxhuDp5";

const PRESET_COLORS = [
  "#00D4FF",
  "#FFD700",
  "#FF6B6B",
  "#A855F7",
  "#22C55E",
  "#FFFFFF",
];

export default function Personalize({
  config,
  options,
  updateConfig,
  wallpaperUrl,
}) {
  const [copied, setCopied] = useState(false);
  const [payment, setPayment] = useState({
    loading: false,
    paid: false,
    paidUrl: null,
    error: null,
  });

  const handleCopy = useCallback(() => {
    const url = payment.paidUrl || wallpaperUrl;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [payment.paidUrl, wallpaperUrl]);

  const handlePayment = useCallback(async () => {
    setPayment((p) => ({ ...p, loading: true, error: null }));

    try {
      // 1. Create Razorpay order via Cloudflare Worker
      const orderRes = await fetch(`${WORKER_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gridConfig: config }),
      });
      const order = await orderRes.json();

      if (!order.id) {
        throw new Error(order.error?.description || "Failed to create order");
      }

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "KaizenGrid",
        description: "Personalized Dynamic Wallpaper",
        order_id: order.id,
        handler: async (response) => {
          // 3. Verify payment via Cloudflare Worker
          try {
            const verifyRes = await fetch(`${WORKER_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const result = await verifyRes.json();

            if (result.success) {
              setPayment({
                loading: false,
                paid: true,
                paidUrl: result.wallpaperUrl,
                error: null,
              });
            } else {
              setPayment((p) => ({
                ...p,
                loading: false,
                error: "Payment verification failed. Contact support.",
              }));
            }
          } catch {
            setPayment((p) => ({
              ...p,
              loading: false,
              error: "Verification error. Contact support.",
            }));
          }
        },
        modal: {
          ondismiss: () => {
            setPayment((p) => ({ ...p, loading: false }));
          },
        },
        theme: { color: "#" + config.accent },
      });

      rzp.on("payment.failed", (resp) => {
        setPayment((p) => ({
          ...p,
          loading: false,
          error: resp.error?.description || "Payment failed. Please try again.",
        }));
      });

      rzp.open();
    } catch (err) {
      setPayment((p) => ({
        ...p,
        loading: false,
        error: err.message || "Something went wrong. Please try again.",
      }));
    }
  }, [config]);

  const r1 = useFadeIn();
  const r2 = useFadeIn();

  return (
    <section className="personalize" id="customize">
      <div className="container">
        <div className="section-badge">Personalize</div>
        <div className="section-title" ref={r1}>
          Make It Yours
        </div>
        <p className="section-sub" ref={r2}>
          Configure every detail. Preview updates instantly.
        </p>
        <div className="glow-line" />

        <div className="config-layout">
          {/* ── Form Column ── */}
          <div className="form-col">
            {/* Country */}
            <FormGroup label="Country">
              <select
                className="form-select"
                value={config.country}
                onChange={(e) => updateConfig("country", e.target.value)}
                disabled={payment.paid}
              >
                {options.countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormGroup>

            {/* Theme */}
            <FormGroup label="Theme">
              <div className="theme-row">
                <button
                  className={`theme-btn ${config.theme === "dark" ? "active" : ""}`}
                  onClick={() => updateConfig("theme", "dark")}
                  disabled={payment.paid}
                >
                  ● Dark
                </button>
                <button
                  className={`theme-btn ${config.theme === "light" ? "active" : ""}`}
                  onClick={() => updateConfig("theme", "light")}
                  disabled={payment.paid}
                >
                  ○ Light
                </button>
              </div>

              {/* Accent color */}
              <div className="accent-row">
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Accent
                </span>
                <div className="color-swatch">
                  <input
                    type="color"
                    value={"#" + config.accent}
                    onChange={(e) =>
                      updateConfig("accent", e.target.value.replace("#", ""))
                    }
                    disabled={payment.paid}
                  />
                </div>
                <span className="accent-hex">
                  #{config.accent.toUpperCase()}
                </span>
              </div>

              <div className="preset-colors">
                {PRESET_COLORS.map((hex) => (
                  <div
                    key={hex}
                    className={`preset-dot ${"#" + config.accent.toUpperCase() === hex.toUpperCase() ? "active" : ""}`}
                    style={{
                      background: hex,
                      opacity: payment.paid ? 0.5 : 1,
                      pointerEvents: payment.paid ? "none" : "auto",
                    }}
                    onClick={() => updateConfig("accent", hex.replace("#", ""))}
                  />
                ))}
              </div>
            </FormGroup>

            {/* Device */}
            <FormGroup label="Device">
              <select
                className="form-select"
                value={config.device}
                onChange={(e) => updateConfig("device", e.target.value)}
                disabled={payment.paid}
              >
                {options.devices.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormGroup>

            {/* Anime Quotes */}
            <FormGroup label="Anime Quotes">
              <div className="toggle-row">
                <span>Show motivational anime quote</span>
                <button
                  className={`toggle-switch ${config.quotes === "enabled" ? "on" : ""}`}
                  disabled={payment.paid}
                  onClick={() =>
                    updateConfig(
                      "quotes",
                      config.quotes === "enabled" ? "disabled" : "enabled",
                    )
                  }
                />
              </div>
              {config.quotes === "enabled" && (
                <div className="anime-select">
                  <select
                    className="form-select"
                    value={config.anime}
                    onChange={(e) => updateConfig("anime", e.target.value)}
                    disabled={payment.paid}
                  >
                    <option value="all">All Anime</option>
                    {options.animeList.map((a) => (
                      <option key={a} value={a}>
                        {a
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </FormGroup>

            {/* ── Payment / URL Section ── */}
            {!payment.paid ? (
              <div className="payment-box">
                <div className="payment-header">
                  <h4>Get Your Wallpaper URL</h4>
                  <div className="payment-price">
                    ₹59
                    <span className="payment-period">/month</span>
                  </div>
                </div>
                <p className="payment-desc">
                  Unlock your personalized wallpaper URL — auto-updates every
                  hour. First month free!
                </p>
                <ul className="payment-features">
                  <li>Personalized hourly wallpaper</li>
                  <li>Auto-updates via iOS Shortcuts</li>
                  <li>2 months free, then ₹59/month</li>
                </ul>
                <button
                  className="pay-btn"
                  onClick={handlePayment}
                  disabled={payment.loading}
                >
                  {payment.loading ? (
                    <>
                      <span className="btn-spinner" /> Processing…
                    </>
                  ) : (
                    "Pay ₹59 →"
                  )}
                </button>
                {payment.error && (
                  <p className="payment-error">{payment.error}</p>
                )}
              </div>
            ) : (
              <div className="url-box success-box">
                <div className="success-header">
                  <span className="success-icon">✓</span>
                  <span>Payment Successful</span>
                </div>
                <h4>Your Wallpaper URL</h4>
                <div className="url-row">
                  <input
                    className="url-input"
                    type="text"
                    readOnly
                    value={payment.paidUrl}
                  />
                  <button
                    className={`copy-btn ${copied ? "copied" : ""}`}
                    onClick={handleCopy}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="instructions-box">
                  <h5>How to Set Up (iOS Shortcuts)</h5>
                  <ol>
                    <li>
                      Open the shortcut link to add <strong>KaizenGrid</strong>{" "}
                      to your Shortcuts:{" "}
                      <a
                        href="https://www.icloud.com/shortcuts/121fcbcd5ebc4f05a2ad38d6973c3965"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="instruction-link"
                      >
                        Add Shortcut ↗
                      </a>
                    </li>
                    <li>
                      When prompted, paste your <strong>Wallpaper URL</strong>{" "}
                      (copied above) into the shortcut.
                    </li>
                    <li>
                      Go to <strong>Shortcuts</strong> →{" "}
                      <strong>Automation</strong> → tap <strong>+</strong>
                    </li>
                    <li>
                      Create <strong>24 automations</strong> — one for every
                      hour (12:00 AM, 1:00 AM, 2:00 AM … 11:00 PM).
                    </li>
                    <li>
                      For each: Trigger → <strong>Time of Day</strong> → set the
                      hour → <strong>Run Immediately</strong>.
                    </li>
                    <li>
                      Under "Do", select the <strong>KaizenGrid</strong>{" "}
                      shortcut.
                    </li>
                  </ol>
                  <p className="instruction-note">
                    This ensures your wallpaper refreshes every hour with
                    up-to-date progress.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Phone Preview Column ── */}
          <div className="sticky-phone">
            <PhoneMock url={wallpaperUrl} maxWidth={260} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FormGroup({ label, children }) {
  const ref = useFadeIn();
  return (
    <div className="form-group" ref={ref}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}
