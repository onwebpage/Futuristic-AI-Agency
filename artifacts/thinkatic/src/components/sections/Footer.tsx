import { Linkedin, Instagram } from 'lucide-react';

function ThinkaticLogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 22 26" width="22" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradFooter" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#47A3FF" />
            <stop offset="100%" stopColor="#4040E8" />
          </linearGradient>
        </defs>
        <path d="M0 0 H13 V5 H6 V26 H0 Z" fill="url(#logoGradFooter)" />
        <path d="M15 0 H22 V5 H15 Z" fill="url(#logoGradFooter)" opacity="0.75" />
      </svg>
      <span className="text-xl font-display font-bold text-white tracking-tight" style={{ letterSpacing: "-0.01em" }}>
        Thinkatic
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#020204] py-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <ThinkaticLogoMark />
          <div className="text-muted-foreground mt-2">Building Intelligent AI Solutions</div>
        </div>
        
        <div className="flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#services" className="hover:text-primary transition-colors">Services</a>
          <a href="#process" className="hover:text-primary transition-colors">Process</a>
          <a href="#work" className="hover:text-primary transition-colors">Work</a>
          <a href="#about" className="hover:text-primary transition-colors">Contact</a>
        </div>

        <div className="flex gap-6">
          <a href="https://www.linkedin.com/company/thinkatic/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors"><Linkedin size={20} /></a>
          <a href="https://www.instagram.com/thinkaticai?igsh=MWxuY2R4Ym5idGUzYg==" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors"><Instagram size={20} /></a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-16 text-center text-sm text-muted-foreground/50">
        © 2025 Thinkatic. All rights reserved.
      </div>
    </footer>
  );
}
