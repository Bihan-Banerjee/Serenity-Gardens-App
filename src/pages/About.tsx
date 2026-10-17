import { useRef, useState } from 'react';

const MILESTONES = [
  { year: '2021', title: 'Founded', emoji: '🌱', desc: 'The garden started as a small backyard experiment.' },
  { year: '2022', title: 'First Harvest', emoji: '🌾', desc: 'First commercial harvest of organic vegetables.' },
  { year: '2023', title: 'Pisciculture', emoji: '🐟', desc: 'Fish farming added — rohu, catla and mrigal.' },
  { year: '2024', title: 'Solar Panels', emoji: '☀️', desc: 'Went 80% solar. Zero chemical farming certified.' },
  { year: '2025', title: 'Open to Visitors', emoji: '🚪', desc: 'Opened gates for guided tours and retreats.' },
  { year: '2026', title: 'Online Store', emoji: '🛒', desc: 'Launched Serenity Gardens online for fresh delivery.' },
];

const TEAM = [
  { name: 'Baba', role: 'Founder & Head Farmer', emoji: '👨‍🌾', color: '#D4EDDA' },
  { name: 'Ma', role: 'Garden Curator', emoji: '👩‍🌾', color: '#FFF3CD' },
  { name: 'Jeja', role: 'Pisciculture Manager', emoji: '🎣', color: '#D1E8F7' },
  { name: 'Jemma', role: 'Visitor Experience', emoji: '🌸', color: '#d8bcbe' },
  { name: 'Gablu', role: 'Technical Lead', emoji: '💻', color: '#899dab' },
  { name: 'Titi Didi', role: 'Medical Officer', emoji: '⚕️', color: '#F8D7DA' },
];

const VALUES = [
  { emoji: '🌿', title: 'Organic Always', body: 'Zero pesticides. Zero chemicals. Always.' },
  { emoji: '💧', title: 'Water Wise', body: 'Rainwater harvesting feeds 100% of our irrigation.' },
  { emoji: '☀️', title: 'Solar Powered', body: '80% of energy comes from our rooftop solar array.' },
  { emoji: '🤝', title: 'Community First', body: 'Local employment and fair wages for all workers.' },
];

const BEFORE_URI = 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775056439/broken_rygkpq.png';
const AFTER_URI = 'https://res.cloudinary.com/drj7t97rd/image/upload/v1775056468/hero-garden6_d92wqb.jpg';

function CompareSlider() {
  const [pct, setPct] = useState(50);
  const box = useRef<HTMLDivElement>(null);

  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPct(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <section className="pad-x">
      <p className="compare-label">Before &amp; After — Seasonal Transform</p>
      <div
        className="compare"
        ref={box}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX); }}
        onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e.clientX); }}
      >
        <img src={AFTER_URI} alt="After" draggable={false} />
        <div className="compare-before" style={{ width: `${pct}%` }}>
          <img src={BEFORE_URI} alt="Before" draggable={false} style={{ width: box.current?.clientWidth }} />
        </div>
        <div className="compare-handle" style={{ left: `${pct}%` }}><span>⇔</span></div>
        <span className="compare-tag left">Before</span>
        <span className="compare-tag right">After</span>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div className="about">
      <div className="about-hero" style={{ backgroundImage: 'url(https://res.cloudinary.com/drj7t97rd/image/upload/v1775056597/about-us_gg5bpi.jpg)' }}>
        <div className="about-hero-shade fade-up">
          <div className="eyebrow light">Est. 2008 · West Bengal</div>
          <h2>About Serenity Gardens</h2>
          <p>A family-run farmhouse retreat rooted in sustainable living, organic farming, and open hearts.</p>
        </div>
      </div>

      <section className="pad-x">
        <div className="eyebrow">Our Story</div>
        <h3 className="section-title">From Seed to Sanctuary</h3>
        <p className="body">
          What started as one family's love for the land has grown into a thriving ecosystem — 12 acres of
          organic gardens, fish ponds, flower beds, and forest patches that breathe life into everyone who walks through.
        </p>
        <p className="body">
          We believe in farming as a way of life, not just an industry. Everything here — from the solar panels
          to the worm compost bins — exists to prove that beauty and sustainability aren't opposites.
        </p>
      </section>

      <CompareSlider />

      <section className="pad-x">
        <div className="eyebrow">What We Stand For</div>
        <h3 className="section-title">Our Values</h3>
        <div className="values-grid">
          {VALUES.map((v) => (
            <div key={v.title} className="card value">
              <div className="value-emoji">{v.emoji}</div>
              <b>{v.title}</b>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pad-x">
        <div className="eyebrow">Our Journey</div>
        <h3 className="section-title">Milestones</h3>
        <div className="timeline">
          {MILESTONES.map((m, i) => (
            <div key={m.year} className={`tl-row fade-up ${i % 2 ? 'right' : 'left'}`} style={{ animationDelay: `${i * 120}ms` }}>
              <div className="tl-side">
                {i % 2 === 0 && <><b className="tl-year">{m.year}</b><b>{m.title}</b><p>{m.desc}</p></>}
              </div>
              <div className="tl-center"><span className="tl-dot">{m.emoji}</span>{i < MILESTONES.length - 1 && <span className="tl-line" />}</div>
              <div className="tl-side">
                {i % 2 !== 0 && <><b className="tl-year">{m.year}</b><b>{m.title}</b><p>{m.desc}</p></>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pad-x">
        <div className="eyebrow">The People</div>
        <h3 className="section-title">Meet the Family</h3>
        <div className="team-row">
          {TEAM.map((t) => (
            <div key={t.name} className="team-card" style={{ background: t.color }}>
              <div className="team-emoji">{t.emoji}</div>
              <b>{t.name}</b>
              <span>{t.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pad-x" style={{ paddingBottom: 40 }}>
        <div className="visit-banner">
          <div className="big-emoji">📍</div>
          <h3>Come Visit Us</h3>
          <p>Open to visitors on weekends. Guided tours, fresh produce pick, and nature walks available.</p>
          <div className="visit-detail">
            <span>📅 Sat &amp; Sun · 9 AM – 5 PM</span>
            <span>📞 Contact us via the review form</span>
          </div>
        </div>
      </section>
    </div>
  );
}
