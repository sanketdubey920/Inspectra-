import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Institute, Complaint } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  Send, Search, CheckCircle, AlertCircle, Shield, User, Phone, FileText,
  History, Clock, CheckCircle2, Copy, Check, RefreshCw, Eye
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const Feedback: React.FC = () => {
  const { language, t } = useTheme();
  const { user } = useAuth();

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [instituteId, setInstituteId] = useState<number>(1);
  const [category, setCategory] = useState<string>('Facility Hygiene & Food Quality');
  const [description, setDescription] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [name, setName] = useState<string>(user?.name || '');
  const [contact, setContact] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<{ tracking_code: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Tracking state
  const [trackCode, setTrackCode] = useState<string>('');
  const [trackedGrievance, setTrackedGrievance] = useState<Complaint | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);

  // Report History State
  const [historyTab, setHistoryTab] = useState<'my' | 'public'>('my');
  const [myHistory, setMyHistory] = useState<any[]>([]);
  const [publicHistory, setPublicHistory] = useState<Complaint[]>([]);
  const [loadingPublicHistory, setLoadingPublicHistory] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    api.institutes.list().then((res) => {
      setInstitutes(res.institutes);
      if (res.institutes.length > 0) {
        setInstituteId(res.institutes[0].id);
      }
    }).catch(() => {});

    // Load local submission history
    try {
      const saved = JSON.parse(localStorage.getItem('inspectra_my_complaints') || '[]');
      setMyHistory(saved);
      if (saved.length === 0) {
        setHistoryTab('public');
      }
    } catch (e) {}

    // Load public resolution history
    setLoadingPublicHistory(true);
    api.feedback.list()
      .then((res) => {
        setPublicHistory(res.feedback || []);
      })
      .catch(() => {})
      .finally(() => setLoadingPublicHistory(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.feedback.submit({
        institute_id: instituteId,
        category,
        description,
        is_anonymous: isAnonymous,
        name: isAnonymous ? undefined : name,
        contact: isAnonymous ? undefined : contact,
      });
      setSubmittedResult(res);
      setDescription('');

      // Persist to local report history
      try {
        const savedHistory = JSON.parse(localStorage.getItem('inspectra_my_complaints') || '[]');
        const targetInst = institutes.find(i => i.id === instituteId);
        const newRecord = {
          tracking_code: res.tracking_code,
          institute_name: targetInst ? `${targetInst.name} (${targetInst.district})` : `Institute #${instituteId}`,
          category,
          description: description.slice(0, 140),
          created_at: new Date().toISOString(),
          status: 'PENDING'
        };
        const updated = [newRecord, ...savedHistory.filter((item: any) => item.tracking_code !== res.tracking_code)].slice(0, 25);
        localStorage.setItem('inspectra_my_complaints', JSON.stringify(updated));
        setMyHistory(updated);
        setHistoryTab('my');
      } catch (e) {}
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackCode.trim()) return;
    setIsTracking(true);
    setTrackError(null);
    try {
      const data = await api.feedback.track(trackCode.trim());
      setTrackedGrievance(data);
    } catch (err: any) {
      setTrackError(err?.message || 'Grievance record not found.');
      setTrackedGrievance(null);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
          {language === 'hi' ? 'लोक शिकायत निवारण' : 'Public Grievance Redressal'}
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
          {language === 'hi' ? 'लाभार्थी कल्याण एवं शिकायत निवारण पोर्टल' : 'Beneficiary Welfare & Grievance Portal'}
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          {language === 'hi'
            ? 'आपकी प्रतिक्रिया सीधे INSPECTRA जोखिम-विश्लेषण इंजन में दर्ज होती है जिससे औचक सत्यापन की आवश्यकता वाले संस्थानों की पहचान की जा सके।'
            : 'Your feedback directly feeds into the INSPECTRA risk-analysis engine to help identify institutions needing surprise verification.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Submit Form */}
        <div className="lg:col-span-2">
          <div className="gov-card p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>{language === 'hi' ? 'परिचालन फीडबैक / शिकायत दर्ज करें' : 'Submit Operational Feedback / Complaint'}</span>
            </h3>

            {submittedResult ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
                  {language === 'hi' ? 'शिकायत सफलतापूर्वक पंजीकृत की गई' : 'Grievance Registered Successfully'}
                </h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  {language === 'hi' ? 'आपका ट्रैकिंग संदर्भ कोड है:' : 'Your tracking reference code is:'}
                </p>
                <div className="inline-block px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-700 font-mono font-black text-base text-slate-900 dark:text-white">
                  {submittedResult.tracking_code}
                </div>
                <p className="text-[11px] text-slate-500 block">
                  {language === 'hi'
                    ? 'समाधान स्थिति जानने हेतु कृपया इस कोड को सुरक्षित रखें। जोखिम इंजन ने यह शिकायत दर्ज कर ली है।'
                    : 'Please save this code to check resolution status. The risk engine has registered this complaint.'}
                </p>
                <button
                  onClick={() => setSubmittedResult(null)}
                  className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 underline cursor-pointer"
                >
                  {language === 'hi' ? 'एक और शिकायत दर्ज करें' : 'Submit another grievance'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {submitError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'सहायता प्राप्त संस्थान / केंद्र चुनें *' : 'Select Supported Institute / Centre *'}
                  </label>
                  <select
                    value={instituteId}
                    onChange={(e) => setInstituteId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {institutes.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.district}, {inst.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'शिकायत की श्रेणी *' : 'Grievance Category *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Facility Hygiene & Food Quality">
                      {language === 'hi' ? 'परिसर स्वच्छता एवं भोजन गुणवत्ता' : 'Facility Hygiene & Food Quality'}
                    </option>
                    <option value="Staff Absenteeism">
                      {language === 'hi' ? 'कर्मचारियों की अनुपस्थिति / शिक्षकों की कमी' : 'Staff Absenteeism / Lack of Teachers'}
                    </option>
                    <option value="Allowance / Material Distribution Delay">
                      {language === 'hi' ? 'भत्ता / किट वितरण में देरी' : 'Allowance / Material Distribution Delay'}
                    </option>
                    <option value="Hostel Accommodation Issues">
                      {language === 'hi' ? 'छात्रावास आवास / बिस्तर संबंधी समस्याएं' : 'Hostel Accommodation Issues'}
                    </option>
                    <option value="Medical Assistance Shortage">
                      {language === 'hi' ? 'चिकित्सा सहायता की कमी' : 'Medical Assistance Shortage'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'hi' ? 'विस्तृत विवरण *' : 'Detailed Description *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'विशिष्ट तिथियां, कमरा संख्या, या प्रेक्षण का विवरण दें...'
                        : 'Provide specific dates, room details, or observations...'
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                {/* Anonymous Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="anon" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    {language === 'hi'
                      ? 'गुमनाम रूप से सबमिट करें (संस्थान को आपकी पहचान प्रकट नहीं की जाएगी)'
                      : 'Submit anonymously (Identity will not be disclosed to institute)'}
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'hi' ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rameshwar Patel"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {language === 'hi' ? 'मोबाइल नंबर (एसएमएस अपडेट हेतु)' : 'Mobile Number (For SMS updates)'}
                      </label>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? (language === 'hi' ? 'शिकायत दर्ज हो रही है...' : 'Registering Grievance...')
                        : (language === 'hi' ? 'निगरानी सेल को शिकायत सबमिट करें' : 'Submit Grievance to Monitoring Cell')}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Col: Track Grievance Status */}
        <div className="space-y-6">
          <div className="gov-card p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>{language === 'hi' ? 'शिकायत स्थिति ट्रैक करें' : 'Track Grievance Status'}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              {language === 'hi'
                ? 'अपना शिकायत संदर्भ कोड दर्ज करें (उदा. GRV-202509-88129A)'
                : 'Enter your grievance reference code (e.g. GRV-202509-88129A)'}
            </p>

            <form onSubmit={handleTrack} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="GRV-..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase font-mono text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={isTracking}
                className="w-full py-2 bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {isTracking
                  ? (language === 'hi' ? 'खोज रहे हैं...' : 'Searching...')
                  : (language === 'hi' ? 'स्थिति ट्रैक करें' : 'Track Status')}
              </button>
            </form>

            {trackError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {trackError}
              </div>
            )}

            {trackedGrievance && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
                    {trackedGrievance.tracking_code}
                  </span>
                  <StatusBadge status={trackedGrievance.status} size="sm" />
                </div>
                {trackedGrievance.institute_name && (
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'संस्थान: ' : 'Target: '}{trackedGrievance.institute_name}
                  </div>
                )}
                <div className="font-bold text-slate-900 dark:text-white">
                  {trackedGrievance.category}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {trackedGrievance.description}
                </p>

                {/* Official Action Remarks from Government Official */}
                {trackedGrievance.resolution_notes ? (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg space-y-1">
                    <div className="font-bold text-blue-900 dark:text-blue-200 text-[11px] flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{language === 'hi' ? 'आधिकारिक विभागीय कार्रवाई एवं समाधान टिप्पणी:' : 'Official Action & Resolution Remarks:'}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                      {trackedGrievance.resolution_notes}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{language === 'hi' ? 'पीएमयू निगरानी सेल द्वारा प्रारंभिक समीक्षा प्रतीक्षित है।' : 'Awaiting initial review by PMU Monitoring Cell.'}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{language === 'hi' ? 'पंजीकृत: ' : 'Registered: '}{new Date(trackedGrievance.created_at).toLocaleDateString()}</span>
                  {trackedGrievance.resolved_at && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {language === 'hi' ? 'निस्तारित: ' : 'Resolved: '}{new Date(trackedGrievance.resolved_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="gov-card p-5 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white block">
              {language === 'hi' ? 'नागरिक अधिकार पत्र एवं सेवा मानक (SLA)' : 'Citizen Charter & SLA'}
            </span>
            <p className="text-[11px] leading-relaxed">
              {language === 'hi'
                ? 'इस पोर्टल के माध्यम से पंजीकृत प्रत्येक शिकायत को गंभीरता के आधार पर वर्गीकृत किया जाता है और यह तुरंत जोखिम इंजन गणना को प्रभावित करती है। उच्च गंभीरता वाले मामले नामित पीएमयू टीमों द्वारा प्राथमिकता पर औचक निरीक्षण की प्रक्रिया शुरू करते हैं।'
                : 'Every complaint registered through this portal is classified by severity and immediately factors into the Risk Engine calculation. High-severity reports trigger priority surprise inspections by designated PMU teams.'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: BENEFICIARY REPORT HISTORY & STATUS LOG */}
      <div id="report-history" className="gov-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <History className="w-3 h-3" />
                <span>{language === 'hi' ? 'नागरिक रिकॉर्ड' : 'Public & Beneficiary History'}</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                GFR 150(2) & CVC Redressal Charter
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <History className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{language === 'hi' ? 'लाभार्थी रिपोर्ट एवं शिकायत इतिहास' : 'Beneficiary Report & Grievance History'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'hi'
                ? 'आपके द्वारा दर्ज की गई शिकायतों की वर्तमान स्थिति एवं विभाग द्वारा जारी आधिकारिक समाधान आदेशों का विवरण'
                : 'Track the status of your reported grievances and review official resolution directives issued by the Ministry.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setHistoryTab('my')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                historyTab === 'my'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'मेरी दर्ज रिपोर्टें' : 'My Reports'}</span>
              {myHistory.length > 0 && (
                <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-mono">
                  {myHistory.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setHistoryTab('public')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                historyTab === 'public'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'हालिया सार्वजनिक समाधान' : 'Public Resolution History'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1 Content: My Submitted Reports */}
        {historyTab === 'my' && (
          <div className="space-y-4">
            {myHistory.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-400" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {language === 'hi' ? 'कोई स्थानीय रिपोर्ट इतिहास नहीं मिला' : 'No Submissions Recorded on this Browser'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {language === 'hi'
                    ? 'जब आप इस पोर्टल से कोई शिकायत दर्ज करेंगे, तो उसका ट्रैकिंग रिकॉर्ड स्वतः यहाँ दिखाई देगा। यदि आपके पास ट्रैकिंग कोड है, तो ऊपर ट्रैक बॉक्स का उपयोग करें।'
                    : 'When you submit a grievance through this portal, it will be saved here automatically. If you have an existing tracking code, enter it in the tracker above.'}
                </p>
                <button
                  onClick={() => setHistoryTab('public')}
                  className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {language === 'hi' ? 'हालिया सार्वजनिक समाधान देखें →' : 'View Public Resolution History →'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-blue-700 dark:text-blue-400">
                        <span>{item.tracking_code}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.tracking_code);
                            setCopiedCode(item.tracking_code);
                            setTimeout(() => setCopiedCode(null), 2000);
                          }}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="Copy tracking code"
                        >
                          {copiedCode === item.tracking_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <StatusBadge status={item.status || 'PENDING'} size="sm" />
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {item.institute_name}
                      </div>
                      <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        {item.category}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                      "{item.description}"
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setTrackCode(item.tracking_code);
                          window.scrollTo({ top: 180, behavior: 'smooth' });
                          api.feedback.track(item.tracking_code).then(setTrackedGrievance).catch(() => {});
                        }}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{language === 'hi' ? 'लाइव स्थिति देखें' : 'View Live Status'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2 Content: Public Resolution History */}
        {historyTab === 'public' && (
          <div className="space-y-4">
            {loadingPublicHistory ? (
              <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>{language === 'hi' ? 'रिपोर्ट इतिहास लोड हो रहा है...' : 'Loading report history...'}</span>
              </div>
            ) : publicHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {language === 'hi' ? 'कोई सार्वजनिक रिपोर्ट इतिहास नहीं मिला।' : 'No public report history found.'}
              </div>
            ) : (
              <div className="space-y-3">
                {publicHistory.slice(0, 6).map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                          {report.tracking_code}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {report.institute_name || `Institute #${report.institute_id}`}
                        </span>
                        {report.institute_district && (
                          <span className="text-slate-400 text-[11px]">
                            ({report.institute_district})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                        <StatusBadge status={report.status} size="sm" />
                      </div>
                    </div>

                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      {language === 'hi' ? 'श्रेणी: ' : 'Category: '}{report.category}
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      "{report.description}"
                    </p>

                    {/* Official Resolution Remarks if present */}
                    {report.resolution_notes && (
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] text-slate-800 dark:text-slate-200 space-y-0.5">
                        <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'hi' ? 'आधिकारिक विभागीय निर्देश एवं समाधान:' : 'Official Department Directive & Resolution:'}</span>
                        </span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {report.resolution_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
