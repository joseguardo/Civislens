import { readFileSync, writeFileSync } from 'fs';
import { utils, write } from 'xlsx';

// --- Load raw data ---
const urbanitaeRaw = JSON.parse(
  readFileSync(new URL('./src/data/projects.json', import.meta.url), 'utf-8')
);
const wecityRaw = JSON.parse(
  readFileSync(
    new URL('./src/data/wecity_oportunidades_financiadas.json', import.meta.url),
    'utf-8'
  )
);

// ===================== URBANITAE =====================
const urbanitaeRows = urbanitaeRaw.map((p) => ({
  ID: p.id,
  Proyecto: p.project,
  Ubicación: p.location,
  Dirección: p.address,
  Promotor: p.developer,
  Estado: p.status,
  Tipo: p.type,
  'Financiado (€)': p.funded_eur,
  Inversores: p.investors,
  'Plazo inversión (meses)': p.investment_term,
  'Rentabilidad (%)': p.return_pct,
  'Tipo rentabilidad': p.return_type,
  'Tipo inversión': p.investment_type,
  'Modelo negocio': p.business_model,
  'Fecha financiación': p.funded_date,
  'Fecha creación': p.creation_date,
  'Inicio financiación': p.fund_start_date,
  'Fin financiación': p.fund_end_date,
  'Capital empresa (€)': p.company_capital,
  'TIR obtenida': p.obtained_tir,
  'Rentabilidad obtenida': p.obtained_rentability,
  'País fiscal': p.fiscal_country,
}));

const urbanitaeSheet = utils.json_to_sheet(urbanitaeRows);

// Auto-size columns
const urbanitaeCols = Object.keys(urbanitaeRows[0]).map((key) => {
  const maxLen = Math.max(
    key.length,
    ...urbanitaeRows.map((r) => String(r[key] ?? '').length)
  );
  return { wch: Math.min(maxLen + 2, 40) };
});
urbanitaeSheet['!cols'] = urbanitaeCols;

// ===================== WECITY =====================
function parseCurrency(str) {
  if (!str) return null;
  return Number(str.replace(/[.€\s]/g, '').replace(',', '.')) || null;
}
function parsePercent(str) {
  if (!str) return null;
  return Number(str.replace('%', '').replace(',', '.')) || null;
}

const wecityRows = wecityRaw.oportunidades.map((o) => ({
  Nombre: o.nombre,
  Ciudad: o.ciudad,
  País: o.pais,
  Estado: o.estado,
  'Tipo inversión': o.tipo_inversion,
  'Tipo inmueble': o.tipo_inmueble,
  Rating: o.rating,
  'Garantía': o.garantia_descripcion,
  'Código garantía': o.garantia_codigo,
  'Financiado (€)': parseCurrency(o.financiado),
  'Plazo estimado': o.plazo_estimado,
  'Rentabilidad anual (%)': parsePercent(o.rentabilidad_anual),
  'Rentabilidad total (%)': parsePercent(o.rentabilidad_total),
  'Nº inversiones': o.num_inversiones,
  'Fecha publicación': o.published_date,
  'Última modificación': o.last_modified,
  URL: o.url,
}));

const wecitySheet = utils.json_to_sheet(wecityRows);

const wecityCols = Object.keys(wecityRows[0]).map((key) => {
  const maxLen = Math.max(
    key.length,
    ...wecityRows.map((r) => String(r[key] ?? '').length)
  );
  return { wch: Math.min(maxLen + 2, 50) };
});
wecitySheet['!cols'] = wecityCols;

// ===================== WRITE FILES =====================
// Urbanitae workbook
const urbanitaeWb = utils.book_new();
utils.book_append_sheet(urbanitaeWb, urbanitaeSheet, 'Urbanitae');
const urbanitaeBuf = write(urbanitaeWb, { type: 'buffer', bookType: 'xlsx' });
writeFileSync(new URL('../urbanitae_projects.xlsx', import.meta.url), urbanitaeBuf);

// WeCity workbook
const wecityWb = utils.book_new();
utils.book_append_sheet(wecityWb, wecitySheet, 'WeCity');
const wecityBuf = write(wecityWb, { type: 'buffer', bookType: 'xlsx' });
writeFileSync(new URL('../wecity_projects.xlsx', import.meta.url), wecityBuf);

// Combined workbook
const combinedWb = utils.book_new();
utils.book_append_sheet(combinedWb, urbanitaeSheet, 'Urbanitae');
utils.book_append_sheet(combinedWb, wecitySheet, 'WeCity');
const combinedBuf = write(combinedWb, { type: 'buffer', bookType: 'xlsx' });
writeFileSync(new URL('../civislens_all_data.xlsx', import.meta.url), combinedBuf);

console.log('Excel files generated:');
console.log(`  - urbanitae_projects.xlsx   (${urbanitaeRows.length} projects)`);
console.log(`  - wecity_projects.xlsx      (${wecityRows.length} opportunities)`);
console.log(`  - civislens_all_data.xlsx   (combined, 2 sheets)`);
