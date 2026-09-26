import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Compass, 
  FileText, 
  Activity, 
  MapPin, 
  FileCheck, 
  Scale, 
  Share2, 
  PhoneCall, 
  ShieldCheck,
  Building2,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  LogIn
} from 'lucide-react';

export const Home: React.FC = () => {
  const location = useLocation();
  const { t, language } = useTheme();

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [selectedSchemeTab, setSelectedSchemeTab] = useState<'all' | 'ddrs' | 'ipsrc' | 'pmdaksh' | 'irca'>('all');

  // Authentic real inspection photographs from official Government of India archives
  const slides = [
    {
      image: '/images/special_school_classroom.jpg',
      captionKey: 'slide1Caption'
    },
    {
      image: '/images/special_school_blind.jpg',
      captionKey: 'slide2Caption'
    },
    {
      image: '/images/field_inspection_review.jpg',
      captionKey: 'slide3Caption'
    },
    {
      image: '/images/institutional_campus.jpg',
      captionKey: 'slide4Caption'
    }
  ];

  // Auto-scroll to anchor when URL has hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location]);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (id === 'helpline') {
        el.classList.add('ring-4', 'ring-[#0284c7]');
        setTimeout(() => el.classList.remove('ring-4', 'ring-[#0284c7]'), 2500);
      }
    }
  };

  return (
    <div id="hero" className="flex flex-col min-h-screen bg-transparent relative scroll-smooth w-full">
      {/* Main Hero Architecture (Moderate Official Government Portal Sizing) */}
      <section className="py-7 sm:py-9 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Headline with Sky Blue Accent & Underline */}
        <div className="mb-6 text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight leading-snug">
            <span className="text-[#0284c7]">{t('heroTitleOrange')}</span>{' '}
            <span className="text-slate-800 dark:text-slate-200">{t('heroTitleNavy')}</span>
          </h2>
          <div className="mt-2 w-28 h-1 bg-[#0284c7] rounded-full"></div>
        </div>

        {/* 2-Column Split Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
              {t('heroDescription')}
            </p>

            {/* 2x2 Quick Action Button Grid - Moderate, Readable Sizing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Button 1: Filled Sky Blue Official Login */}
              <Link
                to="/login"
                className="py-2.5 px-4 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm text-center shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-white shrink-0" />
                <span>{t('btnOfficialLogin')}</span>
              </Link>

              {/* Button 2: White Outlined GIS Map */}
              <Link
                to="/map"
                state={{ from: 'home' }}
                className="py-2.5 px-4 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 hover:border-[#0284c7] text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm text-center shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
                <span>{t('btnGisMap')}</span>
              </Link>

              {/* Button 3: White Outlined Register Grievance */}
              <Link
                to="/feedback"
                className="py-2.5 px-4 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 hover:border-[#0284c7] text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm text-center shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{t('btnRegisterGrievance')}</span>
              </Link>

              {/* Button 4: White Outlined - Smooth Scrolls to Statutory Guidelines & GFR */}
              <button
                type="button"
                onClick={() => scrollTo('guidelines')}
                className="py-2.5 px-4 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 hover:border-[#0284c7] text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm text-center shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scale className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>{t('btnStatutoryGuidelines')}</span>
              </button>
            </div>

            {/* Bottom Arrow Links */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              <button
                type="button"
                onClick={() => scrollTo('gia-schemes')}
                className="hover:text-[#0284c7] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('linkExploreSchemes')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTo('about')}
                className="hover:text-[#0284c7] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{t('linkAboutMandate')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Real Inspection Photographic Carousel (7 Cols) */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="relative rounded-2xl overflow-hidden shadow-sm bg-slate-950 h-[310px] sm:h-[340px] w-full border border-slate-200 dark:border-slate-800">
              {/* Photo Image */}
              <img
                src={slides[activeSlideIndex].image}
                alt={t(slides[activeSlideIndex].captionKey)}
                className="w-full h-full object-cover object-center transition-opacity duration-500"
              />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevSlide}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNextSlide}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlideIndex === idx
                        ? 'w-6 bg-[#0284c7]'
                        : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Photo Caption Underneath */}
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t(slides[activeSlideIndex].captionKey)}
            </p>
          </div>
        </div>
      </section>

      {/* Right-Side Floating Quick Dock (Charcoal Gray, Moderate Sizing) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col bg-[#1e293b] text-white rounded-l-lg shadow-md border-y border-l border-slate-600/50 overflow-hidden text-xs">
        {/* Call Icon: Smooth Scrolls directly to the Helpline Number section at the bottom of the Home page */}
        <button
          type="button"
          onClick={() => scrollTo('helpline')}
          className="p-2.5 hover:bg-[#0284c7] transition-colors flex items-center justify-center cursor-pointer group"
          title={language === 'hi' ? 'राष्ट्रीय हेल्पलाइन: 1800-11-0031' : 'National Helpline: 1800-11-0031'}
        >
          <PhoneCall className="w-4 h-4 text-amber-300 group-hover:text-white" />
        </button>

        <Link
          to="/map"
          state={{ from: 'home' }}
          className="p-2.5 hover:bg-[#0284c7] transition-colors flex items-center justify-center border-t border-slate-600/50"
          title={t('btnGisMap')}
        >
          <Compass className="w-4 h-4 text-white" />
        </Link>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'INSPECTRA Portal', url: window.location.href });
            }
          }}
          className="p-2.5 hover:bg-[#0284c7] transition-colors flex items-center justify-center border-t border-slate-600/50 cursor-pointer"
          title={language === 'hi' ? 'पोर्टल साझा करें' : 'Share Portal'}
        >
          <Share2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* National Operational Summary Metrics Strip (Moderate Sizing) */}
      <section className="py-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border-y border-slate-200 dark:border-slate-800 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">{t('kpiRegisteredNum')}</div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold mt-1">{t('kpiRegisteredLabel')}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('kpiRegisteredSub')}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#0284c7]">{t('kpiFlaggedNum')}</div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold mt-1">{t('kpiFlaggedLabel')}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('kpiFlaggedSub')}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">{t('kpiActiveNum')}</div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold mt-1">{t('kpiActiveLabel')}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('kpiActiveSub')}</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <div className="text-2xl sm:text-3xl font-black font-mono text-sky-600 dark:text-sky-400">{t('kpiRemediatedNum')}</div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold mt-1">{t('kpiRemediatedLabel')}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t('kpiRemediatedSub')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: ABOUT US & INSTITUTIONAL MANDATE (Moderate Sizing) */}
      <section id="about" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-14">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8">
          <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 mb-2.5 border border-blue-200 dark:border-blue-800">
            <ShieldCheck className="w-3.5 h-3.5" /> {t('aboutBadge')}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('aboutTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {t('aboutSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-[#0284c7] flex items-center justify-center mb-3">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {t('aboutCard1Title')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {t('aboutCard1Desc')}
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-[#0284c7]">
              {t('aboutCard1Tag')}
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {t('aboutCard2Title')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {t('aboutCard2Desc')}
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {t('aboutCard2Tag')}
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {t('aboutCard3Title')}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {t('aboutCard3Desc')}
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-sky-600 dark:text-sky-400">
              {t('aboutCard3Tag')}
            </div>
          </div>
        </div>

        {/* 2-Tier Governance Model Box (Moderate Sizing) */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white shadow-sm border border-slate-700/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {t('hierarchyBadge')}
              </span>
              <h4 className="text-base sm:text-lg font-bold mt-1 text-white">
                {t('hierarchyTitle')}
              </h4>
              <p className="text-xs sm:text-sm text-blue-100 mt-1.5 leading-relaxed">
                {t('hierarchyDesc')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="font-bold text-amber-300">{t('tierPolicy')}</div>
                <div className="text-xs text-blue-100 mt-0.5">{t('tierPolicySub')}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="font-bold text-amber-300">{t('tierPMU')}</div>
                <div className="text-xs text-blue-100 mt-0.5">{t('tierPMUSub')}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="font-bold text-amber-300">{t('tierUnits')}</div>
                <div className="text-xs text-blue-100 mt-0.5">{t('tierUnitsSub')}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <div className="font-bold text-amber-300">{t('tierBeneficiaries')}</div>
                <div className="text-xs text-blue-100 mt-0.5">{t('tierBeneficiariesSub')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: GIA SCHEMES (DDRS / IPSrC / PM-DAKSH / IRCA - Moderate Sizing) */}
      <section id="gia-schemes" className="py-12 bg-slate-50/70 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 scroll-mt-14 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 mb-2.5 border border-amber-200 dark:border-amber-800">
              <Building2 className="w-3.5 h-3.5" /> {t('schemesBadge')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('schemesTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {t('schemesSubtitle')}
            </p>

            {/* Scheme Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setSelectedSchemeTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedSchemeTab === 'all'
                    ? 'bg-[#0284c7] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {t('tabAll')}
              </button>
              <button
                onClick={() => setSelectedSchemeTab('ddrs')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedSchemeTab === 'ddrs'
                    ? 'bg-[#0284c7] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {t('tabDdrs')}
              </button>
              <button
                onClick={() => setSelectedSchemeTab('ipsrc')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedSchemeTab === 'ipsrc'
                    ? 'bg-[#0284c7] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {t('tabIpsrc')}
              </button>
              <button
                onClick={() => setSelectedSchemeTab('pmdaksh')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedSchemeTab === 'pmdaksh'
                    ? 'bg-[#0284c7] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {t('tabPmdaksh')}
              </button>
              <button
                onClick={() => setSelectedSchemeTab('irca')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedSchemeTab === 'irca'
                    ? 'bg-[#0284c7] text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {t('tabIrca')}
              </button>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Scheme 1: DDRS */}
            {(selectedSchemeTab === 'all' || selectedSchemeTab === 'ddrs') && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400 transition-all">
                <div className="flex items-start justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black text-xs sm:text-sm">
                      DDRS
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {t('ddrsTitle')}
                      </h4>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {t('ddrsSub')}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                    {t('ddrsCount')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {t('ddrsDesc')}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('inspectionCheckpointsLabel')}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{t('ddrsCheck1')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{t('ddrsCheck2')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{t('ddrsCheck3')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{t('ddrsCheck4')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Scheme 2: IPSrC */}
            {(selectedSchemeTab === 'all' || selectedSchemeTab === 'ipsrc') && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-amber-400 transition-all">
                <div className="flex items-start justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-black text-xs sm:text-sm">
                      IPSrC
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {t('ipsrcTitle')}
                      </h4>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {t('ipsrcSub')}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
                    {t('ipsrcCount')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {t('ipsrcDesc')}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('inspectionCheckpointsLabel')}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{t('ipsrcCheck1')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{t('ipsrcCheck2')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{t('ipsrcCheck3')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{t('ipsrcCheck4')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Scheme 3: PM-DAKSH */}
            {(selectedSchemeTab === 'all' || selectedSchemeTab === 'pmdaksh') && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-purple-400 transition-all">
                <div className="flex items-start justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center font-black text-xs">
                      DAKSH
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {t('pmdakshTitle')}
                      </h4>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {t('pmdakshSub')}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
                    {t('pmdakshCount')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {t('pmdakshDesc')}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('inspectionCheckpointsLabel')}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{t('pmdakshCheck1')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{t('pmdakshCheck2')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{t('pmdakshCheck3')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{t('pmdakshCheck4')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Scheme 4: IRCA / NAPDDR */}
            {(selectedSchemeTab === 'all' || selectedSchemeTab === 'irca') && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-sky-400 transition-all">
                <div className="flex items-start justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 flex items-center justify-center font-black text-xs sm:text-sm">
                      IRCA
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                        {t('ircaTitle')}
                      </h4>
                      <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                        {t('ircaSub')}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800">
                    {t('ircaCount')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {t('ircaDesc')}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('inspectionCheckpointsLabel')}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{t('ircaCheck1')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{t('ircaCheck2')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{t('ircaCheck3')}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{t('ircaCheck4')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: STATUTORY GUIDELINES & GFR RULE 150(2) */}
      <section id="guidelines" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-16">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8">
          <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 mb-2.5 border border-sky-200 dark:border-sky-800">
            <Scale className="w-3.5 h-3.5" /> {t('guidelinesBadge')}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('guidelinesTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {t('guidelinesSubtitle')}
          </p>
        </div>

        {/* 3 Core Statutory Framework Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Box 1: GFR Rule 150(2) */}
          <div className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-sky-500/30 dark:border-sky-500/40 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-[#0284c7] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-[#0284c7] uppercase tracking-wider">
              {t('gfrBoxTag')}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {t('gfrBoxTitle')}
            </h4>
            <div className="p-3 my-3 bg-slate-50 dark:bg-slate-800/80 border-l-4 border-[#0284c7] rounded-lg text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 italic leading-relaxed">
              {t('gfrQuote')}
            </div>
            <ul className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 space-y-1.5">
              <li>• {t('gfrPoint1')}</li>
              <li>• {t('gfrPoint2')}</li>
              <li>• {t('gfrPoint3')}</li>
            </ul>
          </div>

          {/* Box 2: CVC Natural Justice Standards */}
          <div className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {t('cvcBoxTag')}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {t('cvcBoxTitle')}
            </h4>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {t('cvcBoxDesc')}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{t('cvcSafeLabel')}</div>
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">15d</span>
                <span>{t('cvcPoint1')}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">2nd</span>
                <span>{t('cvcPoint2')}</span>
              </div>
            </div>
          </div>

          {/* Box 3: Anti-Spoofing & Geofencing SOP */}
          <div className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              {t('sopBoxTag')}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {t('sopBoxTitle')}
            </h4>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {t('sopBoxDesc')}
            </p>
            <ul className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{t('sopPoint1')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{t('sopPoint2')}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{t('sopPoint3')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Reference Circulars Banner (Moderate Sizing) */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#0284c7] uppercase tracking-wider">{t('bannerTitle')}</div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                {t('bannerHeading')}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('bannerDesc')}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/map"
                state={{ from: 'home' }}
                className="px-4 py-2 rounded-lg bg-[#1e293b] hover:bg-[#0f172a] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>{t('bannerBtnMap')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: 4 CORE PILLARS OF COMPLIANCE ENFORCEMENT */}
      <section id="pillars" className="py-12 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-[#0284c7] uppercase tracking-widest">
            {t('pillarsBadge')}
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('pillarsTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5">
            {t('pillarsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-3">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {t('pillar1Title')}
              </h4>
              <ul className="mt-2.5 space-y-1.5 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                <li>• {t('pillar1Point1')}</li>
                <li>• {t('pillar1Point2')}</li>
                <li>• {t('pillar1Point3')}</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-blue-400">
              {t('pillar1Tag')}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {t('pillar2Title')}
              </h4>
              <ul className="mt-2.5 space-y-1.5 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                <li>• {t('pillar2Point1')}</li>
                <li>• {t('pillar2Point2')}</li>
                <li>• {t('pillar2Point3')}</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-amber-600 dark:text-amber-400">
              {t('pillar2Tag')}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center mb-3">
                <FileCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {t('pillar3Title')}
              </h4>
              <ul className="mt-2.5 space-y-1.5 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                <li>• {t('pillar3Point1')}</li>
                <li>• {t('pillar3Point2')}</li>
                <li>• {t('pillar3Point3')}</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-sky-600 dark:text-sky-400">
              {t('pillar3Tag')}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-3">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {t('pillar4Title')}
              </h4>
              <ul className="mt-2.5 space-y-1.5 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400">
                <li>• {t('pillar4Point1')}</li>
                <li>• {t('pillar4Point2')}</li>
                <li>• {t('pillar4Point3')}</li>
              </ul>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-purple-600 dark:text-purple-400">
              {t('pillar4Tag')}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: NATIONAL MONITORING HELPLINE & CONTACT DIRECTORATE */}
      <section id="helpline" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-16 transition-all duration-500">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#334155] via-[#1e293b] to-[#0f172a] text-white shadow-lg border border-slate-700/60 relative overflow-hidden">
          {/* Subtle watermark seal */}
          <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-white/10 pointer-events-none blur-xl" />

          <div className="max-w-2xl mb-6">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold tracking-wider uppercase border border-amber-300/30">
              {t('helplineBadge')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2.5">
              {t('helplineTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
              {t('helplineSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Toll Free */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center mb-3 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-amber-300">
                  {t('helplineTollFreeLabel')}
                </div>
                <a 
                  href="tel:1800110031" 
                  className="text-xl sm:text-2xl font-bold font-mono text-white hover:text-amber-300 transition-colors block mt-1"
                >
                  {t('helplineTollFreeNum')}
                </a>
              </div>
              <div className="text-xs text-blue-100 mt-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{t('helplineTollFreeTime')}</span>
              </div>
            </div>

            {/* Box 2: Direct Lines */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-3 shadow-xs">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-blue-100">
                  {t('helplineDirectLabel')}
                </div>
                <div className="text-sm font-bold font-mono text-white mt-1">
                  {t('helplineDirectNum')}
                </div>
              </div>
              <div className="text-xs text-blue-100 mt-3">
                EPABX Central Exchange
              </div>
            </div>

            {/* Box 3: Email */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center mb-3 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-blue-100">
                  {t('helplineEmailLabel')}
                </div>
                <a 
                  href="mailto:monitoring-dosje@gov.in" 
                  className="text-xs sm:text-sm font-bold font-mono text-white hover:text-amber-300 transition-colors block mt-1 break-all"
                >
                  {t('helplineEmail')}
                </a>
              </div>
              <div className="text-xs text-blue-100 mt-3">
                Official Government NIC Domain
              </div>
            </div>

            {/* Box 4: Physical Location */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center mb-3 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-blue-100">
                  {t('helplineAddressLabel')}
                </div>
                <p className="text-xs text-white mt-1 leading-snug font-medium">
                  {t('helplineAddress')}
                </p>
              </div>
              <div className="text-xs text-blue-100 mt-3">
                Ministry of Social Justice &amp; Empowerment
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs sm:text-[13px] text-blue-100 text-center sm:text-left leading-relaxed">
              Citizens and supported institutions may contact the Helpline for inspection queries, grievance status, and biometric synchronization issues.
            </span>
            <a
              href="tel:1800110031"
              className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('btnCallNow')}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Statutory Safeguard Strip */}
      <div className="bg-slate-800 text-slate-300 py-3 px-4 border-b border-slate-700 text-center text-xs sm:text-[13px] w-full">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2">
          <Scale className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {t('safeguardNotice')}
          </span>
        </div>
      </div>
    </div>
  );
};
