export function positiveBarWidth(value: number, maximum: number): number {
  if (!Number.isFinite(value) || value <= 0 || maximum <= 0) return 0;
  return Math.min(100, (value / maximum) * 100);
}

export interface SignedBarGeometry {
  start: number;
  width: number;
  zero: number;
}

export function signedBarGeometry(value: number, minimum: number, maximum: number): SignedBarGeometry {
  const domainMinimum = Math.min(0, Number.isFinite(minimum) ? minimum : 0);
  const domainMaximum = Math.max(0, Number.isFinite(maximum) ? maximum : 0);
  const span = domainMaximum - domainMinimum;
  if (!Number.isFinite(value) || span <= 0) return { start: 0, width: 0, zero: 0 };

  const zero = ((0 - domainMinimum) / span) * 100;
  const position = ((Math.min(domainMaximum, Math.max(domainMinimum, value)) - domainMinimum) / span) * 100;
  return { start: Math.min(zero, position), width: Math.abs(position - zero), zero };
}
