import Image from 'next/image';

interface IdeofestLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Official Ideofest logo component
 */
export default function IdeofestLogo({
  width = 140,
  height = 40,
  className = '',
}: IdeofestLogoProps) {
  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      <Image
        src="/ideofest-logo.jpg"
        alt="Ideofest Logo"
        width={width}
        height={height}
        className="h-10 w-auto object-contain rounded-lg shrink-0"
        priority
      />
    </div>
  );
}
