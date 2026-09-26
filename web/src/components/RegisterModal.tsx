import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  UserPlus,
  X,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck
} from 'lucide-react';

import { getDashboardRoute } from '../utils/navigation';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'beneficiary' | 'institute_representative' | 'inspection_officer' | 'department_official';
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'beneficiary'
}) => {
  const { login } = useAuth();
  const { language } = useTheme();
  const navigate = useNavigate();

  const [role, setRole] = useState<'beneficiary' | 'institute_representative' | 'inspection_officer' | 'department_official'>(defaultRole);

  useEffect(() => {
    if (isOpen && defaultRole) {
      setRole(defaultRole);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, defaultRole]);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [extraField, setExtraField] = useState<string>('');
  const [scheme, setScheme] = useState<string>('DDRS');
  const [stateName, setStateName] = useState<string>('Madhya Pradesh');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    let designation = 'Citizen Beneficiary';
    let department = 'Public Citizen Cell';

    if (role === 'institute_representative') {
      designation = `In-Charge (${extraField || 'Institution Representative'})`;
      department = `${scheme} Scheme Grantee`;
    } else if (role === 'inspection_officer') {
      designation = `PMU Field Inspector (${extraField || 'Auditor'})`;
      department = 'National Social Audit Directorate';
    } else if (role === 'department_official') {
      designation = extraField || 'Monitoring Director';
      department = 'Department of Social Justice & Empowerment';
    }

    try {
      const res = await api.auth.register({
        name,
        email,
        password,
        role,
        phone,
        designation,
        department,
        institute_id: role === 'institute_representative' ? 1 : undefined
      });

      // Update AuthContext session directly
      login(res.token, res.user);

      setSuccess(
        language === 'hi'
          ? 'पंजीकरण सफल रहा! आपके डैशबोर्ड पर पुनर्निर्देशित किया जा रहा है...'
          : 'Registration successful! Redirecting to your workspace...'
      );

      setTimeout(() => {
        onClose();
        navigate(getDashboardRoute(res.user));
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-linear-to-r from-[#0284c7] to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {language === 'hi'
                  ? 'हितधारक पंजीकरण एवं नामांकन'
                  : 'Stakeholder Registration & Enrollment'}
              </h3>
              <p className="text-[11px] text-white/80">
                GFR 2017 & MoSJE Statutory Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
            {language === 'hi' ? 'पंजीकरण श्रेणी चुनें:' : 'Select Registration Category:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setRole('beneficiary')}
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                role === 'beneficiary'
                  ? 'bg-[#0284c7] text-white border-[#0284c7] font-bold shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
              }`}
            >
              🧑‍🤝‍🧑 {language === 'hi' ? 'नागरिक / लाभार्थी' : 'Beneficiary'}
            </button>

            <button
              type="button"
              onClick={() => setRole('institute_representative')}
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                role === 'institute_representative'
                  ? 'bg-[#0284c7] text-white border-[#0284c7] font-bold shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
              }`}
            >
              🏛️ {language === 'hi' ? 'संस्थान / एनजीओ' : 'Institution'}
            </button>

            <button
              type="button"
              onClick={() => setRole('inspection_officer')}
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                role === 'inspection_officer'
                  ? 'bg-[#0284c7] text-white border-[#0284c7] font-bold shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
              }`}
            >
              📋 {language === 'hi' ? 'निरीक्षण अधिकारी' : 'Inspector'}
            </button>

            <button
              type="button"
              onClick={() => setRole('department_official')}
              className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                role === 'department_official'
                  ? 'bg-[#0284c7] text-white border-[#0284c7] font-bold shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
              }`}
            >
              ⚖️ {language === 'hi' ? 'विभागीय अधिकारी' : 'Official'}
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 rounded-lg border border-sky-300 dark:border-sky-700 flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-sky-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {role === 'institute_representative'
                ? language === 'hi' ? 'संस्थान अधिकृत प्रतिनिधि का नाम *' : 'Authorized Representative Name *'
                : language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rameshwar Prasad Sharma"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'ईमेल पता *' : 'Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'department_official' ? 'officer@nic.in' : 'user@domain.org'}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'मोबाइल नंबर (एसएमएस हेतु) *' : 'Mobile Number (for SMS) *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'पासवर्ड निर्धारित करें *' : 'Create Secure Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Role-Specific Contextual Fields */}
          {role === 'institute_representative' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'hi' ? 'एनजीओ दर्पण पंजीकरण आईडी *' : 'NGO Darpan Registration ID *'}
                </label>
                <input
                  type="text"
                  required
                  value={extraField}
                  onChange={(e) => setExtraField(e.target.value)}
                  placeholder="MP/2024/001928"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'hi' ? 'सहायता प्राप्त जीआईए योजना *' : 'Supported GIA Scheme *'}
                </label>
                <select
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="DDRS">DDRS (Deendayal Disabled Rehab)</option>
                  <option value="IPSrC">IPSrC (Senior Citizens Scheme)</option>
                  <option value="PM-DAKSH">PM-DAKSH (Skill Training)</option>
                  <option value="IRCA">IRCA (Addiction Treatment)</option>
                </select>
              </div>
            </div>
          )}

          {role === 'inspection_officer' && (
            <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-900 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'आधिकारिक पीएमयू निरीक्षक कोड / संवर्ग *' : 'Official PMU Inspector Code / Cadre *'}
              </label>
              <input
                type="text"
                required
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
                placeholder="PMU-AUDIT-MP-04"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase font-mono text-slate-900 dark:text-white"
              />
            </div>
          )}

          {role === 'department_official' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'आधिकारिक पदनाम / निदेशालय *' : 'Official Designation / Directorate *'}
              </label>
              <input
                type="text"
                required
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
                placeholder={language === 'hi' ? 'उप सचिव / जिला समाज कल्याण अधिकारी' : 'Deputy Secretary / District Social Welfare Officer'}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          )}

          {role === 'beneficiary' && (
            <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-900 text-[11px] text-sky-900 dark:text-sky-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-sky-600" />
                <span>{language === 'hi' ? 'नागरिक सशक्तिकरण एवं विसलब्लोअर संरक्षण' : 'Citizen Empowerment & Whistleblower Protection'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'hi'
                  ? 'नागरिक या लाभार्थी के रूप में पंजीकरण करने से आप गोपनीय शिकायतें दर्ज कर सकते हैं, निरीक्षण निष्कर्षों को ट्रैक कर सकते हैं, और संस्थागत ऑडिट के संबंध में एसएमएस अलर्ट प्राप्त कर सकते हैं।'
                  : 'Registering as a citizen or beneficiary allows you to submit confidential grievances, track inspection findings, and receive SMS alerts regarding institutional audits.'}
              </p>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? language === 'hi' ? 'पंजीकरण हो रहा है...' : 'Registering...'
                  : language === 'hi' ? 'पंजीकरण पूर्ण करें' : 'Complete Registration'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
