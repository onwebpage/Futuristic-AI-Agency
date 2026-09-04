interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  const size = compact
    ? { width: 205, offsetX: -46, offsetY: -88, wrapper: "w-[112px] h-8" }
    : { width: 275, offsetX: -62, offsetY: -118, wrapper: "w-[150px] h-10" };

  return (
    <span className={`relative block overflow-hidden shrink-0 ${size.wrapper} ${className}`}>
      <img
        src="/Thinkatic_logo.jpeg"
        alt="Thinkatic"
        className="absolute max-w-none"
        width={size.width}
        height={size.width}
        style={{ left: size.offsetX, top: size.offsetY }}
      />
    </span>
  );
}