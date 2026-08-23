export function TechStack() {
  const techs = [
    "OpenAI", "Anthropic", "LangChain", "PyTorch", "TensorFlow", 
    "Hugging Face", "FastAPI", "PostgreSQL", "AWS", "GCP", 
    "Docker", "Kubernetes", "React", "Node.js", "Python"
  ];

  return (
    <section className="py-24 overflow-hidden border-t border-white/5 bg-background">
      <div className="flex w-[200%] animate-[marquee_20s_linear_infinite]">
        <div className="flex w-1/2 justify-around items-center">
          {techs.map((tech, i) => (
            <span key={i} className="text-2xl md:text-4xl font-display font-bold text-white/10 mx-8 uppercase tracking-wider">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex w-1/2 justify-around items-center">
          {techs.map((tech, i) => (
            <span key={`dup-${i}`} className="text-2xl md:text-4xl font-display font-bold text-white/10 mx-8 uppercase tracking-wider">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
