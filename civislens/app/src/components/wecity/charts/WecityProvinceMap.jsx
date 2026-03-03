import { useMemo } from 'react';
import ProvinceMap from '../../charts/ProvinceMap';
import { extractWecityProvince } from '../../../utils/provinceMapping';

export default function WecityProvinceMap({ projects }) {
  const provinceData = useMemo(() => {
    const result = {};
    projects.forEach(p => {
      const province = extractWecityProvince(p);
      if (!province) return;
      if (!result[province]) result[province] = { deals: 0, funded: 0 };
      result[province].deals += 1;
      result[province].funded += (p._financiado || 0);
    });
    return result;
  }, [projects]);

  return <ProvinceMap provinceData={provinceData} title="Proyectos por Provincia" />;
}
