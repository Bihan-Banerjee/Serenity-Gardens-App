import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HERO_IMAGES = [
  'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.171_rsdmwn.jpg',
  'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638885/WhatsApp_Image_2025-12-05_at_11.42.50_lh3or7.jpg',
  'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638884/WhatsApp_Image_2025-12-05_at_11.20.16_xhcfgq.jpg',
  'https://res.cloudinary.com/drj7t97rd/image/upload/v1766638883/WhatsApp_Image_2025-12-05_at_10.43.551_x2y2k6.jpg',
];

const FEATURES = [
  { emoji: '🌱', title: 'Explore', subtitle: 'Flora & Fauna', route: '/explore', color: '#D4EDDA' },
  { emoji: '🖼️', title: 'Gallery', subtitle: 'Curated Moments', route: '/gallery', color: '#D1E8F7' },
  { emoji: '🛒', title: 'Shop', subtitle: 'Fresh From Farm', route: '/menu', color: '#FFF3CD' },
  { emoji: '⭐', title: 'Reviews', subtitle: 'Our Guests Say', route: '/reviews', color: '#F8D7DA' },
  { emoji: '🏡', title: 'About Us', subtitle: 'Our Story', route: '/about', color: '#E2D9F3' },
  { emoji: '👤', title: 'Your Profile', subtitle: 'View account history', route: '/profile', color: '#D4EDDA' },
];

const MARQUEE_ITEMS = [
  '🌿 Organic Farming', '🐟 Pisciculture', '🌸 Seasonal Flowers', '🥬 Fresh Vegetables',
  '🌳 100+ Tree Species', '🦋 Wildlife Habitat', '☀️ Solar Powered', '💧 Rainwater Harvesting',
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
        onScroll={(e) => {
          const el = e.currentTarget;
          setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {HERO_IMAGES.map((src) => (
          <div key={src} className="hero-slide" style={{ backgroundImage: `url(${src})` }}>
            <div className="hero-shade" />
          </div>
        ))}
      </div>
      <div className="hero-text fade-up">
        <div className="hero-title">Serenity</div>
        <div className="hero-title accent">Gardens</div>
        <p>A tranquil farmhouse retreat — nature, nourishment &amp; peace</p>
      </div>
      <div className="hero-dots">
        {HERO_IMAGES.map((_, i) => <span key={i} className={i === active ? 'on' : ''} />)}
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
        <div className="eyebrow">Welcome to</div>
        <h2>Your Green Sanctuary</h2>
        <p>
          Nestled in nature, Serenity Gardens is a working farmhouse that grows organic produce, houses
          pisciculture ponds, and opens its doors to visitors seeking calm amidst greenery.
        </p>
        <button className="btn btn-gradient btn-inline" onClick={() => navigate('/about')}>
          Discover Our Story →
        </button>
      </section>

      <div className="marquee">
        <div className="marquee-inner">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">{item}<i>·</i></span>
          ))}
        </div>
      </div>

      <section className="features">
        <div className="eyebrow">Explore</div>
        <h2 className="section-title">Everything We Offer</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <button
              key={f.title}
              className="feature-card fade-up"
              style={{ background: f.color, animationDelay: `${300 + i * 80}ms` }}
              onClick={() => navigate(f.route)}
            >
              <span className="feature-emoji">{f.emoji}</span>
              <span className="feature-title">{f.title}</span>
              <span className="feature-sub">{f.subtitle}</span>
              <span className="feature-arrow">→</span>
            </button>
          ))}
        </div>
      </section>

      <div className="quote-banner">
        <p>"In every walk with nature, one receives far more than he seeks."</p>
        <span>— John Muir</span>
      </div>
    </div>
  );
}
