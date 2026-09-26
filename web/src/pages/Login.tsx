import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle,
  UserCheck,
  ShieldAlert,
  KeyRound,
  LogIn,
  Phone,
  User,
  Send,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginBeneficiaryWithOTP, isLoading } = useAuth();
  const { t, language } = useTheme();
  const navigate = useNavigate();

  // Standard Login State (Officials, Inspectors, Institutions)
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'official' | 'inspector' | 'institute' | 'beneficiary' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Beneficiary OTP Login State (No Password Required)
  const [beneficiaryName, setBeneficiaryName] = useState<string>('Rameshwar Patel');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState<string>('9111277889');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState<string>('beneficiary@inspectra.demo');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpNotice, setOtpNotice] = useState<{ message: string; demoOtp?: string } | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  const handleRoleSelect = (role: 'official' | 'inspector' | 'institute' | 'beneficiary', demoEmail: string) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'beneficiary') {
      setBeneficiaryName('Rameshwar Patel');
      setBeneficiaryPhone('9111277889');
      setBeneficiaryEmail('beneficiary@inspectra.demo');
      setOtp('');
      setOtpSent(false);
      setOtpNotice(null);
    } else {
      setEmail(demoEmail);
      setPassword('Inspectra@2025');
    }
  };

  // Standard Password Submission (Official, Inspector, Institute)
  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      if (user.role === 'department_official') {
        navigate('/dashboard');
      } else if (user.role === 'inspection_officer') {
        navigate('/inspector/inspections');
      } else if (user.role === 'institute_representative') {
        navigate(`/institutes/${user.institute_id || 1}`);
      } else {
        navigate('/feedback');
      }
    } catch (err: any) {
      setError(
        err?.message ||
          (language === 'hi'
            ? 'प्रमाणीकरण विफल। कृपया उपयोगकर्ता क्रेडेंशियल जांचें।'
            : 'Authentication failed. Please verify user credentials.')
      );
    }
  };

  // Send Beneficiary OTP via API
  const handleSendBeneficiaryOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!beneficiaryName.trim()) {
      setError(language === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.');
      return;
    }
    const cleanPhone = beneficiaryPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError(
        language === 'hi'
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }
    if (!beneficiaryEmail.trim() || !beneficiaryEmail.includes('@')) {
      setError(
        language === 'hi' ? 'कृपया एक वैध ईमेल पता दर्ज करें।' : 'Please enter a valid email address.'
      );
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await api.auth.sendBeneficiaryOTP({
        name: beneficiaryName.trim(),
        phone: beneficiaryPhone.trim(),
        email: beneficiaryEmail.trim(),
      });
      setOtpSent(true);
      setOtpNotice({
        message: res.message || 'OTP dispatched to registered mobile and email.',
        demoOtp: res.otp_demo,
      });
    } catch (err: any) {
      setError(
        err?.message ||
          (language === 'hi'
            ? 'ओटीपी भेजने में असमर्थ। कृपया पुनः प्रयास करें।'
            : 'Failed to send OTP. Please try again.')
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify Beneficiary OTP & Login
  const handleVerifyBeneficiaryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim()) {
      setError(language === 'hi' ? 'कृपया 6-अंकों का ओटीपी दर्ज करें।' : 'Please enter the 6-digit OTP code.');
      return;
    }

    try {
      await loginBeneficiaryWithOTP(
        beneficiaryName.trim(),
        beneficiaryPhone.trim(),
        beneficiaryEmail.trim(),
        otp.trim()
      );
      navigate('/feedback');
    } catch (err: any) {
      setError(
        err?.message ||
          (language === 'hi'
            ? 'अमान्य अथवा समाप्त ओटीपी। कृपया सही ओटीपी दर्ज करें।'
            : 'Invalid or expired OTP. Please enter the valid code.')
      );
    }
  };

  const getEmailLabel = () => {
    switch (selectedRole) {
      case 'official': return t('roleOfficialEmailLabel');
      case 'inspector': return t('roleInspectorEmailLabel');
      case 'institute': return t('roleInstituteEmailLabel');
      default: return t('roleDefaultEmailLabel');
    }
  };

  const getPasswordLabel = () => {
    switch (selectedRole) {
      case 'official': return t('roleOfficialPassLabel');
      case 'inspector': return t('roleInspectorPassLabel');
      case 'institute': return t('roleInstitutePassLabel');
      default: return t('roleDefaultPassLabel');
    }
  };

  const getEmailPlaceholder = () => {
    switch (selectedRole) {
      case 'official': return 'official@inspectra.demo';
      case 'inspector': return 'inspector@inspectra.demo';
      case 'institute': return 'institute@inspectra.demo';
      default: return language === 'hi' ? 'ऊपर से भूमिका चुनें या आधिकारिक ईमेल दर्ज करें' : 'Select a role above or enter official email';
    }
  };

  const isBeneficiaryRole = selectedRole === 'beneficiary';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-lg w-full space-y-5">
        {/* Official Header with High-Visibility Logos */}
        <div className="text-center space-y-2.5">
          <div className="flex items-center justify-center">
            {/* Ashoka Lion Capital (Satyamev Jayate) */}
            <div className="h-24 sm:h-28 md:h-32 w-auto flex items-center justify-center shrink-0">
              <img
                src="/emblem_india.png"
                alt="State Emblem of India - Satyamev Jayate"
                className="h-full w-auto object-contain filter contrast-150 brightness-90 drop-shadow-md"
              />
            </div>
          </div>

          <div>
            <div className="text-xs sm:text-sm uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">
              Government of India • भारत सरकार
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Ministry of Social Justice and Empowerment / सामाजिक न्याय और अधिकारिता मंत्रालय
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1">
            {t('loginGatewayTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {t('loginGatewaySub')}
          </p>
        </div>

        {/* Fast-Switch Role Selection */}
        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#0284c7]" />
              {t('loginSelectRole')}
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              {t('loginClickToSelect')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => handleRoleSelect('official', 'official@inspectra.demo')}
              className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedRole === 'official'
                  ? 'bg-blue-700 text-white border-blue-700 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">{t('roleOfficialTitle')}</div>
              <div className="text-[11px] opacity-80 mt-0.5">{t('roleOfficialDesc')}</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('inspector', 'inspector@inspectra.demo')}
              className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedRole === 'inspector'
                  ? 'bg-blue-700 text-white border-blue-700 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">{t('roleInspectorTitle')}</div>
              <div className="text-[11px] opacity-80 mt-0.5">{t('roleInspectorDesc')}</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('institute', 'institute@inspectra.demo')}
              className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedRole === 'institute'
                  ? 'bg-blue-700 text-white border-blue-700 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">{t('roleInstituteTitle')}</div>
              <div className="text-[11px] opacity-80 mt-0.5">{t('roleInstituteDesc')}</div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('beneficiary', 'beneficiary@inspectra.demo')}
              className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedRole === 'beneficiary'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs ring-2 ring-emerald-400/50'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold flex items-center justify-between">
                <span>{t('roleBeneficiaryTitle')}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold uppercase">
                  OTP
                </span>
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {language === 'hi' ? 'ओटीपी लॉगिन (पासवर्ड रहित)' : 'OTP Login (No Password)'}
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Login Form */}
        {isBeneficiaryRole ? (
          /* ===============================================================
             BENEFICIARY OTP FORM: Name, Mobile No, Email ID — NO PASSWORD
             =============================================================== */
          <form
            onSubmit={otpSent ? handleVerifyBeneficiaryOtp : handleSendBeneficiaryOtp}
            className="p-5 sm:p-6 space-y-4 rounded-2xl shadow-xs bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60"
          >
            {/* Beneficiary Header Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'नागरिक / लाभार्थी ओटीपी गेटवे' : 'Citizen Beneficiary OTP Gateway'}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {language === 'hi'
                      ? 'पासवर्ड की आवश्यकता नहीं • सुरक्षित मोबाइल एवं ईमेल ओटीपी'
                      : 'No Password Required • Instant Mobile & Email OTP'}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Field 1: Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                {language === 'hi' ? 'नागरिक का पूरा नाम' : 'Citizen Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
                  placeholder={language === 'hi' ? 'उदा. रामेश्वर पटेल' : 'e.g. Rameshwar Patel'}
                />
              </div>
            </div>

            {/* Field 2: Mobile Number */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                {language === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 digits)'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-bold border-r border-slate-300 dark:border-slate-700 pr-2 pointer-events-none">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={beneficiaryPhone}
                  onChange={(e) => setBeneficiaryPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-20 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium tracking-wide"
                  placeholder="9111277889"
                />
              </div>
            </div>

            {/* Field 3: Email ID */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={beneficiaryEmail}
                  onChange={(e) => setBeneficiaryEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
                  placeholder="beneficiary@inspectra.demo"
                />
              </div>
            </div>

            {/* OTP Status & Input Section */}
            {otpSent && (
              <div className="space-y-3 pt-1">
                {/* Sent Confirmation Alert */}
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{language === 'hi' ? 'ओटीपी प्रेषित किया गया' : 'OTP Dispatched Successfully'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    {otpNotice?.message}
                  </p>
                  {otpNotice?.demoOtp && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Demo Code:</span>
                      <span className="px-2 py-0.5 rounded bg-white dark:bg-emerald-900 font-mono font-bold text-emerald-800 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700">
                        {otpNotice.demoOtp}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp(otpNotice.demoOtp || '123456')}
                        className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 cursor-pointer"
                      >
                        {language === 'hi' ? 'स्वतः भरें' : 'Auto-fill'}
                      </button>
                    </div>
                  )}
                </div>

                {/* 6-Digit OTP Input Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {language === 'hi' ? '6-अंकों का सत्यापन ओटीपी' : 'Enter 6-Digit Verification OTP'}
                    </label>
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={handleSendBeneficiaryOtp}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                      <span>{language === 'hi' ? 'पुनः भेजें' : 'Resend OTP'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[0.45em] font-mono font-black text-xl py-3 bg-slate-50 dark:bg-slate-800/80 border-2 border-emerald-500 rounded-xl focus:ring-4 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
                    placeholder="••••••"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2">
              {!otpSent ? (
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-400/40 cursor-pointer"
                >
                  {isSendingOtp ? (
                    <span className="flex items-center gap-2 text-sm">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {language === 'hi' ? 'ओटीपी भेजा जा रहा है...' : 'Sending OTP...'}
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white shrink-0" />
                      <span>{language === 'hi' ? 'सत्यापन ओटीपी प्राप्त करें' : 'Send Verification OTP'}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-emerald-400/40 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 text-sm">
                      {language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Verifying OTP...'}
                    </span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-white shrink-0" />
                      <span>{language === 'hi' ? 'ओटीपी सत्यापित करें और प्रवेश करें' : 'Verify OTP & Access Portal'}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Statutory Security Disclaimer */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                {language === 'hi' ? 'नागरिक गोपनीयता एवं डेटा सुरक्षा' : 'Citizen Privacy & Data Protection Assurance'}
              </span>
              {language === 'hi'
                ? 'नागरिक प्रमाणीकरण आईटी अधिनियम एवं डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) दिशानिर्देशों के अनुरूप एन्क्रिप्टेड है।'
                : 'Citizen authentication is secured and audited under IT Act & DPDP citizen protection guidelines.'}
            </div>
          </form>
        ) : (
          /* ===============================================================
             STANDARD LOGIN FORM: Official, Inspector, Institute Rep (Password)
             =============================================================== */
          <form
            onSubmit={handleStandardSubmit}
            className="p-5 sm:p-6 space-y-4 rounded-2xl shadow-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5 transition-colors">
                {getEmailLabel()}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                  placeholder={getEmailPlaceholder()}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5 transition-colors">
                {getPasswordLabel()}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-sky-300/40 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-sm">{t('loginBtnSigningIn')}</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-white shrink-0" />
                    <span>{t('loginBtnSignIn')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Statutory IT Act Notice */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                {language === 'hi'
                  ? 'सांविधिक सुरक्षा चेतावनी (आईटी अधिनियम 2000, धारा 43 एवं 66)'
                  : 'Statutory Security Warning (IT Act 2000, Section 43 & 66)'}
              </span>
              {language === 'hi'
                ? 'आधिकारिक भारत सरकार आईटी संपत्ति। अनधिकृत प्रवेश अथवा डेटा से छेड़छाड़ कानूनन दंडनीय एवं ऑडिटेड है।'
                : 'Official Government of India IT asset. Unauthorized access or data tampering is strictly prohibited and audited.'}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
