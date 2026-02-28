export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-badge">Dynamic Wallpapers</div>
      <h1>
        Your Progress.
        <br />
        <span className="accent">Visualized.</span>
      </h1>
      <p>
        Wallpapers that update daily. Track your hours, days, and year — one dot
        at a time.
      </p>
      <a href="#customize" className="cta-btn">
        Get Started
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </a>
    </section>
  );
}
