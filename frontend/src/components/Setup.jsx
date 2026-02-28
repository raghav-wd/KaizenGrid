import useFadeIn from "../hooks/useFadeIn";

const STEPS = [
  {
    title: "Copy URL",
    desc: "Configure your wallpaper above and copy the generated URL.",
  },
  {
    title: "Create Automation",
    desc: "Shortcuts App → Automation → New Automation.\nTime of Day: 6:00 AM → Run Immediately.",
  },
  {
    title: "Configure Shortcut",
    desc: "Add two actions:",
    code: "1. Get Contents of URL → paste your URL\n2. Set Wallpaper Photo → Lock Screen",
  },
  {
    title: "Finalize",
    desc: 'In "Set Wallpaper Photo", tap the arrow (→), then:',
    code: 'Disable "Crop to Subject"\nDisable "Show Preview"',
  },
];

export default function Setup() {
  const r1 = useFadeIn();
  const r2 = useFadeIn();

  return (
    <section className="setup" id="setup">
      <div className="container">
        <div className="section-badge">Almost There</div>
        <div className="section-title" ref={r1}>
          Set It &amp; Forget It
        </div>
        <p className="section-sub" ref={r2}>
          Auto-update your wallpaper daily with iOS Shortcuts.
        </p>
        <div className="glow-line" style={{ marginBottom: 48 }} />

        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <StepCard key={i} num={i + 1} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ num, title, desc, code }) {
  const ref = useFadeIn();
  return (
    <div className="step-card" ref={ref}>
      <div className="step-num">{num}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {code && <code>{code}</code>}
    </div>
  );
}
