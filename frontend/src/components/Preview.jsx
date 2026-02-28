import PhoneMock from "./PhoneMock";
import useFadeIn from "../hooks/useFadeIn";

export default function Preview({ wallpaperUrl }) {
  const ref1 = useFadeIn();
  const ref2 = useFadeIn();

  return (
    <section className="preview-section" id="preview">
      <div className="container">
        <div className="section-badge">Live Preview</div>
        <div className="section-title" ref={ref1}>
          See It In Action
        </div>
        <p className="section-sub" ref={ref2}>
          A wallpaper that tracks your hours, your week, and your entire year —
          refreshed every day.
        </p>
        <PhoneMock url={wallpaperUrl} maxWidth={280} />
      </div>
    </section>
  );
}
