import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

interface District {
 id: string;
 en: string;
 ml: string;
 lat: number;
 lng: number;
}

const DISTRICTS: District[] = [
 { id: 'tvm', en: 'Thiruvananthapuram', ml: 'തിരുവനന്തപുരം', lat: 8.5241, lng: 76.9366 },
 { id: 'kol', en: 'Kollam',       ml: 'കൊല്ലം',     lat: 8.8932, lng: 76.6141 },
 { id: 'pta', en: 'Pathanamthitta',   ml: 'പത്തനംതിട്ട',  lat: 9.2648, lng: 76.7870 },
 { id: 'alp', en: 'Alappuzha',     ml: 'ആലപ്പുഴ',    lat: 9.4981, lng: 76.3388 },
 { id: 'ktm', en: 'Kottayam',      ml: 'കോട്ടയം',    lat: 9.5916, lng: 76.5222 },
 { id: 'idk', en: 'Idukki',       ml: 'ഇടുക്കി',    lat: 9.9188, lng: 77.1025 },
 { id: 'ekm', en: 'Ernakulam',     ml: 'എറണാകുളം',   lat: 9.9816, lng: 76.2999 },
 { id: 'tsr', en: 'Thrissur',      ml: 'തൃശ്ശൂർ',    lat: 10.5276, lng: 76.2144 },
 { id: 'pkd', en: 'Palakkad',      ml: 'പാലക്കാട്',   lat: 10.7867, lng: 76.6548 },
 { id: 'mpm', en: 'Malappuram',     ml: 'മലപ്പുറം',    lat: 11.0730, lng: 76.0740 },
 { id: 'kzd', en: 'Kozhikode',     ml: 'കോഴിക്കോട്',   lat: 11.2588, lng: 75.7804 },
 { id: 'wyd', en: 'Wayanad',      ml: 'വയനാട്',     lat: 11.6854, lng: 76.1320 },
 { id: 'knr', en: 'Kannur',       ml: 'കണ്ണൂർ',     lat: 11.8745, lng: 75.3704 },
 { id: 'ksd', en: 'Kasaragod',     ml: 'കാസർഗോഡ്',    lat: 12.4996, lng: 74.9869 },
];

interface Props {
  onSelect: (lat: number, lng: number, name: string, id: string) => void;
  selectedId?: string;
  className?: string;
}

export function DistrictSelector({ onSelect, selectedId, className = '' }: Props) {
  const { i18n } = useTranslation();
  const isML = i18n.language === 'ml';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const d = DISTRICTS.find((item) => item.id === e.target.value);
    if (d) onSelect(d.lat, d.lng, isML ? d.ml : d.en, d.id);
  };

 return (
  <div className={`relative ${className}`}>
   <MapPin
    size={14}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
   />
   <select
    value={selectedId ?? ''}
    onChange={handleChange}
    className={[
          'input-field pl-8 appearance-none cursor-pointer',
          'hover:border-border-strong focus:border-accent',
     'transition-colors',
     isML ? 'ml-text' : '',
    ].join(' ')}
    aria-label="Select your district"
   >
    <option value="" disabled>
     {isML ? 'ജില്ല തിരഞ്ഞെടുക്കൂ…' : 'Select your district…'}
    </option>
    {DISTRICTS.map((d) => (
     <option key={d.id} value={d.id}>
      {isML ? d.ml : d.en}
     </option>
    ))}
   </select>
   {/* Custom chevron */}
   <svg
    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted"
    width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
   >
    <polyline points="6 9 12 15 18 9" />
   </svg>
  </div>
 );
}
