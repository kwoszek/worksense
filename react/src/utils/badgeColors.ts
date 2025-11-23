// Deterministic badge gradient generator and presets for known badges
function hashStringToHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

export function badgeGradientStyle(key: string | undefined) {
  if (!key) return undefined;
  // Known explicit palettes
  switch (key) {
    case 'streak':
      return { backgroundImage: 'linear-gradient(90deg, #f97316 0%, #fb7185 100%)', color: '#fff' };
    case 'posts':
      return { backgroundImage: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)', color: '#fff' };
    case 'comments':
      return { backgroundImage: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)', color: '#fff' };
    case 'best_link':
      return { backgroundImage: 'linear-gradient(90deg, #f59e0b 0%, #8b5cf6 100%)', color: '#fff' };
    case 'best_comment':
      return { backgroundImage: 'linear-gradient(90deg, #f43f5e 0%, #7c3aed 100%)', color: '#fff' };
    case 'lookout':
      return { backgroundImage: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)', color: '#fff' };
    case 'outstanding':
      return { backgroundImage: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)', color: '#fff' };
    case 'account_age':
      return { backgroundImage: 'linear-gradient(90deg, #cfeef8 0%, #9be7d6 100%)', color: '#064e3b' };
    default: {
      // Deterministic generated gradient based on key hash
      const hue = hashStringToHue(key);
      const hue2 = (hue + 50) % 360;
      const col1 = `hsl(${hue}deg 85% 55%)`;
      const col2 = `hsl(${hue2}deg 75% 50%)`;
      return { backgroundImage: `linear-gradient(90deg, ${col1} 0%, ${col2} 100%)`, color: '#fff' };
    }
  }
}

export default badgeGradientStyle;
