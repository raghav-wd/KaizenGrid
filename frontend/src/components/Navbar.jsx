export default function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo">
          <img src="/logo.png" alt="KaizenGrid" className="nav-logo-img" />
          Kaizen<span>Grid</span>
        </div>
        <div className="nav-links">
          <a href="#preview">Preview</a>
          <a href="#customize">Customize</a>
          <a href="#setup">Setup</a>
        </div>
      </div>
    </nav>
  );
}
