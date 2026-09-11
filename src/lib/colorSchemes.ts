export interface ColorScheme {
  id: string
  name: string
  description: string
  // Text color that reads clearly on top of the 500 shade (used for primary
  // buttons and other solid-brand-color surfaces) — varies because some
  // schemes' mid shade is light (gold, platinum) and some are dark (emerald,
  // sapphire), so a single fixed choice wouldn't work across all five.
  contrastText: 'black' | 'white'
  scale: Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950', string>
}

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'champagne-gold',
    name: 'Champagne Gold',
    description: 'Warm gold on black — classic, high-end editorial.',
    contrastText: 'black',
    scale: {
      '50': '#fdf8ed', '100': '#faefd3', '200': '#f3dba0', '300': '#e9c06c', '400': '#dca83f',
      '500': '#c8912a', '600': '#a8741f', '700': '#85591b', '800': '#634219', '900': '#453017', '950': '#2a1c0d',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Blush rose-gold on black — softer, contemporary luxury.',
    contrastText: 'white',
    scale: {
      '50': '#fdf3f0', '100': '#fae3dc', '200': '#f4c6b8', '300': '#eba28e', '400': '#e08069',
      '500': '#d1674f', '600': '#b04f3a', '700': '#8c3d2d', '800': '#692e22', '900': '#4a2119', '950': '#2e140f',
    },
  },
  {
    id: 'platinum-silver',
    name: 'Platinum Silver',
    description: 'Sleek metallic silver on black — minimalist, modern.',
    contrastText: 'black',
    scale: {
      '50': '#f8f9fa', '100': '#eef0f2', '200': '#dbdfe3', '300': '#c3c9cf', '400': '#a5adb5',
      '500': '#8c959e', '600': '#707982', '700': '#586068', '800': '#41474e', '900': '#2e3338', '950': '#1c1f22',
    },
  },
  {
    id: 'emerald-noir',
    name: 'Emerald Noir',
    description: 'Deep emerald on black — rich, exclusive, statement.',
    contrastText: 'white',
    scale: {
      '50': '#edfaf4', '100': '#d1f0e0', '200': '#a3e0c1', '300': '#6cc99d', '400': '#3fae7a',
      '500': '#1b8a59', '600': '#146e46', '700': '#125739', '800': '#11422d', '900': '#0f2f21', '950': '#081c14',
    },
  },
  {
    id: 'sapphire-midnight',
    name: 'Sapphire Midnight',
    description: 'Deep sapphire blue on black — bold, premium, confident.',
    contrastText: 'white',
    scale: {
      '50': '#edf3fd', '100': '#d5e3fa', '200': '#abc7f3', '300': '#769fe7', '400': '#4a7ad8',
      '500': '#2a59bd', '600': '#1e4498', '700': '#1b3677', '800': '#192a58', '900': '#16203e', '950': '#0d1326',
    },
  },
]

export const DEFAULT_COLOR_SCHEME = 'champagne-gold'

export function getColorScheme(id: string | null | undefined): ColorScheme {
  return COLOR_SCHEMES.find(s => s.id === id) ?? COLOR_SCHEMES[0]
}

function hexToRgbTriple(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

/** CSS text for a <style> tag defining the chosen scheme's shades as CSS custom properties. */
export function buildThemeCss(scheme: ColorScheme): string {
  const vars = (Object.entries(scheme.scale) as [string, string][])
    .map(([step, hex]) => `--brand-${step}: ${hexToRgbTriple(hex)};`)
    .join(' ')
  const contrast = scheme.contrastText === 'black' ? '0 0 0' : '255 255 255'
  return `:root { ${vars} --brand-contrast: ${contrast}; }`
}
