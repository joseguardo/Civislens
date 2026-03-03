/**
 * Parse WeCity string-formatted data into usable numbers
 */

export function parseAmount(str) {
  if (!str) return null;
  // "1.300.000€" → 1300000
  const cleaned = str.replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function parsePercent(str) {
  if (!str || str === 'Ver escenarios') return null;
  // "11,50%" → 11.5
  const cleaned = str.replace('%', '').replace(',', '.').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function parseTerm(str) {
  if (!str) return null;
  // "18 meses" → 18
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function parseWecityProjects(rawData) {
  const oportunidades = rawData.oportunidades || [];
  return oportunidades.map((p, index) => ({
    ...p,
    _id: `wc-${index}`,
    _financiado: parseAmount(p.financiado),
    _rentabilidad_anual: parsePercent(p.rentabilidad_anual),
    _rentabilidad_total: parsePercent(p.rentabilidad_total),
    _plazo: parseTerm(p.plazo_estimado),
  }));
}
