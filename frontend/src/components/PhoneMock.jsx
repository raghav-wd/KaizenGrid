import { useState, useEffect, useRef } from "react";

export default function PhoneMock({ url, maxWidth = 280 }) {
  const [loading, setLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    setLoading(true);

    // Debounce: wait 500ms after last URL change before loading
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Add cache bust to force reload
      setImgSrc(url + "&_t=" + Date.now());
    }, 500);

    return () => clearTimeout(timerRef.current);
  }, [url]);

  return (
    <div className="phone-mock" style={{ maxWidth }}>
      {imgSrc && (
        <img
          src={imgSrc}
          alt="KaizenGrid Wallpaper"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      )}
      <div className={`phone-loader ${!loading ? "hidden" : ""}`}>
        <div className="spinner" />
      </div>
    </div>
  );
}
