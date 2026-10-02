// All 22 colorful and neutral built-in Tailwind colors
export const TAILWIND_COLORS = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

export const TAILWIND_COLOR_PALETTES = {
  slate: { primary: '#0f172a', foreground: '#ffffff' },
  gray: { primary: '#111827', foreground: '#ffffff' },
  zinc: { primary: '#18181b', foreground: '#ffffff' },
  neutral: { primary: '#171717', foreground: '#ffffff' },
  stone: { primary: '#1c1917', foreground: '#ffffff' },
  red: { primary: '#ef4444', foreground: '#ffffff' },
  orange: { primary: '#f97316', foreground: '#ffffff' },
  amber: { primary: '#f59e0b', foreground: '#000000' },
  yellow: { primary: '#eab308', foreground: '#000000' },
  lime: { primary: '#84cc16', foreground: '#000000' },
  green: { primary: '#22c55e', foreground: '#ffffff' },
  emerald: { primary: '#10b981', foreground: '#ffffff' },
  teal: { primary: '#14b8a6', foreground: '#ffffff' },
  cyan: { primary: '#06b6d4', foreground: '#ffffff' },
  sky: { primary: '#0ea5e9', foreground: '#ffffff' },
  blue: { primary: '#2563eb', foreground: '#ffffff' },
  indigo: { primary: '#6366f1', foreground: '#ffffff' },
  violet: { primary: '#8b5cf6', foreground: '#ffffff' },
  purple: { primary: '#a855f7', foreground: '#ffffff' },
  fuchsia: { primary: '#d946ef', foreground: '#ffffff' },
  pink: { primary: '#ec4899', foreground: '#ffffff' },
  rose: { primary: '#f43f5e', foreground: '#ffffff' },
};

export function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function getContrastForeground(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#ffffff';
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 140 ? '#000000' : '#ffffff';
}

export function generateThemeCss(primaryInput) {
  const isBuiltIn = TAILWIND_COLORS.includes(primaryInput.toLowerCase());

  let primaryHex;
  let primaryForegroundHex;

  if (isBuiltIn) {
    const palette = TAILWIND_COLOR_PALETTES[primaryInput.toLowerCase()];
    primaryHex = palette.primary;
    primaryForegroundHex = palette.foreground;
  } else {
    primaryHex = primaryInput.startsWith('#') ? primaryInput : `#${primaryInput}`;
    primaryForegroundHex = getContrastForeground(primaryHex);
  }

  const rgb = hexToRgb(primaryHex) || { r: 0, g: 0, b: 0 };
  const fgRgb = hexToRgb(primaryForegroundHex) || { r: 255, g: 255, b: 255 };

  return `@layer base {
  :root {
    --primary: ${rgb.r} ${rgb.g} ${rgb.b};
    --primary-foreground: ${fgRgb.r} ${fgRgb.g} ${fgRgb.b};
    --primary-hex: ${primaryHex};
  }

  .dark {
    --primary: ${rgb.r} ${rgb.g} ${rgb.b};
    --primary-foreground: ${fgRgb.r} ${fgRgb.g} ${fgRgb.b};
    --primary-hex: ${primaryHex};
  }
}
`;
}
