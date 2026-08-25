import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronRight, ArrowRight, MapPin, Phone, Mail, Clock,
  Building2, Cpu, HeadphonesIcon, Activity, Users, Briefcase,
  Zap, Globe, MessageSquare, Loader2,
} from "lucide-react";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { FormInput, FormTextarea, FormSelect, StepIndicator, SuccessState, ErrorBanner } from "@/components/forms/FormField";
import { CountrySelector } from "@/components/forms/CountrySelector";

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

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
  { id: "bpo",  label: "BPO Operations",  icon: HeadphonesIcon, desc: "Support, healthcare, back-office" },
  { id: "tech", label: "Technology",       icon: Cpu,            desc: "AI, software, automation" },
  { id: "sales",label: "Sales & Growth",  icon: Users,          desc: "SDR, lead gen, partnerships" },
  { id: "hr",   label: "Human Resources", icon: Briefcase,      desc: "Hiring, onboarding" },
];

function DepartmentCard({ dept, selected, onSelect }: {
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
      whileTap={{ scale: 0.97 }}
      className="relative flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer"
      style={{
        background: selected ? "rgba(33,78,207,0.08)" : "rgba(255,255,255,0.03)",
        borderColor: selected ? "rgba(71,163,255,0.45)" : "rgba(33,78,207,0.06)",
        boxShadow: selected ? "0 0 20px rgba(71,163,255,0.10)" : "none",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
          style={{
            background: selected ? "rgba(33,78,207,0.14)" : "rgba(33,78,207,0.04)",
          }}
        >
          <Icon size={14} className={selected ? "text-[#214ECF]" : "text-muted-foreground"} />
        </div>
        <span className={`text-sm font-semibold transition-colors ${selected ? "text-foreground" : "text-muted-foreground"}`}>
          {dept.label}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground pl-10 leading-relaxed">{dept.desc}</p>
      {selected && (
        <motion.div
          layoutId="dept-check"
          className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: "#214ECF" }}
        >
          <svg viewBox="0 0 8 6" fill="none" className="w-2.5 h-2.5">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

// ─── Left panel background ────────────────────────────────────────────────────

function PanelBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: "#FFFFFF" }} />
      <motion.div
        animate={{ x: [0, 30, -15, 0], y: [0, -20, 15, 0], scale: [1, 1.12, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle at 40% 40%, rgba(30,80,160,0.75) 0%, rgba(10,30,80,0.4) 45%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -40, 25, 0], y: [0, 35, -15, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle at 60% 60%, rgba(60,30,130,0.65) 0%, rgba(30,10,70,0.35) 45%, transparent 70%)",
          filter: "blur(65px)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

// ─── Google Map embed ─────────────────────────────────────────────────────────

function GoogleMapEmbed() {
  return (
    <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(33,78,207,0.06)" }}>
      <div className="aspect-[16/7]">
        <iframe
          title="Thinkatic Office - Magarpatta City, Pune"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.693553779744!2d73.93108487521395!3d18.516726282585963!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c18b4551359b%3A0x5e4a8a5c0e5e1a1a!2sMagarpatta%20City%2C%20Hadapsar%2C%20Pune%2C%20Maharashtra%20411028!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
          width="100%"
          height="100%"
          style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.85) contrast(1.1)" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {/* Overlay pin label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm"
        style={{ background: "rgba(255, 255, 255, 0.9)", border: "1px solid rgba(33,78,207,0.12)" }}>
        <MapPin size={13} className="text-[#214ECF]" />
        <span className="text-xs text-muted-foreground">Magarpatta City, Pune</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
      <div className="min-h-[100dvh] flex flex-col lg:flex-row">

        {/* ── LEFT PANEL ── */}
        <div className="relative lg:w-[46%] lg:min-h-[100dvh] flex flex-col justify-between p-8 lg:p-14 xl:p-16 overflow-hidden">
          <PanelBackground />

          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="relative z-10 flex items-center gap-1.5 text-muted-foreground text-xs font-mono"
          >
            <Link href="/" className="hover:text-muted-foreground transition-colors">Home</Link>
            <ChevronRight size={11} />
            <span className="text-muted-foreground">Contact</span>
          </motion.nav>

          {/* Main content */}
          <div className="relative z-10 mt-12 lg:mt-0 flex flex-col justify-center flex-1">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.p
                variants={fadeUp}
                className="text-xs font-mono uppercase tracking-[0.22em] mb-5"
                style={{ color: "#214ECF" }}
              >
                Let's talk
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="font-display font-black text-foreground leading-[1.0] mb-8"
                style={{ fontSize: "clamp(2.6rem,5.5vw,4.5rem)" }}
              >
                Let's Build<br />
                Something<br />
                <span className="text-gradient">Exceptional.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-10">
                Whether you're exploring AI automation, scaling operations, or building enterprise software — we turn complex challenges into measurable results.
              </motion.p>

              {/* Business info cards */}
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {businessInfo.map((info) => {
                  const Icon = info.icon;
                  const content = (
                    <div
                      key={info.label}
                      className="flex items-start gap-3 p-3.5 rounded-2xl border group transition-all duration-200 hover:border-border"
                      style={{ background: "rgba(244,247,255,0.8)", borderColor: "rgba(255,255,255,0.07)" }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(71,163,255,0.10)" }}>
                        <Icon size={13} className="text-[#214ECF]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1">{info.label}</p>
                        {info.lines.map((l, i) => (
                          <p key={i} className="text-xs text-muted-foreground leading-relaxed group-hover:text-muted-foreground transition-colors">{l}</p>
                        ))}
                      </div>
                    </div>
                  );
                  return info.href
                    ? <a key={info.label} href={info.href}>{content}</a>
                    : <div key={info.label}>{content}</div>;
                })}
              </motion.div>

              {/* Map */}
              <motion.div variants={fadeUp}>
                <GoogleMapEmbed />
              </motion.div>
            </motion.div>
          </div>

          {/* Footer link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative z-10 mt-10 flex items-center gap-4 text-muted-foreground text-xs"
          >
            <Link href="/privacy-policy" className="hover:text-muted-foreground transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div className="flex-1 lg:min-h-[100dvh] flex items-start lg:items-center justify-center p-6 sm:p-10 lg:p-14 xl:p-16"
          style={{ background: "hsl(0 0% 5%)" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease }}
            className="w-full max-w-lg"
          >
            <AnimatePresence mode="wait">

              {/* ── Success ── */}
              {status === "success" ? (
                <motion.div key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <SuccessState
                    title="Message received."
                    message={`Thanks${step1Data?.name ? `, ${step1Data.name.split(" ")[0]}` : ""}. We'll review your request and be in touch within 24 hours.`}
                    onReset={reset}
                    resetLabel="Send another message"
                  />
                </motion.div>

              ) : step === 0 ? (
                /* ── Step 1: Contact Info ── */
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <div className="mb-8">
                    <StepIndicator step={0} total={2} labels={stepLabels} />
                  </div>

                  <h2 className="font-display font-bold text-foreground text-2xl sm:text-3xl mb-2 leading-tight">
                    Start with your<br />contact details
                  </h2>
                  <p className="text-muted-foreground text-sm mb-8">We'll use this to reach out personally.</p>

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
                      className="mt-2 flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-foreground transition-all"
                      style={{ background: "linear-gradient(135deg,#214ECF,#214ECF)", boxShadow: "0 0 28px rgba(71,163,255,0.25)" }}
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
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease }}
                >
                  <div className="mb-8">
                    <StepIndicator step={1} total={2} labels={stepLabels} />
                  </div>

                  <h2 className="font-display font-bold text-foreground text-2xl sm:text-3xl mb-2 leading-tight">
                    Tell us about<br />your project
                  </h2>
                  <p className="text-muted-foreground text-sm mb-8">Help us route you to the right team.</p>

                  <form onSubmit={form2.handleSubmit(onStep2)} className="flex flex-col gap-5">

                    {/* Department cards */}
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
                        Department <span className="text-[#214ECF]">*</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {departments.map(dept => (
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
                        <p className="mt-2 text-[11px] text-red-400 flex items-center gap-1.5">
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
                      rows={5}
                      error={form2.formState.errors.message?.message}
                      {...form2.register("message")}
                    />

                    {status === "error" && <ErrorBanner message={errorMsg} />}

                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="flex items-center gap-1.5 px-5 py-3.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-white/25 transition-all"
                      >
                        ← Back
                      </button>
                      <motion.button
                        type="submit"
                        disabled={status === "submitting"}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-foreground transition-all disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg,#214ECF,#214ECF)", boxShadow: "0 0 28px rgba(71,163,255,0.25)" }}
                      >
                        {status === "submitting" ? (
                          <><Loader2 size={15} className="animate-spin" /> Sending…</>
                        ) : (
                          <><MessageSquare size={15} /> Send Message</>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
}
