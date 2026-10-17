import { useCallback, useEffect, useRef, useState } from 'react';
import { reviewsAPI } from '../lib/api';
import { Alert } from '../lib/dialog';
import { formatDate } from '../lib/format';
import { useAuthStore } from '../store/useAuthStore';
import Icon from '../components/Icon';
import { SectionHead } from '../components/Motion';
import { readCache, writeCache } from '../lib/cache';
import { SEED } from '../data/reviews';
import type { Review } from '../data/reviews';

const CARD_W = 276; // 260px card + 16px gap

function Marquee({ reviews }: { reviews: Review[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    if (!reviews.length) return;
    const timer = setInterval(() => {
      const el = ref.current;
      if (!el || paused.current) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + CARD_W, behavior: 'smooth' });
    }, 2500);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (!reviews.length) return null;
  return (
    <div
      className="marquee-reviews"
      ref={ref}
      onTouchStart={() => { paused.current = true; }}
      onTouchEnd={() => { setTimeout(() => { paused.current = false; }, 3000); }}
    >
      {reviews.map((r, i) => (
        <div key={r._id ?? i} className="mq-card">
          <div className="stars">
            {[0, 1, 2, 3, 4].map((s) => <span key={s} className={s < r.rating ? 'on' : ''}>★</span>)}
          </div>
          <p className="mq-msg">"{r.review}"</p>
          <div className="mq-foot">
            <span className="avatar">{r.name[0]?.toUpperCase()}</span>
            <b>{r.name}</b>
          </div>
        </div>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((s) => (
        <button type="button" key={s} className={s <= value ? 'on' : ''} onClick={() => onChange(s)} aria-label={`${s} stars`}>★</button>
      ))}
    </div>
  );
}

function ReviewCard({ r, idx }: { r: Review; idx: number }) {
  return (
    <div className="card review-card fade-up" style={{ animationDelay: `${Math.min(idx, 10) * 70}ms` }}>
      <div className="review-head">
        <span className="avatar">{r.name[0]?.toUpperCase()}</span>
        <div className="grow">
          <b>{r.name}</b>
          {r.createdAt && <div className="muted small">{formatDate(r.createdAt)}</div>}
        </div>
        <span className="rating-badge">{'★'.repeat(r.rating)}</span>
      </div>
      <p>"{r.review}"</p>
    </div>
  );
}

export default function Reviews() {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState<Review[]>(() => { const c = readCache<Review[]>('reviews'); return c?.length ? [...c, ...SEED] : SEED; });
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = useCallback(() => {
    reviewsAPI
      .getAll()
      .then((res) => {
        if (res.data?.length) {
          writeCache('reviews', res.data);
          setReviews([...res.data, ...SEED]);
        }
      })
      .catch(() => { /* keep whatever is already showing */ });
  }, []);

  useEffect(fetchReviews, [fetchReviews]);

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) return Alert.alert('Missing Fields', 'Please enter your name and review.');
    if (message.trim().length < 10) return Alert.alert('Too Short', 'Write at least 10 characters.');
    try {
      setSubmitting(true);
      await reviewsAPI.create({ name: name.trim(), review: message.trim(), rating });
      setSubmitted(true);
      setMessage('');
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      Alert.alert('Failed', err.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  return (
    <div>
      <div className="banner">
        <h2>Guest reviews</h2>
        <p>What visitors say about Serenity Gardens</p>
        <div className="banner-stats">
          {[
            { label: 'Reviews', value: reviews.length },
            { label: 'Avg Rating', value: `${avg} ★` },
            { label: '5-Star', value: reviews.filter((r) => r.rating === 5).length },
          ].map((s) => (
            <div key={s.label}><b>{s.value}</b><span>{s.label}</span></div>
          ))}
        </div>
      </div>

      <Marquee reviews={reviews} />

      <section className="pad-x">
        <SectionHead eyebrow="Share your experience" title="Leave a review" />
        {submitted ? (
          <div className="card center success-box">
            <Icon name="check" size={40} className="empty-icon" />
            <h3>Thank you!</h3>
            <p className="muted">Your review was submitted successfully.</p>
            <button className="link-btn" onClick={() => setSubmitted(false)}>Write another</button>
          </div>
        ) : (
          <div className="card form">
            <label>Your name</label>
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <label>Rating</label>
            <StarPicker value={rating} onChange={setRating} />
            <label>Your review</label>
            <textarea rows={5} placeholder="Tell us about your visit or order..." value={message} onChange={(e) => setMessage(e.target.value)} />
            <button className="btn btn-gradient" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <span className="spinner small" /> : 'Submit review'}
            </button>
          </div>
        )}
      </section>

      <section className="pad-x">
        <SectionHead eyebrow="What people say" title="All reviews" />
        {reviews.map((r, i) => <ReviewCard key={r._id ?? i} r={r} idx={i} />)}
      </section>
      <div style={{ height: 32 }} />
    </div>
  );
}
