export type UserRole = 
  | 'department_official' 
  | 'inspection_officer' 
  | 'institute_representative' 
  | 'beneficiary';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  designation?: string;
  department?: string;
  institute_id?: number;
  status: string;
  created_at: string;
}

export interface RiskFactor {
  id: number;
  factor_key: string;
  factor_name: string;
  points: number;
  max_points: number;
  status_label: string;
  description?: string;
}

export interface RiskScore {
  id?: number;
  score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  calculated_at?: string;
  previous_score?: number;
  recalculated_reason?: string;
  factors: RiskFactor[];
}

export interface CCTVCamera {
  id: number;
  institute_id: number;
  camera_name: string;
  room: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  stream_type: string;
  stream_reference?: string;
  activity_level: number;
  occupancy_count: number;
  unusual_inactivity: boolean;
  last_ping?: string;
}

export interface Staff {
  id: number;
  institute_id: number;
  name: string;
  designation: string;
  qualification?: string;
  phone?: string;
  status: string;
  joined_date?: string;
}

export interface Beneficiary {
  id: number;
  institute_id: number;
  beneficiary_code: string;
  name: string;
  gender?: string;
  age?: number;
  category?: string;
  attendance_rate: number;
  status: string;
}

export interface AttendanceRecord {
  id: number;
  record_date: string;
  total_enrolled: number;
  present_count: number;
  reported_rate: number;
  verified_rate?: number;
  notes?: string;
}

export interface Institute {
  id: number;
  name: string;
  registration_number: string;
  address: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  scheme: string;
  project?: string;
  institute_type: string;
  incharge: string;
  contact: string;
  email?: string;
  capacity: number;
  current_occupancy: number;
  status: string;
  classrooms_count: number;
  computer_lab: boolean;
  hostel_facility: boolean;
  medical_facility: boolean;
  cctv_enabled: boolean;
  reported_attendance: number;
  historical_attendance: number;
  pending_compliance_count: number;
  complaints_count: number;
  last_inspection_date?: string;
  created_at: string;
  risk?: RiskScore;
  staff?: Staff[];
  beneficiaries?: Beneficiary[];
  attendance_history?: AttendanceRecord[];
  cctv_cameras?: CCTVCamera[];
  anomalies?: Anomaly[];
  complaints?: Complaint[];
  inspections?: Inspection[];
  corrective_actions?: CorrectiveAction[];
  risk_history?: RiskScore[];
  staff_count?: number;
  beneficiaries_count?: number;
  cctv_online_count?: number;
  cctv_total_count?: number;
  active_corrective_actions?: number;
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

export interface Evidence {
  id: number;
  inspection_id: number;
  institute_id: number;
  inspector_id: number;
  evidence_type: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  category?: string;
  file_url: string;
  file_name?: string;
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  description?: string;
  captured_at: string;
}

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
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED' | 'CLOSED';
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
  gps_verified_at?: string;
  reported_attendance_pct?: number;
  verified_attendance_pct?: number;
  staff_present_count?: number;
  staff_total_count?: number;
  beneficiaries_verified_count?: number;
  observations?: string;
  final_status?: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'FURTHER_INSPECTION_REQUIRED';
  reviewed_by_id?: number;
  reviewed_at?: string;
  official_remarks?: string;
  scheduled_date: string;
  started_at?: string;
  submitted_at?: string;
  created_at: string;
  checklists?: ChecklistItem[];
  evidence?: Evidence[];
  corrective_actions?: CorrectiveAction[];
}

export interface CorrectiveAction {
  id: number;
  inspection_id?: number;
  institute_id: number;
  institute_name?: string;
  issue_title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  deadline: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'CLARIFICATION_REQUIRED' | 'OVERDUE';
  is_overdue?: boolean;
  resolution_description?: string;
  resolution_evidence_url?: string;
  submitted_at?: string;
  verified_by_id?: number;
  verified_at?: string;
  verification_remarks?: string;
  created_at: string;
}

export interface Anomaly {
  id: number;
  institute_id: number;
  institute_name?: string;
  anomaly_type: string;
  severity: string;
  title: string;
  description: string;
  detected_value?: string;
  expected_value?: string;
  confidence: number;
  source: string;
  status: string;
  created_at: string;
}

export interface Complaint {
  id: number;
  institute_id: number;
  institute_name?: string;
  institute_state?: string;
  institute_district?: string;
  tracking_code: string;
  category: string;
  description: string;
  severity: string;
  is_anonymous: boolean;
  complainant_name?: string;
  complainant_contact?: string;
  status: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_name?: string;
  role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  ip_address?: string;
  details?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}
