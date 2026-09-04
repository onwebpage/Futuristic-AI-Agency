interface BrandLogoProps {
  compact?: boolean;
  larger?: boolean;
  className?: string;
}

export default function BrandLogo({ compact = false, larger = false, className = "" }: BrandLogoProps) {
  const size = compact
    ? larger
      ? { width: 220, offsetX: -49, offsetY: -94, wrapper: "w-[120px] h-[34px]" }
      : { width: 205, offsetX: -46, offsetY: -88, wrapper: "w-[112px] h-8" }
    : larger
      ? { width: 300, offsetX: -67, offsetY: -129, wrapper: "w-[164px] h-11" }
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