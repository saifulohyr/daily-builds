export function luminance(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error("Use #RRGGBB");
  const rgb = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const linear = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function contrastRatio(foreground, background) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

export function wcag(ratio) {
  return { normalAA: ratio >= 4.5, normalAAA: ratio >= 7, largeAA: ratio >= 3, largeAAA: ratio >= 4.5 };
}
