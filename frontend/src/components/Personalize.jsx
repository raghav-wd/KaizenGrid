import { useState, useCallback } from "react";
import PhoneMock from "./PhoneMock";
import useFadeIn from "../hooks/useFadeIn";

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

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(wallpaperUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [wallpaperUrl]);

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
          Configure every detail. Your wallpaper URL updates instantly.
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
                >
                  ● Dark
                </button>
                <button
                  className={`theme-btn ${config.theme === "light" ? "active" : ""}`}
                  onClick={() => updateConfig("theme", "light")}
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
                    style={{ background: hex }}
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

            {/* URL Output */}
            <div className="url-box">
              <h4>Your Wallpaper URL</h4>
              <div className="url-row">
                <input
                  className="url-input"
                  type="text"
                  readOnly
                  value={wallpaperUrl}
                />
                <button
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
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
