import { useMemo } from 'react';
import ProvinceMap from './ProvinceMap';
import { extractUrbanitaeProvince } from '../../utils/provinceMapping';

export default function UrbanitaeProvinceMap({ projects }) {
  const provinceData = useMemo(() => {
    const result = {};
    projects.forEach(p => {
      const province = extractUrbanitaeProvince(p);
      if (!province) return;
      if (!result[province]) result[province] = { deals: 0, funded: 0 };
      result[province].deals += 1;
      result[province].funded += (p.funded_eur || 0);
    });
    return result;
  }, [projects]);

  return <ProvinceMap provinceData={provinceData} title="Proyectos por Provincia" />;
}
