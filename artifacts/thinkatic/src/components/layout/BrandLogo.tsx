interface BrandLogoProps {
  compact?: boolean;
  larger?: boolean;
  className?: string;
}

export default function BrandLogo({ compact = false, larger = false, className = "" }: BrandLogoProps) {
  const size = compact
    ? larger
      ? { imageSize: 235, offsetX: -57, offsetY: -105, wrapper: "w-[120px] h-[34px]" }
      : { imageSize: 220, offsetX: -53, offsetY: -99, wrapper: "w-[112px] h-8" }
    : larger
      ? { imageSize: 320, offsetX: -78, offsetY: -143, wrapper: "w-[164px] h-11" }
      : { imageSize: 300, offsetX: -73, offsetY: -134, wrapper: "w-[150px] h-10" };

  return (
    <span className={`relative block overflow-hidden shrink-0 ${size.wrapper} ${className}`}>
      <img
        src="/Thinkatic_logo.jpeg"
        alt="Thinkatic"
        className="absolute max-w-none"
        width={size.imageSize}
        height={size.imageSize}
        style={{ width: size.imageSize, height: size.imageSize, maxWidth: "none", left: size.offsetX, top: size.offsetY }}
      />
    </span>
  );
}