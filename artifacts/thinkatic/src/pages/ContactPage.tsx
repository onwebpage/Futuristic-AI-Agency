import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronRight,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Cpu,
  HeadphonesIcon,
  Users,
  Briefcase,
  ShieldCheck,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Building,
} from "lucide-react";
import ScrollToTop from "@/components/layout/ScrollToTop";
import {
  FormInput,
  FormTextarea,
  FormSelect,
  ErrorBanner,
} from "@/components/forms/FormField";
import { CountrySelector } from "@/components/forms/CountrySelector";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ─── Schema ───────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company name is required"),
  country: z.string().min(1, "Please select your country"),
  phone: z.string().optional(),
});

const step2Schema = z.object({
  department: z.string().min(1, "Please select a department"),
  serviceInterest: z.string().min(1, "Please select a service"),
  budget: z.string().optional(),
  message: z.string().min(10, "Please tell us a bit more (min 10 characters)"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

// ─── Department cards ─────────────────────────────────────────────────────────

const departments = [
  { id: "bpo",   label: "BPO Operations",  icon: HeadphonesIcon, desc: "Support, healthcare, back-office" },
  { id: "tech",  label: "Technology",      icon: Cpu,            desc: "AI, software, automation" },
  { id: "sales", label: "Sales & Growth",  icon: Users,          desc: "SDR, lead gen, partnerships" },
  { id: "hr",    label: "Human Resources", icon: Briefcase,      desc: "Hiring, onboarding" },
];

function DepartmentCard({
  dept,
  selected,
  onSelect,
}: {
  dept: typeof departments[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = dept.icon;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative flex flex-col gap-2.5 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
        selected
          ? "bg-blue-50/90 border-[#1E40AF] ring-2 ring-[#1E40AF]/15 shadow-sm"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            selected
              ? "bg-[#1E40AF] text-white shadow-xs"
              : "bg-blue-50 text-[#1E40AF] border border-blue-200/60"
          }`}
        >
          <Icon size={16} />
        </div>
        <span className={`text-sm font-bold transition-colors ${selected ? "text-slate-900" : "text-slate-800"}`}>
          {dept.label}
        </span>
      </div>
      <p className="text-xs text-slate-500 pl-12 leading-relaxed font-normal">{dept.desc}</p>
      {selected && (
        <motion.div
          layoutId="dept-check"
          className="absolute top-3.5 right-3.5 w-4 h-4 rounded-full bg-[#1E40AF] text-white flex items-center justify-center shadow-xs"
        >
          <svg viewBox="0 0 8 6" fill="none" className="w-2.5 h-2.5">
            <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

// ─── Business info cards ──────────────────────────────────────────────────────

const businessInfo = [
  {
    icon: MapPin,
    label: "Office",
    lines: ["Magarpatta City, Pune", "Maharashtra 411013, India"],
  },
  {
    icon: Phone,
    label: "Phone",
    lines: ["+91 (726) 387-4459"],
    href: "tel:+917263874459",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["Thinkaticai@gmail.com"],
    href: "mailto:Thinkaticai@gmail.com",
  },
  {
    icon: Clock,
    label: "Hours",
    lines: ["Mon – Fri: 9 AM – 7 PM IST", "24/7 AI Support available"],
  },
];

// ─── Google Map embed ─────────────────────────────────────────────────────────

function GoogleMapEmbed() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
      <div className="aspect-[16/8]">
        <iframe
          title="Thinkatic Office - Magarpatta City, Pune"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.693553779744!2d73.93108487521395!3d18.516726282585963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c18b4551359b%3A0x5e4a8a5c0e5e1a1a!2sMagarpatta%20City%2C%20Hadapsar%2C%20Pune%2C%20Maharashtra%20411028!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0, filter: "contrast(1.02) saturate(0.85)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {/* Overlay pin label */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3.5 py-2 rounded-xl backdrop-blur-md bg-white/95 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#1E40AF]" />
          <span className="text-xs font-semibold text-slate-800">Magarpatta City, Pune</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Tech Center</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContactPage() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [selectedDept, setSelectedDept] = useState("");

  // Pre-fill from query string
  const [prefillMessage, setPrefillMessage] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const project = params.get("project");
    const type = params.get("type");
    if (project) setPrefillMessage(`Hi, I'd like to discuss: ${project}`);
    if (type === "proposal") setPrefillMessage("I'd like to request a project proposal from Thinkatic.");
  }, []);

  // Step 1 form
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", email: "", company: "", country: "", phone: "" },
  });

  // Step 2 form
  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      department: "",
      serviceInterest: "",
      budget: "",
      message: prefillMessage,
    },
  });

  // Sync prefill into form2 message
  useEffect(() => {
    if (prefillMessage) form2.setValue("message", prefillMessage);
  }, [prefillMessage, form2]);

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onStep2 = async (data: Step2Data) => {
    if (!step1Data) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: step1Data.name,
          email: step1Data.email,
          company: step1Data.company,
          phone: step1Data.phone,
          country: step1Data.country,
          budget: data.budget,
          serviceInterest: data.serviceInterest,
          department: data.department,
          message: data.message,
          source: "contact_form_v2",
        }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? "Failed to send");
      }
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    form1.reset();
    form2.reset();
    setStep(0);
    setStatus("idle");
    setErrorMsg("");
    setStep1Data(null);
    setSelectedDept("");
  };

  const stepLabels = ["Your Info", "Project"];

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9] relative overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32">
        {/* Ambient Subtle Background Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(30,64,175,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(30,64,175,0.02) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient Soft Radial Illumination */}
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(30,64,175,0.04) 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

          {/* ── Breadcrumb ── */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="flex items-center gap-2 text-slate-500 text-xs font-mono mb-8"
          >
            <Link href="/" className="hover:text-[#1E40AF] transition-colors font-medium">
              Home
            </Link>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-[#1E40AF] font-bold">Contact</span>
          </motion.nav>

          {/* ── Page Header Hero ── */}
          <div className="mb-14 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/70 mb-5 shadow-2xs"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.22em] text-[#1E40AF]">
                Let's talk
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.08 }}
              className="font-display font-black text-slate-900 leading-[1.02] tracking-tight mb-5"
              style={{ fontSize: "clamp(2.5rem, 5.2vw, 4.5rem)" }}
            >
              Let's Build Something
              <br />
              <span className="text-[#1E40AF]">
                Exceptional.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.16 }}
              className="text-base md:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed"
            >
              Whether you're exploring AI automation, scaling operations, or building enterprise software — we turn complex challenges into measurable results.
            </motion.p>
          </div>

          {/* ── Main 2-Column Command Hub ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ── Left Column: Executive Liaison & Location (5 cols) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
              className="lg:col-span-5 flex flex-col gap-6"
            >
              {/* Business Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                {businessInfo.map((info) => {
                  const Icon = info.icon;
                  const cardContent = (
                    <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200/90 bg-white/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50/90 border border-blue-200/60 text-[#1E40AF] group-hover:scale-105 transition-transform">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">
                          {info.label}
                        </p>
                        {info.lines.map((line, idx) => (
                          <p
                            key={idx}
                            className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-[#1E40AF] transition-colors truncate"
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  );

                  return info.href ? (
                    <a key={info.label} href={info.href} className="block cursor-pointer">
                      {cardContent}
                    </a>
                  ) : (
                    <div key={info.label}>{cardContent}</div>
                  );
                })}
              </div>

              {/* Google Map Embed */}
              <GoogleMapEmbed />

              {/* Enterprise Assurance Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} className="text-[#1E40AF]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    Enterprise Assurance Standards
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    SOC 2 Type II
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ISO 27001 Certified
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    GDPR & HIPAA Ready
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    &lt;24h Response SLA
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── Right Column: The Executive Engagement Console (7 cols) ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease, delay: 0.25 }}
              className="lg:col-span-7"
            >
              <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-7 sm:p-10 lg:p-12 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.07)] relative overflow-hidden">
                {/* Subtle micro background grid watermark */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(30,64,175,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,64,175,0.03) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />

                <div className="relative z-10">
                  <AnimatePresence mode="wait">

                    {/* ── Success State ── */}
                    {status === "success" ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease }}
                        className="flex flex-col items-center text-center py-12 px-4 gap-6"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shadow-xs">
                          <CheckCircle2 size={32} />
                        </div>
                        <div>
                          <h2 className="font-display font-black text-slate-900 text-2xl sm:text-3xl mb-2">
                            Message received.
                          </h2>
                          <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                            Thanks{step1Data?.name ? `, ${step1Data.name.split(" ")[0]}` : ""}. We'll review your request and be in touch within 24 hours.
                          </p>
                        </div>
                        <button
                          onClick={reset}
                          className="mt-2 text-sm font-semibold text-[#1E40AF] hover:underline underline-offset-4 cursor-pointer"
                        >
                          Send another message
                        </button>
                      </motion.div>

                    ) : step === 0 ? (
                      /* ── Step 1: Contact Info ── */
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35, ease }}
                      >
                        {/* High-End Step Progress HUD */}
                        <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-[#1E40AF] text-white text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                              01
                            </span>
                            <div>
                              <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                                Step 1 of 2: {stepLabels[0]}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">Next: Project Scope</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md">
                            2 min setup
                          </span>
                        </div>

                        <div className="mb-8">
                          <h2 className="font-display font-bold text-slate-900 text-2xl sm:text-3xl mb-2 leading-tight">
                            Start with your<br />contact details
                          </h2>
                          <p className="text-slate-600 text-sm font-normal">
                            We'll use this to reach out personally.
                          </p>
                        </div>

                        <form onSubmit={form1.handleSubmit(onStep1)} className="flex flex-col gap-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                              label="Full Name"
                              required
                              placeholder="Jane Smith"
                              error={form1.formState.errors.name?.message}
                              {...form1.register("name")}
                            />
                            <FormInput
                              label="Work Email"
                              required
                              type="email"
                              placeholder="jane@company.com"
                              error={form1.formState.errors.email?.message}
                              {...form1.register("email")}
                            />
                          </div>

                          <FormInput
                            label="Company"
                            required
                            placeholder="Acme Corporation"
                            error={form1.formState.errors.company?.message}
                            {...form1.register("company")}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CountrySelector
                              label="Country"
                              required
                              value={form1.watch("country")}
                              onChange={(code) => form1.setValue("country", code, { shouldValidate: true })}
                              error={form1.formState.errors.country?.message}
                              placeholder="Select country"
                            />
                            <FormInput
                              label="Phone (optional)"
                              type="tel"
                              placeholder="+1 (555) 000-0000"
                              {...form1.register("phone")}
                            />
                          </div>

                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-4 flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-sm text-white bg-[#1E40AF] hover:bg-[#1D4ED8] transition-all shadow-[0_4px_20px_rgba(30,64,175,0.25)] cursor-pointer"
                          >
                            Continue
                            <ArrowRight size={15} />
                          </motion.button>
                        </form>
                      </motion.div>

                    ) : (
                      /* ── Step 2: Project Details ── */
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35, ease }}
                      >
                        {/* High-End Step Progress HUD */}
                        <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-[#1E40AF] text-white text-xs font-mono font-bold flex items-center justify-center shadow-xs">
                              02
                            </span>
                            <div>
                              <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                                Step 2 of 2: {stepLabels[1]}
                              </p>
                              <p className="text-[11px] text-slate-500 font-mono">Final Step</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-md">
                            Direct Routing
                          </span>
                        </div>

                        <div className="mb-8">
                          <h2 className="font-display font-bold text-slate-900 text-2xl sm:text-3xl mb-2 leading-tight">
                            Tell us about<br />your project
                          </h2>
                          <p className="text-slate-600 text-sm font-normal">
                            Help us route you to the right team.
                          </p>
                        </div>

                        <form onSubmit={form2.handleSubmit(onStep2)} className="flex flex-col gap-5">
                          {/* Department selection */}
                          <div>
                            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-600 font-bold mb-3">
                              Department <span className="text-[#1E40AF]">*</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {departments.map((dept) => (
                                <DepartmentCard
                                  key={dept.id}
                                  dept={dept}
                                  selected={selectedDept === dept.id}
                                  onSelect={() => {
                                    setSelectedDept(dept.id);
                                    form2.setValue("department", dept.id, { shouldValidate: true });
                                  }}
                                />
                              ))}
                            </div>
                            {form2.formState.errors.department && (
                              <p className="mt-2 text-[11px] text-red-500 flex items-center gap-1.5 font-medium">
                                <span>⚠</span> {form2.formState.errors.department.message}
                              </p>
                            )}
                          </div>

                          <FormSelect
                            label="Service Interest"
                            required
                            error={form2.formState.errors.serviceInterest?.message}
                            {...form2.register("serviceInterest")}
                          >
                            <optgroup label="BPO Services">
                              <option value="Healthcare BPO">Healthcare BPO</option>
                              <option value="Customer Support Outsourcing">Customer Support</option>
                              <option value="Sales & Lead Generation">Sales &amp; Lead Generation</option>
                              <option value="Back Office Operations">Back Office Operations</option>
                              <option value="AI-Powered BPO">AI-Powered BPO</option>
                            </optgroup>
                            <optgroup label="Technology">
                              <option value="AI Development & Integration">AI Development &amp; Integration</option>
                              <option value="Custom Software Development">Custom Software</option>
                              <option value="Automation & RPA">Automation &amp; RPA</option>
                              <option value="AI Consulting">AI Consulting &amp; Strategy</option>
                            </optgroup>
                            <option value="General Inquiry">Not sure / General Inquiry</option>
                          </FormSelect>

                          <FormSelect
                            label="Monthly Budget"
                            {...form2.register("budget")}
                          >
                            <option value="">Prefer not to say</option>
                            <option value="Under $2,000">Under $2,000 / mo</option>
                            <option value="$2,000–$5,000">$2,000–$5,000 / mo</option>
                            <option value="$5,000–$15,000">$5,000–$15,000 / mo</option>
                            <option value="$15,000–$50,000">$15,000–$50,000 / mo</option>
                            <option value="$50,000+">$50,000+ / mo</option>
                          </FormSelect>

                          <FormTextarea
                            label="Message"
                            required
                            placeholder="Tell us about your project, goals, and timeline…"
                            rows={4}
                            error={form2.formState.errors.message?.message}
                            {...form2.register("message")}
                          />

                          {status === "error" && <ErrorBanner message={errorMsg} />}

                          <div className="flex items-center gap-3 mt-3">
                            <button
                              type="button"
                              onClick={() => setStep(0)}
                              className="flex items-center gap-1.5 px-6 py-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-white hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
                            >
                              ← Back
                            </button>
                            <motion.button
                              type="submit"
                              disabled={status === "submitting"}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-display font-bold text-sm text-white bg-[#1E40AF] hover:bg-[#1D4ED8] transition-all shadow-[0_4px_20px_rgba(30,64,175,0.25)] disabled:opacity-60 cursor-pointer"
                            >
                              {status === "submitting" ? (
                                <>
                                  <Loader2 size={15} className="animate-spin" /> Sending…
                                </>
                              ) : (
                                <>
                                  <MessageSquare size={15} /> Send Message
                                </>
                              )}
                            </motion.button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Trust Note */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500 px-2">
                <span>Enterprise encryption · Zero data retention guarantee</span>
                <div className="flex items-center gap-3">
                  <Link href="/privacy-policy" className="hover:text-[#1E40AF] transition-colors">
                    Privacy Policy
                  </Link>
                  <span>·</span>
                  <Link href="/terms" className="hover:text-[#1E40AF] transition-colors">
                    Terms
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
