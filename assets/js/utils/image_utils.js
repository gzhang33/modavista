export function build_image_src(path) {
  if (!path) return '/images/placeholder.svg';
  const s = String(path);
  if (/^https?:\/\//i.test(s)) return s; // keep absolute URLs from WordPress
  return s.startsWith('/') ? s : `/${s}`;
}


