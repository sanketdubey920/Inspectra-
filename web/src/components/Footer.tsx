import React from 'react';
import { ExternalLink, Phone, Mail } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Footer: React.FC = () => {
  const { language } = useTheme();

  return (
    <footer className="bg-[#1e293b] text-slate-300 text-xs sm:text-sm border-t border-slate-700 mt-auto w-full">
      {/* Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-700/80">
          {/* Col 1: Government Authority */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-serif text-[9px] font-black text-amber-300 border border-white/20">
                <div>सत्यमेव<br/>जयते</div>
              </div>
              <div className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                {language === 'hi' ? 'इंस्पेक्ट्रा (INSPECTRA) पोर्टल' : 'INSPECTRA PORTAL'}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'hi' 
                ? 'सामाजिक न्याय और अधिकारिता विभाग, सामाजिक न्याय और अधिकारिता मंत्रालय, भारत सरकार।'
                : 'Department of Social Justice and Empowerment, Ministry of Social Justice and Empowerment, Government of India.'}
            </p>
            <div className="text-xs text-slate-400 pt-1">
              Compliant with GIGW 3.0 &amp; IT Security Guidelines
            </div>
          </div>

          {/* Col 2: Supported Schemes */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
              {language === 'hi' ? 'सांविधिक योजनाएं' : 'Statutory Schemes'}
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>• {language === 'hi' ? 'दीनदयाल दिव्यांग पुनर्वास योजना (DDRS)' : 'Deendayal Rehabilitation Scheme (DDRS)'}</li>
              <li>• {language === 'hi' ? 'वरिष्ठ नागरिकों हेतु एकीकृत कार्यक्रम (IPSrC)' : 'Integrated Programme for Senior Citizens (IPSrC)'}</li>
              <li>• {language === 'hi' ? 'पीएम-दक्ष कौशल सशक्तिकरण (PM-DAKSH)' : 'PM-DAKSH Skill Empowerment'}</li>
              <li>• {language === 'hi' ? 'आईआरसीए नशामुक्ति पुनर्वास (IRCA)' : 'IRCA De-addiction Rehabilitation'}</li>
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
              {language === 'hi' ? 'राष्ट्रीय पोर्टल' : 'National Portals'}
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="https://socialjustice.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                  <span>socialjustice.gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                  <span>{language === 'hi' ? 'सीपीजीआरएएमएस लोक शिकायत (CPGRAMS)' : 'CPGRAMS Public Grievances'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                  <span>{language === 'hi' ? 'भारत का राष्ट्रीय पोर्टल' : 'National Portal of India'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                  <span>{language === 'hi' ? 'आरटीआई ऑनलाइन पोर्टल' : 'RTI Online Gateway'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Helpdesk */}
          <div className="space-y-3">
            <div className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
              {language === 'hi' ? 'राष्ट्रीय हेल्पडेस्क' : 'National Helpdesk'}
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="font-bold text-white">{language === 'hi' ? 'टोल फ्री: 1800-11-0031' : 'Toll Free: 1800-11-0031'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>monitoring-dosje@gov.in</span>
              </div>
              <div className="text-xs text-slate-400 pt-1">
                {language === 'hi' ? 'सोम - शनि (प्रातः 09:30 से सायं 06:00 बजे तक)' : 'Mon - Sat (09:30 AM to 06:00 PM IST)'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 text-xs text-slate-400">
          <div>
            {language === 'hi'
              ? 'वेबसाइट सामग्री प्रबंधन सामाजिक न्याय और अधिकारिता विभाग, भारत सरकार। राष्ट्रीय सूचना विज्ञान केंद्र (NIC) / पीएमयू द्वारा विकसित एवं होस्टेड।'
              : 'Website Content Managed by Department of Social Justice & Empowerment, Government of India. Designed, Developed & Hosted by National Informatics Centre (NIC) / Project Monitoring Unit (PMU).'}
          </div>
          <div className="shrink-0 flex items-center gap-3 font-mono text-xs text-slate-400">
            <span>{language === 'hi' ? 'अंतिम अद्यतन: 18 सित 2026' : 'Last Updated: 18 Sep 2026'}</span>
            <span>•</span>
            <span>v2.4.1 NIC-Gov</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
