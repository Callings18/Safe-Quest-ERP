export function BrandLogo({
  className = "h-10 w-10",
  alt = "SafeQuest",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`rounded-full object-cover bg-[#0B1F4A] ${className}`}
    />
  );
}
