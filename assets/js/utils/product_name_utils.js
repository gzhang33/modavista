export function get_base_name(name) {
  if (!name) return '';
  let base = String(name).trim();
  base = base
    .replace(/\s*\([^)]+\)\s*$/i, '')
    .replace(/\s*-\s*[^-|()]+$/i, '')
    .replace(/\s*\|\s*[^-|()]+$/i, '')
    .trim();
  return base.toLowerCase();
}

export function extract_color_label(name) {
  if (!name) return '';
  const str = String(name);
  const by_paren = str.match(/\(([^)]+)\)\s*$/);
  if (by_paren && by_paren[1]) return by_paren[1].trim();
  const by_dash = str.match(/-\s*([^-|()]+)\s*$/);
  if (by_dash && by_dash[1]) return by_dash[1].trim();
  const by_pipe = str.match(/\|\s*([^-|()]+)\s*$/);
  if (by_pipe && by_pipe[1]) return by_pipe[1].trim();
  return '';
}

export function color_name_to_hex(color_name) {
  if (!color_name) return null;
  const map = {
    black: '#000000', white: '#ffffff', red: '#d0021b', blue: '#2f80ed', green: '#219653', yellow: '#f2c94c', orange: '#f2994a', pink: '#ff7eb6', purple: '#9b51e0', brown: '#8d6e63', gray: '#828282', grey: '#828282', beige: '#f5f5dc', khaki: '#c3b091', navy: '#001f3f', charcoal: '#36454f', silver: '#c0c0c0', gold: '#ffd700'
  };
  const key = String(color_name).toLowerCase();
  return map[key] || null;
}


