/** Inline placeholder so a dead third-party placeholder service can't break product images. */
export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='150' height='150' fill='#E8E0D2'/><text x='75' y='88' font-size='56' text-anchor='middle'>🌿</text></svg>"
  );

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
