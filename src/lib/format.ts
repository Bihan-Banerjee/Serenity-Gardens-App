/** Inline placeholder so a dead third-party placeholder service can't break product images. */
export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='150' height='150' fill='#E8E0D2'/><path d='M105 45C70 45 48 63 48 90c0 6 1 11 4 15 4-4 7-7 14-10 23 0 39-22 39-50zM53 105c11-23 25-38 43-48' fill='none' stroke='#7A9B72' stroke-width='5' stroke-linecap='round'/></svg>"
  );

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
