import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Preview from "./components/Preview";
import Personalize from "./components/Personalize";
import Setup from "./components/Setup";
import Footer from "./components/Footer";

export default function App() {
  const [config, setConfig] = useState({
    country: "India",
    theme: "dark",
    accent: "00D4FF",
    device: "iPhone 13 / 13 Pro / 14",
    quotes: "enabled",
    anime: "all",
  });

  const [options, setOptions] = useState({
    countries: [],
    devices: [],
    animeList: [],
  });

  // Fetch dropdown data from API
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) =>
        setOptions({
          countries: data.countries || [],
          devices: data.devices || [],
          animeList: data.anime || [],
        }),
      )
      .catch(() => {});
  }, []);

  // Build wallpaper URL
  const buildUrl = useCallback(() => {
    const base = window.location.origin + "/wallpaper";
    const params = new URLSearchParams();
    params.set("country", config.country);
    params.set("theme", config.theme);
    params.set("accent", config.accent);
    params.set("device", config.device);
    params.set("quotes", config.quotes);
    if (config.quotes === "enabled") {
      params.set("anime", config.anime);
    }
    return base + "?" + params.toString();
  }, [config]);

  const wallpaperUrl = buildUrl();

  // Update CSS accent variable
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", "#" + config.accent);
  }, [config.accent]);

  const updateConfig = useCallback((key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Preview wallpaperUrl={wallpaperUrl} />
      <Personalize
        config={config}
        options={options}
        updateConfig={updateConfig}
        wallpaperUrl={wallpaperUrl}
      />
      <Setup />
      <Footer />
    </>
  );
}
