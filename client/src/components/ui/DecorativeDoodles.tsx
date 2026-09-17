import { Sparkles, Sun } from 'lucide-react';

export default function DecorativeDoodles() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {/* Large sun — upper left */}
      <Sun
        size={52}
        strokeWidth={1.1}
        className="absolute left-0 top-3 text-[var(--gold)] opacity-55"
      />

      {/* Small sun — upper area */}
      <Sun
        size={20}
        strokeWidth={1.3}
        className="absolute left-[25%] top-5 rotate-12 text-[var(--gold)] opacity-40"
      />

      {/* Large sparkle — upper right */}
      <Sparkles
        size={34}
        strokeWidth={1.1}
        className="absolute right-[4%] top-0 text-[var(--gold)] opacity-50"
      />

      {/* Small sparkle — near heading */}
      <Sparkles
        size={16}
        strokeWidth={1.2}
        className="absolute right-[19%] top-[22%] rotate-12 text-[var(--gold)] opacity-35"
      />

      {/* Small dot — left */}
      <span className="absolute left-[4%] top-[30%] h-1.5 w-1.5 rounded-full bg-[var(--gold)] opacity-40" />

      {/* Hand-drawn line — left */}
      <svg
        className="absolute left-[10%] top-[23%] h-8 w-20 text-[var(--gold)] opacity-30"
        viewBox="0 0 80 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 18C12 8 20 27 32 16C43 6 55 24 78 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Large sparkle — lower left */}
      <span className="absolute bottom-[7%] left-[7%] text-3xl text-[var(--gold)] opacity-30">
        ✦
      </span>

      {/* Small sparkle — lower middle */}
      <span className="absolute bottom-[5%] left-[42%] text-base text-[var(--gold)] opacity-40">
        ✦
      </span>

      {/* Small sun — lower right */}
      <Sun
        size={20}
        strokeWidth={1.2}
        className="absolute bottom-[10%] right-[17%] rotate-45 text-[var(--gold)] opacity-35"
      />

      {/* Large sun — bottom right */}
      <Sun
        size={44}
        strokeWidth={1.1}
        className="absolute bottom-0 right-0 -rotate-12 text-[var(--gold)] opacity-50"
      />

      {/* Tiny dot cluster — right */}
      <div className="absolute bottom-[16%] right-[7%] flex items-center gap-1.5 opacity-40">
        <span className="h-1 w-1 rounded-full bg-[var(--gold)]" />
        <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
      </div>

      {/* Tiny dot — upper right */}
      <span className="absolute right-[10%] top-[31%] h-1.5 w-1.5 rounded-full bg-[var(--gold)] opacity-35" />
    </div>
  );
}
