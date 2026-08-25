import { Linkedin, Instagram } from 'lucide-react';

function ThinkaticLogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 22 26" width="22" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradFooter" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#214ECF" />
            <stop offset="100%" stopColor="#214ECF" />
          </linearGradient>
        </defs>
        <path d="M0 0 H13 V5 H6 V26 H0 Z" fill="url(#logoGradFooter)" />
        <path d="M15 0 H22 V5 H15 Z" fill="url(#logoGradFooter)" opacity="0.75" />
      </svg>
      <span className="text-xl font-display font-bold text-foreground tracking-tight" style={{ letterSpacing: "-0.01em" }}>
        Thinkatic
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-white py-16 border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <ThinkaticLogoMark />
          <div className="text-slate-600 mt-2">Building Intelligent AI Solutions</div>
        </div>
        
        <div className="flex gap-8 text-sm font-medium text-slate-600">
          <a href="#services" className="hover:text-[#214ECF] transition-colors">Services</a>
          <a href="#process" className="hover:text-[#214ECF] transition-colors">Process</a>
          <a href="#work" className="hover:text-[#214ECF] transition-colors">Work</a>
          <a href="#about" className="hover:text-[#214ECF] transition-colors">Contact</a>
        </div>

        <div className="flex gap-6">
          <a href="https://www.linkedin.com/company/thinkatic/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#214ECF] transition-colors"><Linkedin size={20} /></a>
          <a href="https://www.instagram.com/thinkaticai?igsh=MWxuY2R4Ym5idGUzYg==" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[#214ECF] transition-colors"><Instagram size={20} /></a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 text-center text-sm text-slate-500">
        © 2025 Thinkatic. All rights reserved.
      </div>
    </footer>
  );
}
