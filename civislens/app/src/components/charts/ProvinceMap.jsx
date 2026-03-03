import { useState, useMemo, useRef, useCallback } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import spainTopo from '../../data/spain-provinces.json';
import portugalTopo from '../../data/portugal-districts.json';
import { geoKey } from '../../utils/provinceMapping';

const COLOR_EMPTY = '#F3F4F6';
const COLOR_MIN = '#DBEAFE';
const COLOR_MAX = '#1E40AF';
const COLOR_HOVER = '#60A5FA';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function interpolateColor(ratio) {
  const min = hexToRgb(COLOR_MIN);
  const max = hexToRgb(COLOR_MAX);
  const t = Math.pow(ratio, 0.5); // sqrt scale to spread colors
  const r = Math.round(min[0] + (max[0] - min[0]) * t);
  const g = Math.round(min[1] + (max[1] - min[1]) * t);
  const b = Math.round(min[2] + (max[2] - min[2]) * t);
  return `rgb(${r},${g},${b})`;
}

const spainFeatures = feature(spainTopo, spainTopo.objects.provinces).features;
const ptObjKey = Object.keys(portugalTopo.objects)[0];
const portugalFeatures = feature(portugalTopo, portugalTopo.objects[ptObjKey]).features;

// Build a name property accessor per feature set
function getSpainName(f) { return f.properties.name; }
function getPortugalName(f) { return f.properties.NAME_1; }

const WIDTH = 600;
const HEIGHT = 500;

const projection = geoMercator()
  .center([-4, 40])
  .scale(2200)
  .translate([WIDTH / 2, HEIGHT / 2]);

const pathGenerator = geoPath().projection(projection);

export default function ProvinceMap({ provinceData, title }) {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const dataIndex = useMemo(() => {
    const idx = {};
    Object.entries(provinceData).forEach(([name, data]) => {
      idx[geoKey(name)] = { name, ...data };
    });
    return idx;
  }, [provinceData]);

  const maxDeals = useMemo(
    () => Math.max(1, ...Object.values(provinceData).map(d => d.deals)),
    [provinceData]
  );

  const getColor = useCallback((geoName) => {
    const key = geoKey(geoName);
    const data = dataIndex[key];
    if (!data || data.deals === 0) return COLOR_EMPTY;
    return interpolateColor(data.deals / maxDeals);
  }, [dataIndex, maxDeals]);

  const handleMouseMove = useCallback((e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleEnter = useCallback((geoName) => {
    const key = geoKey(geoName);
    const data = dataIndex[key];
    setHovered({
      name: geoName,
      deals: data?.deals || 0,
      funded: data?.funded || 0,
    });
  }, [dataIndex]);

  const handleLeave = useCallback(() => setHovered(null), []);

  const renderFeatures = (features, getName) =>
    features.map((f, i) => {
      const name = getName(f);
      const d = pathGenerator(f);
      if (!d) return null;
      const isHovered = hovered?.name === name;
      return (
        <path
          key={`${name}-${i}`}
          d={d}
          fill={isHovered ? COLOR_HOVER : getColor(name)}
          stroke="#fff"
          strokeWidth={0.5}
          onMouseEnter={() => handleEnter(name)}
          onMouseLeave={handleLeave}
          onMouseMove={handleMouseMove}
          style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
        />
      );
    });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="relative" style={{ width: '100%', aspectRatio: `${WIDTH}/${HEIGHT}` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          style={{ width: '100%', height: '100%' }}
        >
          {renderFeatures(portugalFeatures, getPortugalName)}
          {renderFeatures(spainFeatures, getSpainName)}
        </svg>

        {hovered && (
          <div
            className="absolute bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg pointer-events-none z-10"
            style={{
              left: Math.min(mousePos.x + 12, svgRef.current?.getBoundingClientRect().width - 180),
              top: mousePos.y - 60,
            }}
          >
            <p className="font-semibold">{hovered.name}</p>
            <p>{hovered.deals} proyecto{hovered.deals !== 1 ? 's' : ''}</p>
            <p>{(hovered.funded / 1_000_000).toFixed(2)}M€ financiado</p>
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-gray-500">
          <span>0</span>
          <div
            className="w-24 h-2 rounded"
            style={{ background: `linear-gradient(to right, ${COLOR_EMPTY}, ${COLOR_MIN}, ${COLOR_MAX})` }}
          />
          <span>{maxDeals}</span>
        </div>
      </div>
    </div>
  );
}
