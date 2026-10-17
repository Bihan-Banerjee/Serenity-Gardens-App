import { useEffect, useState } from 'react';

/** Shows a reassurance message once a request has been pending for a while (server cold start). */
export function SlowNote({ after = 4000 }: { after?: number }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), after);
    return () => clearTimeout(t);
  }, [after]);
  if (!slow) return null;
  return (
    <div className="slow-note fade-up" role="status">
      <span className="dots"><i /><i /><i /></span>
      <div>
        <b>Waking up the server</b>
        <span>It sleeps when idle, so the first load can take up to a minute.</span>
      </div>
    </div>
  );
}

/** Branded loader: a sprout that draws itself, with the slow-start note underneath. */
export function Loader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="loader" role="status" aria-label={label}>
      <svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
        <circle className="loader-ring" cx="40" cy="40" r="34" pathLength={1} />
        <path className="loader-stem" d="M40 60V38" pathLength={1} />
        <path className="loader-leaf l" d="M40 44C30 44 24 38 24 29c9 0 16 5 16 15z" />
        <path className="loader-leaf r" d="M40 38C40 28 47 22 57 22c0 10-7 16-17 16z" />
      </svg>
      <span className="loader-label">{label}</span>
      <SlowNote />
    </div>
  );
}
