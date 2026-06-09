export interface Helpline {
  id: string;
  label_en: string;
  label_ml: string;
  type: 'call' | 'whatsapp';
  value: string;
  note_en?: string;
  note_ml?: string;
  emergency?: boolean;
}

export interface Centre {
  id: string;
  name_en: string;
  name_ml: string;
  district: string;
  type: Array<'detox' | 'counselling' | 'op' | 'inpatient'>;
  cost: 'free' | 'subsidised' | 'paid';
  phone: string;
  lat: number;
  lng: number;
  address_en: string;
  address_ml: string;
}

export interface Resource {
  id: string;
  category: 'report' | 'emergency' | 'deaddiction' | 'mentalhealth' | 'youth_women' | 'legal' | 'local_office';
  label_en: string;
  label_ml: string;
  channel: 'call' | 'whatsapp' | 'web' | 'email';
  value: string;
  desc_en: string;
  desc_ml: string;
  hours: string | null;
  verified: boolean;
}

export interface DistrictEntry {
  district: string;
  district_ml: string;
  police_control_room: string;
  excise_office: string;
  verified: boolean;
}

export interface AppData {
  helplines: Helpline[];
  centres: Centre[];
  resources?: Resource[];
  districtDirectory?: DistrictEntry[];
}
