import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { CountUp, Reveal, SectionHead, useInView } from '../components/Motion';

const HERO_IMAGES = [
  'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.171_rsdmwn.jpg',
  'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638885/WhatsApp_Image_2025-12-05_at_11.42.50_lh3or7.jpg',
  'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.16_xhcfgq.jpg',
  'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.551_x2y2k6.jpg',
];

const thumb = (path: string) => `https://res.cloudinary.com/drj7t97rd/image/upload/w_600,q_auto,f_auto/${path}`;

const FEATURES = [
  { title: 'Explore', subtitle: 'Flora & fauna', route: '/explore', image: thumb('v1748433091/bird_s4yydk.jpg') },
  { title: 'Gallery', subtitle: 'Moments from the estate', route: '/gallery', image: thumb('v1748433090/lilypad_vvchdi.jpg') },
  { title: 'Shop', subtitle: 'Fresh from the farm', route: '/menu', image: thumb('v1748433091/cabbage_a4ioam.jpg') },
  { title: 'Reviews', subtitle: 'What guests say', route: '/reviews', image: thumb('v1748433094/peace_qqvkoi.jpg') },
  { title: 'About', subtitle: 'Our story', route: '/about', image: thumb('v1775056597/about-us_gg5bpi.jpg') },
  { title: 'Profile', subtitle: 'Account and orders', route: '/profile', image: thumb('v1748433094/sky_xxvhhs.jpg') },
];

const MARQUEE_ITEMS = [
  'Organic farming', 'Pisciculture', 'Seasonal flowers', 'Fresh vegetables',
  '100+ tree species', 'Wildlife habitat', 'Solar powered', 'Rainwater harvesting',
];

const STATS = [
  { to: 5, suffix: '+', label: 'Fish species' },
  { to: 50, suffix: '+', label: 'Tree species' },
  { to: 15, suffix: '+', label: 'Bird species' },
];

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const el = track.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % HERO_IMAGES.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero">
      <div
        className="hero-track"
        ref={track}
        onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {HERO_IMAGES.map((src, i) => (
          <div key={src} className={`hero-slide ${i === active ? 'current' : ''}`} style={{ backgroundImage: `url(${src})` }}>
            <div className="hero-shade" />
          </div>
        ))}
      </div>

      <div className="hero-text fade-up">
        <div className="hero-title">Serenity</div>
        <div className="hero-title accent">Gardens</div>
        <p>A farmhouse retreat for nature, fresh produce and quiet.</p>
      </div>

      <svg className="hero-wave" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
        <path className="wave w1" d="M0 30 C 150 0, 300 60, 450 30 S 750 0, 900 30 S 1050 60, 1200 30 V60 H0z" />
        <path className="wave w2" d="M0 40 C 200 15, 350 55, 600 35 S 950 15, 1200 40 V60 H0z" />
      </svg>

      <div className="hero-dots">
        {HERO_IMAGES.map((_, i) => <span key={i} className={i === active ? 'on' : ''} />)}
      </div>
    </div>
  );
}

function EstateBanner() {
  const [ref, seen] = useInView<HTMLDivElement>(0.25);
  return (
    <div ref={ref} className={`estate ${seen ? 'in' : ''}`}>
      <svg className="estate-vine" viewBox="0 0 220 220" aria-hidden="true">
        <path className="vine" pathLength={1} d="M10 210 C 60 170, 30 120, 90 100 S 150 50, 210 20" />
        <path className="vine v2" pathLength={1} d="M90 100 C 120 105, 140 95, 155 80" />
        <path className="vine v3" pathLength={1} d="M52 150 C 70 145, 82 132, 86 118" />
        <circle className="bud" cx="210" cy="20" r="5" />
        <ellipse className="blade b1" cx="155" cy="76" rx="9" ry="4.5" transform="rotate(-35 155 76)" />
        <ellipse className="blade b2" cx="86" cy="114" rx="9" ry="4.5" transform="rotate(-55 86 114)" />
        <ellipse className="blade b3" cx="120" cy="72" rx="9" ry="4.5" transform="rotate(30 120 72)" />
      </svg>
      <div className="estate-body">
        <div className="eyebrow light">The estate</div>
        <h3>Twelve acres, grown with care</h3>
        <div className="estate-stats">
          {STATS.map((s) => (
            <div key={s.label}>
              <b><CountUp to={s.to} suffix={s.suffix} /></b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="page-scroll">
      <HeroCarousel />

      <section className="welcome">
        <Reveal>
          <div className="eyebrow">Welcome to</div>
          <h2>Serenity Gardens</h2>
          <p>
            A working farmhouse that grows organic produce, keeps fish ponds, and opens its doors to
            visitors looking for calm among the greenery.
          </p>
          <button className="btn btn-gradient btn-inline" onClick={() => navigate('/about')}>
            Our story <Icon name="arrow-right" size={18} />
          </button>
        </Reveal>
      </section>

      <div className="marquee">
        <div className="marquee-inner">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">{item}<i /></span>
          ))}
        </div>
      </div>

      <section className="features">
        <SectionHead eyebrow="Explore" title="Everything we offer" />
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <button className="feature-card" style={{ backgroundImage: `url(${f.image})` }} onClick={() => navigate(f.route)}>
                <span className="feature-shade" />
                <span className="feature-text">
                  <span className="feature-title">{f.title}</span>
                  <span className="feature-sub">{f.subtitle}</span>
                </span>
                <span className="feature-go"><Icon name="arrow-right" size={16} /></span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal><EstateBanner /></Reveal>
      <div style={{ height: 24 }} />
    </div>
  );
}
