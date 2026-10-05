type ImageThumbProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export default function ImageThumb({ src, alt = '', className = 'h-14 w-20' }: ImageThumbProps) {
  return (
    <div
      className={[
        'shrink-0 overflow-hidden rounded-md border border-[#E2E8F0] bg-[#F1F5F9]',
        className,
      ].join(' ')}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : null}
    </div>
  );
}
