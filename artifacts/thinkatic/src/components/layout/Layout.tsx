import React from "react";
import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ChatBot from "@/components/ui/ChatBot";
import { useLocation } from "wouter";
import { useSEO } from "@/hooks/useSEO";

const ROUTE_SEO: Record<string, { title: string; description: string }> = {
  "/": { title: "AI-Powered BPO & Enterprise Technology Solutions", description: "Thinkatic combines AI, human expertise, and operational excellence to modernize enterprise business processes." },
  "/about": { title: "About Thinkatic", description: "Learn how Thinkatic helps enterprises scale operations with AI-powered BPO and technology solutions." },
  "/services": { title: "Services", description: "Explore Thinkatic's AI, software development, and business process outsourcing services." },
  "/case-studies": { title: "Case Studies", description: "See how Thinkatic delivers measurable outcomes through AI, technology, and BPO partnerships." },
  "/process": { title: "Our Process", description: "Discover Thinkatic's structured process for delivering secure, scalable AI and BPO solutions." },
  "/contact": { title: "Contact Thinkatic", description: "Talk with Thinkatic about AI-powered BPO, enterprise technology, and operational transformation." },
  "/pricing": { title: "Pricing", description: "Review Thinkatic service packages and find the right engagement model for your business." },
  "/faq": { title: "Frequently Asked Questions", description: "Answers about Thinkatic's AI-powered BPO services, technology, process, and security." },
  "/blog": { title: "Insights", description: "Read Thinkatic insights on AI, outsourcing, automation, and enterprise operations." },
  "/careers": { title: "Careers", description: "Join Thinkatic and help build the future of AI-powered business operations." },
  "/technology": { title: "Technology", description: "Explore the secure AI and enterprise technology foundations behind Thinkatic solutions." },
  "/request-proposal": { title: "Request a Proposal", description: "Tell Thinkatic about your goals and request a tailored AI, technology, or BPO proposal." },
  "/apply-online": { title: "Apply Online", description: "Apply to join Thinkatic's growing team of BPO, technology, and AI professionals." },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  useLenis();
  const [location] = useLocation();
  const seo = ROUTE_SEO[location] ?? (location.startsWith("/services/")
    ? { title: "Service Details", description: "Explore a Thinkatic service designed for secure, scalable business transformation." }
    : { title: "Thinkatic", description: "Thinkatic delivers AI-powered BPO and enterprise technology solutions." });
  useSEO({ ...seo, path: location });

  return (
    <div className="bg-background min-h-[100dvh] text-foreground overflow-x-hidden font-sans selection:bg-primary/30 selection:text-primary">
      <ScrollToTop />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
