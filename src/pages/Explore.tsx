import { useState } from 'react';
import { ITEMS } from '../data/explore';
import type { Category } from '../data/explore';

const CATEGORIES: Category[] = ['All', 'Flora', 'Fauna', 'Ponds', 'Farm'];
const CATEGORY_EMOJI: Record<Category, string> = {
  All: '🌍', Flora: '🌱', Fauna: '🦋', Ponds: '💧', Farm: '🚜',
};

export default function Explore() {
  const [active, setActive] = useState<Category>('All');
  const filtered = active === 'All' ? ITEMS : ITEMS.filter((i) => i.category === active);

  return (
    <div className="screen">
      <header className="screen-header fade-up">
        <div className="eyebrow">Serenity Gardens</div>
        <h1>Explore the Estate</h1>
      </header>

      <div className="chips">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`chip ${active === cat ? 'on' : ''}`} onClick={() => setActive(cat)}>
            <span>{CATEGORY_EMOJI[cat]}</span> {cat}
          </button>
        ))}
      </div>

      <div className="screen-scroll">
        <div className="explore-grid">
          {filtered.map((item, i) => (
            <article key={item.id} className="explore-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <img src={item.image} alt={item.name} loading="lazy" />
              <div className="explore-shade" />
              <div className="explore-content">
                {item.highlight && <span className="highlight">{item.highlight}</span>}
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
