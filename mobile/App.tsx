import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { mobileApi, setMobileAuthToken } from './src/services/api';
import { Inspection, ChecklistItem } from './src/types';

export default function App() {
  // Navigation state: 'LOGIN' | 'DASHBOARD' | 'GPS' | 'CHECKLIST' | 'EVIDENCE' | 'SUBMIT'
  const [currentScreen, setCurrentScreen] = useState<string>('LOGIN');
  const [user, setUser] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<'ONLINE' | 'OFFLINE' | 'SYNCED'>('ONLINE');

  // Inspection data state
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [activeInspection, setActiveInspection] = useState<Inspection | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);

  // GPS verification state
  const [latitude, setLatitude] = useState<string>('23.2601');
  const [longitude, setLongitude] = useState<string>('77.4124');
  const [gpsVerified, setGpsVerified] = useState<boolean>(false);
  const [gpsDistance, setGpsDistance] = useState<number>(24.5);

  // Evidence state
  const [capturedEvidence, setCapturedEvidence] = useState<Array<{ category: string; time: string; coords: string }>>([]);

  // Report fields
  const [verifiedAttendance, setVerifiedAttendance] = useState<string>('68');
  const [observations, setObservations] = useState<string>(
    'Field headcount confirmed 68% attendance vs reported 94%. Classroom 2 equipment under-utilized.'
  );

  const handleLogin = async () => {
    try {
      const res = await mobileApi.login('inspector@inspectra.demo', 'Inspectra@2025');
      setUser(res.user);
      loadInspections();
      setCurrentScreen('DASHBOARD');
    } catch (e: any) {
      // Fallback for standalone demo simulation
      setUser({ name: 'Officer Rajesh Kumar', designation: 'PMU Team 04', role: 'inspection_officer' });
      setInspections([
        {
          id: 1,
          institute_id: 1,
          institute_name: 'ABC Residential Centre — Bhopal',
          institute_state: 'Madhya Pradesh',
          institute_district: 'Bhopal',
          inspector_id: 2,
          inspection_type: 'SURPRISE',
          priority: 'HIGH',
          status: 'ASSIGNED',
          trigger_risk_score: 82,
          trigger_reasons: 'Attendance Anomaly (+18%) + Unresolved Compliance + 3 Grievances',
          scheduled_date: new Date().toISOString(),
          gps_verified: false,
          expected_latitude: 23.2599,
          expected_longitude: 77.4126,
        },
      ]);
      setCurrentScreen('DASHBOARD');
    }
  };

  const loadInspections = async () => {
    try {
      const res = await mobileApi.getAssignedInspections();
      setInspections(res.inspections);
      if (res.inspections.length > 0) {
        setActiveInspection(res.inspections[0]);
      }
    } catch (e) {
      console.log('Mobile inspection fetch error, fallback active');
    }
  };

  const handleSelectInspection = (insp: Inspection) => {
    setActiveInspection(insp);
    setChecklists([
      { id: 1, inspection_id: insp.id, section: 'Attendance', item_name: 'Audit physical attendance register', status: 'FAIL', evidence_required: true, notes: '26% discrepancy noted' },
      { id: 2, inspection_id: insp.id, section: 'Attendance', item_name: 'Headcount of resident beneficiaries', status: 'PASS', evidence_required: true, notes: '42 present' },
      { id: 3, inspection_id: insp.id, section: 'Staff', item_name: 'On-duty staff verification', status: 'PASS', evidence_required: true, notes: '4/6 on duty' },
      { id: 4, inspection_id: insp.id, section: 'Infrastructure', item_name: 'Classroom 2 & Lab Inspection', status: 'FAIL', evidence_required: true, notes: 'Unusual inactivity confirmed' },
      { id: 5, inspection_id: insp.id, section: 'Compliance', item_name: 'Fire Safety NOC Renewal', status: 'FAIL', evidence_required: true, notes: 'Certificate expired' },
    ]);
    setCurrentScreen('GPS');
  };

  const handleVerifyGPS = async () => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    // Tolerance check
    const isMatched = Math.abs(lat - 23.2599) < 0.005 && Math.abs(lon - 77.4126) < 0.005;
    if (isMatched) {
      setGpsVerified(true);
      setGpsDistance(24.5);
      Alert.alert('Location Authenticated', 'Inspector location verified within 24.5m of registered facility boundary. Targeted Checklist unlocked.');
      setCurrentScreen('CHECKLIST');
    } else {
      Alert.alert('Location Mismatch', 'Your device coordinates are outside the allowable 500m radius.');
    }
  };

  const handleCaptureEvidence = (category: string) => {
    const item = {
      category,
      time: new Date().toLocaleTimeString(),
      coords: `${latitude}, ${longitude}`,
    };
    setCapturedEvidence((prev) => [...prev, item]);
    Alert.alert('Geo-Tagged Evidence Stored', `Captured ${category} stamped with GPS coordinates [${latitude}, ${longitude}] and timestamp.`);
  };

  const handleSubmitReport = async () => {
    Alert.alert(
      'Inspection Report Submitted',
      'Digital Inspection Report submitted successfully to Department Official for review and corrective action.',
      [
        {
          text: 'OK',
          onPress: () => {
            setCurrentScreen('DASHBOARD');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2540" />

      {/* Top Mobile Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>INSPECTRA Field</Text>
          <Text style={styles.headerSubtitle}>DoSJE PMU Field Inspector Workspace</Text>
        </View>
        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>● {networkStatus}</Text>
        </View>
      </View>

      {/* Screen 1: Login */}
      {currentScreen === 'LOGIN' && (
        <View style={styles.loginContainer}>
          <View style={styles.emblemBox}>
            <Text style={styles.emblemText}>🏛</Text>
          </View>
          <Text style={styles.loginTitle}>Inspector Authentication</Text>
          <Text style={styles.loginSub}>PMU Cell • Government of India</Text>

          <View style={styles.loginCard}>
            <Text style={styles.inputLabel}>Officer ID / Email</Text>
            <TextInput
              style={styles.input}
              value="inspector@inspectra.demo"
              editable={false}
            />
            <Text style={styles.inputLabel}>Security PIN / Password</Text>
            <TextInput
              style={styles.input}
              value="••••••••••••"
              secureTextEntry
              editable={false}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
              <Text style={styles.btnText}>Authenticate & Access Field App</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Screen 2: Dashboard */}
      {currentScreen === 'DASHBOARD' && (
        <ScrollView style={styles.content}>
          <View style={styles.officerCard}>
            <Text style={styles.officerName}>{user?.name || 'Officer Rajesh Kumar'}</Text>
            <Text style={styles.officerRole}>Lead Inspector • PMU Team 04</Text>
          </View>

          <Text style={styles.sectionHeader}>Assigned Field Inspections</Text>
          {inspections.map((insp) => (
            <TouchableOpacity
              key={insp.id}
              style={styles.inspCard}
              onPress={() => handleSelectInspection(insp)}
            >
              <View style={styles.inspCardHeader}>
                <Text style={styles.inspBadge}>SURPRISE AUDIT</Text>
                <Text style={styles.inspPriority}>HIGH RISK (82)</Text>
              </View>
              <Text style={styles.inspTitle}>{insp.institute_name}</Text>
              <Text style={styles.inspLocation}>📍 {insp.institute_district}, {insp.institute_state}</Text>
              <Text style={styles.inspReason}>⚠️ Anomaly: {insp.trigger_reasons}</Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => handleSelectInspection(insp)}
              >
                <Text style={styles.startBtnText}>START INSPECTION & GPS CHECK →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Screen 3: GPS Verification */}
      {currentScreen === 'GPS' && activeInspection && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionHeader}>Field GPS Verification</Text>
          <Text style={styles.helperText}>
            Target: {activeInspection.institute_name}
          </Text>

          <View style={styles.gpsCard}>
            <Text style={styles.radarIcon}>📡</Text>
            <Text style={styles.gpsStatusTitle}>
              {gpsVerified ? 'LOCATION VERIFIED' : 'Awaiting GPS Lock'}
            </Text>
            <Text style={styles.gpsCoordsText}>
              Facility: {activeInspection.expected_latitude}, {activeInspection.expected_longitude}
            </Text>
            <Text style={styles.gpsCoordsText}>
              Current: {latitude}, {longitude}
            </Text>
            <Text style={styles.gpsDistText}>
              Radial Distance: {gpsDistance} meters (Threshold: ≤ 500m)
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleVerifyGPS}>
              <Text style={styles.btnText}>Authenticate Device Location</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setCurrentScreen('DASHBOARD')}
          >
            <Text style={styles.secondaryBtnText}>← Back to Dashboard</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Screen 4: Targeted Checklist */}
      {currentScreen === 'CHECKLIST' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionHeader}>Targeted Inspection Checklist</Text>
          <Text style={styles.helperText}>
            AI-generated items tailored to detected attendance & activity anomalies
          </Text>

          {checklists.map((item) => (
            <View key={item.id} style={styles.checklistItem}>
              <View style={styles.checklistTop}>
                <Text style={styles.categoryPill}>{item.section}</Text>
                <Text style={[styles.statusPill, item.status === 'PASS' ? styles.passColor : styles.failColor]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.itemTitle}>{item.item_name}</Text>
              {item.notes && <Text style={styles.itemNotes}>Observation: {item.notes}</Text>}
            </View>
          ))}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setCurrentScreen('EVIDENCE')}
          >
            <Text style={styles.btnText}>Proceed to Evidence Capture →</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Screen 5: Evidence Capture */}
      {currentScreen === 'EVIDENCE' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionHeader}>Geo-Tagged Evidence Camera</Text>
          <Text style={styles.helperText}>
            Capture photos with automated GPS coordinate & timestamp watermarking
          </Text>

          <View style={styles.cameraGrid}>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => handleCaptureEvidence('Attendance Register')}
            >
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.cameraBtnText}>1. Attendance Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => handleCaptureEvidence('Classrooms & Labs')}
            >
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.cameraBtnText}>2. Classroom 2 Facility</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => handleCaptureEvidence('Hostel & Food')}
            >
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.cameraBtnText}>3. Hostel Sanitation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => handleCaptureEvidence('Staff Roll Call')}
            >
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.cameraBtnText}>4. Staff Presence</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.capturedCount}>
            Captured Proofs: {capturedEvidence.length} items stamped & encrypted
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setCurrentScreen('SUBMIT')}
          >
            <Text style={styles.btnText}>Review & Submit Digital Report →</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Screen 6: Submit Report */}
      {currentScreen === 'SUBMIT' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionHeader}>Final Inspection Assessment</Text>

          <View style={styles.reportCard}>
            <Text style={styles.inputLabel}>Inspector Verified Attendance %</Text>
            <TextInput
              style={[styles.input, { fontWeight: 'bold', color: '#1A56DB' }]}
              value={verifiedAttendance}
              onChangeText={setVerifiedAttendance}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Official Field Observations</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={observations}
              onChangeText={setObservations}
            />

            <View style={styles.findingPill}>
              <Text style={styles.findingText}>Assessment: PARTIALLY COMPLIANT</Text>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReport}>
              <Text style={styles.submitBtnText}>TRANSMIT DIGITAL REPORT TO OFFICIAL</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#0A2540',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  headerSubtitle: { color: '#93C5FD', fontSize: 10, marginTop: 2 },
  networkBadge: { backgroundColor: '#064E3B', paddingHorizontal: 8, paddingVertical: 4, rounded: 6, borderRadius: 12 },
  networkText: { color: '#34D399', fontSize: 10, fontWeight: 'bold' },

  loginContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  emblemBox: { width: 64, height: 64, backgroundColor: '#0A2540', borderRadius: 16, alignSelf: 'center', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emblemText: { fontSize: 32 },
  loginTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', color: '#0F172A' },
  loginSub: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 24 },
  loginCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },

  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 8, padding: 10, fontSize: 13, borderWidth: 1, borderColor: '#CBD5E1' },
  primaryBtn: { backgroundColor: '#1A56DB', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },

  content: { flex: 1, padding: 16 },
  officerCard: { backgroundColor: '#0A2540', padding: 16, borderRadius: 12, marginBottom: 16 },
  officerName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  officerRole: { color: '#94A3B8', fontSize: 12, marginTop: 2 },

  sectionHeader: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginBottom: 4 },
  helperText: { fontSize: 11, color: '#64748B', marginBottom: 14 },

  inspCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  inspCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  inspBadge: { backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  inspPriority: { backgroundColor: '#FEF3C7', color: '#B45309', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  inspTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  inspLocation: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  inspReason: { fontSize: 11, color: '#D97706', marginBottom: 12, fontWeight: '600' },
  startBtn: { backgroundColor: '#EA580C', padding: 10, borderRadius: 8, alignItems: 'center' },
  startBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },

  gpsCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  radarIcon: { fontSize: 40, marginBottom: 10 },
  gpsStatusTitle: { fontSize: 16, fontWeight: '900', color: '#065F46', marginBottom: 6 },
  gpsCoordsText: { fontSize: 11, color: '#64748B', fontFamily: 'monospace' },
  gpsDistText: { fontSize: 12, fontWeight: 'bold', color: '#047857', marginTop: 8 },
  secondaryBtn: { padding: 12, alignItems: 'center' },
  secondaryBtnText: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },

  checklistItem: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  checklistTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  categoryPill: { backgroundColor: '#F1F5F9', fontSize: 10, fontWeight: 'bold', color: '#475569', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusPill: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  passColor: { backgroundColor: '#D1FAE5', color: '#065F46' },
  failColor: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  itemNotes: { fontSize: 11, color: '#64748B', marginTop: 4, fontStyle: 'italic' },

  cameraGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  cameraBtn: { width: '48%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#CBD5E1' },
  cameraIcon: { fontSize: 28, marginBottom: 6 },
  cameraBtnText: { fontSize: 11, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  capturedCount: { fontSize: 12, color: '#059669', fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },

  reportCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  findingPill: { backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8, marginVertical: 14 },
  findingText: { color: '#92400E', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  submitBtn: { backgroundColor: '#059669', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
});
