import React from "react";

const highlights = [
  {
    title: "Brand Story",
    description:
      "A minimal showcase site tailored for presenting collections, lookbooks, and announcements without any backend complexity.",
  },
  {
    title: "Flexible Sections",
    description:
      "Use the hero, spotlight, and contact blocks to introduce your brand, products, or upcoming events with clean typography.",
  },
  {
    title: "Ready to Deploy",
    description:
      "Static React + Vite setup that can be hosted on any static provider. No databases, no external APIs, just content.",
  },
];

const spotlightItems = [
  {
    title: "Tailored Visuals",
    copy: "Swap the placeholder imagery and text to highlight your favorite products or campaigns.",
  },
  {
    title: "Elegant Layout",
    copy: "A calm color palette keeps attention on your photography and brand voice.",
  },
  {
    title: "Smooth Scrolling",
    copy: "Lightweight styles and zero third-party widgets ensure fast page loads.",
  },
];

function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <p className="eyebrow">Modavista Showcase</p>
          <h1>Less code, more presence.</h1>
          <p className="lede">
            This repository has been simplified into a single-page presentation site. Replace the copy and images to launch your
            own branded experience.
          </p>
          <div className="hero__actions">
            <a className="button" href="#spotlight">
              View highlights
            </a>
            <a className="button button--ghost" href="#contact">
              Contact
            </a>
          </div>
        </div>
        <div className="hero__panel" aria-hidden>
          <div className="panel__badge">Static</div>
          <div className="panel__card">
            <p className="panel__title">Display-first site</p>
            <p className="panel__text">Optimized for showcasing content without any backend dependencies.</p>
          </div>
        </div>
      </header>

      <section id="spotlight" className="section">
        <div className="section__header">
          <p className="eyebrow">Highlights</p>
          <h2>Everything you need for a simple landing page.</h2>
          <p className="lede">Curated building blocks to introduce your story, products, or services.</p>
        </div>
        <div className="grid grid--three">
          {highlights.map((item) => (
            <div className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--muted">
        <div className="section__header">
          <p className="eyebrow">Spotlight</p>
          <h2>Feature a collection or announce a drop.</h2>
          <p className="lede">Reorder or duplicate these tiles to create your own narrative.</p>
        </div>
        <div className="grid grid--three">
          {spotlightItems.map((item) => (
            <div className="card card--border" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="section">
        <div className="contact">
          <div>
            <p className="eyebrow">Contact</p>
            <h2>Ready to make it yours?</h2>
            <p className="lede">Update the links below to point visitors to your preferred channels.</p>
          </div>
          <div className="contact__actions">
            <a className="button" href="mailto:hello@example.com">
              Email us
            </a>
            <a className="button button--ghost" href="https://www.instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>Modavista · Showcase-only build · Ready for your brand assets</p>
      </footer>
    </div>
  );
}

export default App;
