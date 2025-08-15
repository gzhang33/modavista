// Map utilities for building provider links and sanitizing phone numbers
// Admin can switch provider via window.MAP_PROVIDER = 'google' | 'apple' | 'bing' | 'baidu'

const DEFAULT_MAP_PROVIDER = 'google';

function get_map_provider() {
  const provider = (window.MAP_PROVIDER || DEFAULT_MAP_PROVIDER).toLowerCase();
  const allowed = ['google', 'apple', 'bing', 'baidu', 'openstreetmap'];
  return allowed.includes(provider) ? provider : DEFAULT_MAP_PROVIDER;
}

function set_map_provider(provider) {
  window.MAP_PROVIDER = provider;
}

function encode_address(address_text) {
  return encodeURIComponent(address_text.trim());
}

function build_map_link(address_text) {
  const provider = get_map_provider();
  const query = encode_address(address_text);
  switch (provider) {
    case 'apple':
      return `https://maps.apple.com/?q=${query}`;
    case 'bing':
      return `https://www.bing.com/maps?q=${query}`;
    case 'baidu':
      return `https://map.baidu.com/search/${query}`;
    case 'openstreetmap':
      return `https://www.openstreetmap.org/search?query=${query}`;
    case 'google':
    default:
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
}

function sanitize_phone_href(raw_text) {
  // keep leading + and digits; remove spaces, dashes, parentheses
  const normalized = raw_text.replace(/[^+\d]/g, '');
  return `tel:${normalized}`;
}

export { get_map_provider, set_map_provider, build_map_link, sanitize_phone_href };


