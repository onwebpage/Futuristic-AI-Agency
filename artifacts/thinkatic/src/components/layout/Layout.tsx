import React from "react";
import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import ChatBot from "@/components/ui/ChatBot";

export default function Layout({ children }: { children: React.ReactNode }) {
  useLenis();
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
