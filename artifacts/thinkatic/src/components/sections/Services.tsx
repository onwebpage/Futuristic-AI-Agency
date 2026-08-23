import { motion } from 'framer-motion';

const services = [
  "Custom AI Software Development",
  "Generative AI Development",
  "AI Automation Solutions",
  "Machine Learning Development",
  "AI SaaS Product Development",
  "AI Mobile App Development",
  "Enterprise AI Solutions",
  "UI/UX Design for AI Products",
  "Web Design & Development",
  "AI Consulting & Strategy"
];

export function Services() {
  return (
    <section id="services" className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Capabilities</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">End-to-end artificial intelligence development, tailored to your operational needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative h-48 rounded-2xl glass-panel p-8 flex flex-col justify-end overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <h3 className="text-xl font-display font-semibold relative z-10 group-hover:text-primary transition-colors">{service}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
