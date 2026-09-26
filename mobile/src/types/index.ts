export interface Inspection {
  id: number;
  institute_id: number;
  institute_name?: string;
  institute_state?: string;
  institute_district?: string;
  inspector_id: number;
  inspector_name?: string;
  inspection_type: string;
  priority: string;
  status: string;
  trigger_risk_score?: number;
  trigger_risk_level?: string;
  trigger_reasons?: string;
  special_instructions?: string;
  expected_latitude?: number;
  expected_longitude?: number;
  verified_latitude?: number;
  verified_longitude?: number;
  gps_distance_meters?: number;
  gps_verified: boolean;
  scheduled_date: string;
  checklists?: ChecklistItem[];
  evidence?: any[];
}

export interface ChecklistItem {
  id: number;
  inspection_id: number;
  section: string;
  item_name: string;
  description?: string;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'NA';
  notes?: string;
  evidence_required: boolean;
}

export interface EvidenceItem {
  id?: number;
  category: string;
  uri: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  notes?: string;
}
