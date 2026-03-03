function stripAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Maps raw province strings from Urbanitae data to canonical GeoJSON names
const PROVINCE_NORMALIZE = {
  // Direct matches (accented versions match GeoJSON already)
  'Madrid': 'Madrid',
  'Málaga': 'Málaga',
  'Malaga': 'Málaga',
  'Islas Baleares': 'Illes Balears',
  'Valencia': 'València/Valencia',
  'Barcelona': 'Barcelona',
  'Cádiz': 'Cádiz',
  'Alicante': 'Alacant/Alicante',
  'Zaragoza': 'Zaragoza',
  'Lisboa': 'Lisboa',
  'Huelva': 'Huelva',
  'Sevilla': 'Sevilla',
  'Vizcaya': 'Bizkaia',
  'Burgos': 'Burgos',
  'Oporto': 'Porto',
  'Porto': 'Porto',
  'Cantabria': 'Cantabria',
  'Tarragona': 'Tarragona',
  'Pontevedra': 'Pontevedra',
  'Las Palmas': 'Las Palmas',
  'Granada': 'Granada',
  'Lleida': 'Lleida',
  'Valladolid': 'Valladolid',
  'Álava': 'Araba/Álava',
  'Ourense': 'Ourense',
  'Huesca': 'Huesca',
  'Castellón': 'Castelló/Castellón',
  'Badajoz': 'Badajoz',

  // City-as-province corrections
  'Marbella': 'Málaga',
  'Ibiza': 'Illes Balears',
  'Menorca': 'Illes Balears',
  'Vilanova i la Geltrú': 'Barcelona',
  'San Pedro de Alcántara': 'Málaga',
  'Estepona': 'Málaga',

  // Zip-code prefixed
  '28043 Madrid': 'Madrid',
  '47007 Valladolid': 'Valladolid',

  // Autonomous communities → province (when unambiguous)
  'Aragón': 'Zaragoza',
  'Comunidad Valencia': 'València/Valencia',
  'Comunidad Valenciana': 'València/Valencia',

  // Non-Iberian → null (excluded)
  'Lombardía': null,
  'Lucca': null,
  'Ile de France': null,
};

// For ambiguous autonomous communities, resolve by looking at the city
const COMMUNITY_CITY_MAP = {
  'Andalucía': {
    'Málaga': 'Málaga', 'Córdoba': 'Córdoba', 'Sevilla': 'Sevilla',
    'Cadiz': 'Cádiz', 'Cádiz': 'Cádiz',
  },
  'Andalucia': {
    'Málaga': 'Málaga', 'Córdoba': 'Córdoba', 'Sevilla': 'Sevilla',
    'Cadiz': 'Cádiz', 'Cádiz': 'Cádiz',
  },
  'Castilla y León': {
    'La Cistérniga': 'Valladolid', 'Valladolid': 'Valladolid', 'Burgos': 'Burgos',
  },
  'Cataluña': {
    'Sabadell': 'Barcelona', 'Barcelona': 'Barcelona',
  },
  'Canarias': {
    'Puerto de la Cruz': 'Santa Cruz de Tenerife',
  },
};

export function extractUrbanitaeProvince(project) {
  const location = (project.location || '').trim();
  if (!location) return null;

  const parts = location.split(',').map(s => s.trim());
  const rawProvince = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const city = parts[0];

  // Check community-level resolution first
  if (COMMUNITY_CITY_MAP[rawProvince]) {
    return COMMUNITY_CITY_MAP[rawProvince][city] || null;
  }

  // Direct lookup
  if (rawProvince in PROVINCE_NORMALIZE) {
    return PROVINCE_NORMALIZE[rawProvince];
  }

  // Fallback: return as-is (might match GeoJSON via accent-insensitive matching)
  return rawProvince;
}

// WeCity city → GeoJSON province name
const SPAIN_CITY_TO_PROVINCE = {
  'Madrid': 'Madrid',
  'Marbella': 'Málaga',
  'Valencia': 'València/Valencia',
  'Barcelona': 'Barcelona',
  'Málaga': 'Málaga',
  'Malaga': 'Málaga',
  'Alicante': 'Alacant/Alicante',
  'Murcia': 'Murcia',
  'Sevilla': 'Sevilla',
  'Cádiz': 'Cádiz',
  'Cadiz': 'Cádiz',
  'Mallorca': 'Illes Balears',
  'Ibiza': 'Illes Balears',
  'Menorca': 'Illes Balears',
  'Guadalajara': 'Guadalajara',
  'Tenerife': 'Santa Cruz de Tenerife',
  'Vizcaya': 'Bizkaia',
  'Tarragona': 'Tarragona',
  'Oviedo': 'Asturias',
  'Granada': 'Granada',
  'Valladolid': 'Valladolid',
  'Estepona': 'Málaga',
};

const PORTUGAL_CITY_TO_DISTRICT = {
  'Oporto': 'Porto',
  'Lisboa': 'Lisboa',
  'Madeira': 'Ilha da Madeira',
  'Alentejo': 'Évora',
  'Figueira da Foz': 'Coimbra',
  'Aveiro': 'Aveiro',
  'Torres Vedras': 'Lisboa',
};

export function extractWecityProvince(project) {
  const city = (project.ciudad || '').trim();
  const country = (project.pais || '').trim();
  if (!city) return null;

  if (country === 'Portugal') {
    return PORTUGAL_CITY_TO_DISTRICT[city] || null;
  }
  return SPAIN_CITY_TO_PROVINCE[city] || null;
}

// Match a canonical province name to a GeoJSON feature name (accent-insensitive)
export function matchGeoName(canonicalName, geoName) {
  if (!canonicalName || !geoName) return false;
  return stripAccents(canonicalName.toLowerCase()) === stripAccents(geoName.toLowerCase());
}

// Build a lookup key from a GeoJSON name (stripped of accents, lowered)
export function geoKey(name) {
  return stripAccents(name || '').toLowerCase();
}
