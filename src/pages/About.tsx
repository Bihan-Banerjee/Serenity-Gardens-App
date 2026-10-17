import { useRef, useState } from 'react';
import Icon from '../components/Icon';
import type { IconName } from '../components/Icon';
import { Reveal, SectionHead } from '../components/Motion';

const MILESTONES = [
  { year: '2021', title: 'Founded', desc: 'The garden started as a small backyard experiment.' },
  { year: '2022', title: 'First harvest', desc: 'First commercial harvest of organic vegetables.' },
  { year: '2023', title: 'Pisciculture', desc: 'Fish farming added: rohu, catla and mrigal.' },
  { year: '2024', title: 'Solar panels', desc: 'Went 80% solar. Zero chemical farming certified.' },
  { year: '2025', title: 'Open to visitors', desc: 'Opened gates for guided tours and retreats.' },
  { year: '2026', title: 'Online store', desc: 'Launched Serenity Gardens online for fresh delivery.' },
];

const TEAM = [
  { name: 'Baba', role: 'Founder & Head Farmer', color: '#D4EDDA' },
  { name: 'Ma', role: 'Garden Curator', color: '#FFF3CD' },
  { name: 'Jeja', role: 'Pisciculture Manager', color: '#D1E8F7' },
  { name: 'Jemma', role: 'Visitor Experience', color: '#E9D5D7' },
  { name: 'Gablu', role: 'Technical Lead', color: '#C9D6DF' },
  { name: 'Titi Didi', role: 'Medical Officer', color: '#F8D7DA' },
];

const VALUES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'leaf', title: 'Organic always', body: 'Zero pesticides. Zero chemicals. Always.' },
  { icon: 'droplet', title: 'Water wise', body: 'Rainwater harvesting feeds 100% of our irrigation.' },
  { icon: 'sun', title: 'Solar powered', body: '80% of energy comes from our rooftop solar array.' },
  { icon: 'user', title: 'Community first', body: 'Local employment and fair wages for all workers.' },
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
        <div className="compare-handle" style={{ left: `${pct}%` }}><span><Icon name="swap" size={18} /></span></div>
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
        <SectionHead eyebrow="Our story" title="From seed to sanctuary" />
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
        <SectionHead eyebrow="What we stand for" title="Our values" />
        <div className="values-grid">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 80}><div className="card value">
              <Icon name={v.icon} size={28} className="value-icon" />
              <b>{v.title}</b>
              <p>{v.body}</p>
            </div></Reveal>
          ))}
        </div>
      </section>

      <section className="pad-x">
        <SectionHead eyebrow="Our journey" title="Milestones" />
        <div className="timeline">
          {MILESTONES.map((m, i) => (
            <Reveal key={m.year} delay={60} className={`tl-row ${i % 2 ? 'right' : 'left'}`}>
              <div className="tl-side">
                {i % 2 === 0 && <><b className="tl-year">{m.year}</b><b>{m.title}</b><p>{m.desc}</p></>}
              </div>
              <div className="tl-center"><span className="tl-dot">{i + 1}</span>{i < MILESTONES.length - 1 && <span className="tl-line" />}</div>
              <div className="tl-side">
                {i % 2 !== 0 && <><b className="tl-year">{m.year}</b><b>{m.title}</b><p>{m.desc}</p></>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pad-x">
        <SectionHead eyebrow="The people" title="Meet the family" />
        <div className="team-row">
          {TEAM.map((t) => (
            <div key={t.name} className="team-card" style={{ background: t.color }}>
              <div className="team-initial">{t.name[0]}</div>
              <b>{t.name}</b>
              <span>{t.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pad-x" style={{ paddingBottom: 40 }}>
        <div className="visit-banner">
          <h3>Come visit us</h3>
          <p>Open to visitors on weekends. Guided tours, fresh produce pick, and nature walks available.</p>
          <div className="visit-detail">
            <span><Icon name="calendar" size={16} /> Sat &amp; Sun, 9 AM to 5 PM</span>
            <span><Icon name="mail" size={16} /> Contact us through the review form</span>
          </div>
        </div>
      </section>
    </div>
  );
}
