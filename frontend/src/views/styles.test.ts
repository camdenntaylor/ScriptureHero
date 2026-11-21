import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
const palettes = [...css.matchAll(/(?:^:root|:root\[data-theme="evening"\]|:root:not\(\[data-theme="day"\]\))\s*\{([^}]+)\}/gm)]
  .map(match => Object.fromEntries([...match[1]!.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(token => [token[1], token[2]!]))) as Record<string, string>[];

function luminance(hex: string) {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

describe('theme contrast', () => {
  it.each(['day', 'evening', 'system evening'])('%s keeps reading text and controls distinguishable', mode => {
    const palette = palettes[['day', 'evening', 'system evening'].indexOf(mode)]!;
    const pairs: [string, string, number][] = [
      ['ink', 'paper', 4.5], ['ink', 'surface', 4.5],
      ['muted', 'paper', 4.5], ['muted', 'surface', 4.5],
      ['accent-strong', 'accent-soft', 4.5], ['on-accent', 'accent', 4.5],
      ['warm', 'warm-soft', 4.5], ['warm-strong', 'warm-soft', 4.5],
      ['danger', 'danger-soft', 4.5], ['control-line', 'surface', 3],
      ['control-line', 'paper', 3], ['accent', 'surface', 3], ['accent', 'accent-soft', 3],
    ];
    for (const [foreground, background, minimum] of pairs) {
      const values = [luminance(palette[foreground]!), luminance(palette[background]!)].sort((a, b) => b - a);
      expect((values[0]! + 0.05) / (values[1]! + 0.05), `${foreground} on ${background}`).toBeGreaterThanOrEqual(minimum);
    }
  });
});
