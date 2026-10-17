import { useState } from 'react';
import { GALLERY_ITEMS } from '../data/gallery';
import type { GalleryItem } from '../data/gallery';

const leftCol = GALLERY_ITEMS.filter((_, i) => i % 2 === 0);
const rightCol = GALLERY_ITEMS.filter((_, i) => i % 2 !== 0);

export default function Gallery() {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const column = (items: GalleryItem[], offset: number) => (
    <div className="masonry-col">
      {items.map((item, i) => (
        <button
          key={item.id}
          className="tile fade-up"
          style={{ height: item.height, animationDelay: `${i * 80 + offset}ms` }}
          onClick={() => setSelected(item)}
        >
          <img src={item.uri} alt={item.label} loading="lazy" />
          <span className="tile-shade"><b>{item.label}</b></span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="screen">
      <header className="screen-header">
        <div className="eyebrow">Serenity Gardens</div>
        <h1>Photo Gallery</h1>
        <p className="muted">Moments captured across the estate</p>
      </header>

      <div className="screen-scroll">
        <div className="masonry">
          {column(leftCol, 0)}
          {column(rightCol, 40)}
        </div>
      </div>

      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <div className="lightbox-card pop-in">
            <img src={selected.uri} alt={selected.label} />
            <div className="lightbox-caption">
              <h3>{selected.label}</h3>
              <span>Tap to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
