import useFadeIn from "../hooks/useFadeIn";

const SHORTCUT_URL =
  "https://www.icloud.com/shortcuts/121fcbcd5ebc4f05a2ad38d6973c3965";

const STEPS = [
  {
    title: "Add Shortcut",
    desc: "Tap the link below to add the KaizenGrid shortcut. Paste your Wallpaper URL when prompted.",
    link: { label: "Add KaizenGrid Shortcut ↗", href: SHORTCUT_URL },
  },
  {
    title: "Create 24 Automations",
    desc: "In Shortcuts → Automation → tap +. Create one automation for every hour (12 AM, 1 AM … 11 PM).",
  },
  {
    title: "Configure Each",
    desc: "For each automation:",
    code: "Trigger: Time of Day → set the hour\nSet to: Run Immediately\nDo: Run KaizenGrid shortcut",
  },
  {
    title: "Done!",
    desc: "Your wallpaper will now refresh every hour with live progress — hours, days, and the full year.",
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

function StepCard({ num, title, desc, code, link }) {
  const ref = useFadeIn();
  return (
    <div className="step-card" ref={ref}>
      <div className="step-num">{num}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {code && <code>{code}</code>}
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="step-link"
        >
          {link.label}
        </a>
      )}
    </div>
  );
}
