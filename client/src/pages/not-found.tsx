import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, House } from 'lucide-react';
import { NOT_FOUND_PAGE_TITLE, publicDocumentTitle } from '@/constants/pageTitles';

export default function NotFound() {
  useEffect(() => {
    document.title = publicDocumentTitle(NOT_FOUND_PAGE_TITLE);
  }, []);

  return (
    <main className="overflow-hidden bg-[#FAF7F2] text-[#241718]">
      <section className="relative flex min-h-[calc(100svh-var(--navbar-height,96px))] items-center">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D6A13A]/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#7E1518]/5"
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 md:px-10 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12">
          {/* Main message */}
          <div className="order-2 lg:order-1">

            <p className="mt-8 font-serif text-7xl font-bold leading-none tracking-tight text-[#7E1518] md:text-8xl">
              404
            </p>

            <h1 className="mt-5 max-w-xl font-serif text-4xl font-semibold leading-tight md:text-5xl">
              Oops! Looks like you took a wrong turn.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-8 text-[#665958] md:text-lg">
              Even the best explorers get lost sometimes! The page you're
              looking for may have moved. Let's get you back on track.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#7E1518] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#621013] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7E1518]"
              >
                <House size={17} />
                Back to Home
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-[#7E1518]/20 bg-white px-6 text-sm font-semibold text-[#7E1518] transition-colors hover:border-[#7E1518] hover:bg-[#7E1518]/5"
              >
                <ArrowLeft size={16} />
                Contact Us
              </Link>
            </div>

            <p className="mt-8 text-sm text-[#897A75]">
              Every great journey starts somewhere. Let's find yours.
            </p>
          </div>

          {/* Friendly illustration */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-5 rounded-full bg-[#EDE2D4]" />

              <div className="relative flex aspect-square items-center justify-center">
                <div className="absolute right-[13%] top-[13%] h-16 w-16 rounded-full bg-[#D6A13A]/20" />
                <div className="absolute left-[12%] top-[24%] h-5 w-5 rounded-full bg-[#D6A13A]" />
                <div className="absolute right-[18%] top-[35%] text-3xl text-[#7E1518]/60">
                  ✳
                </div>

                {/* Open book */}
                <svg
                  viewBox="0 0 360 300"
                  className="relative z-10 w-[88%] drop-shadow-sm"
                  fill="none"
                  role="img"
                  aria-label="Illustration of an open book with a friendly school mascot"
                >
                  <path
                    d="M38 112 Q100 82 175 125 L175 237 Q105 199 38 222 Z"
                    fill="#FFFFFF"
                    stroke="#7E1518"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M175 125 Q245 82 322 112 L322 222 Q247 199 175 237 Z"
                    fill="#FFFDF9"
                    stroke="#7E1518"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M175 125 V237"
                    stroke="#D6A13A"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M62 139 Q111 126 146 149 M62 162 Q111 149 146 172 M62 185 Q111 172 146 195"
                    stroke="#D9C9B9"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M203 149 Q250 126 296 139 M203 172 Q250 149 296 162 M203 195 Q250 172 296 185"
                    stroke="#D9C9B9"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Friendly character */}
                  <path
                    d="M123 111 Q118 66 155 48 Q189 37 209 68 Q224 91 212 119 L202 151 L133 151 Z"
                    fill="#D6A13A"
                    stroke="#7E1518"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M132 88 Q143 57 173 57 Q198 59 208 86 L204 119 Q195 143 170 143 Q145 141 135 119 Z"
                    fill="#F3CDA8"
                    stroke="#7E1518"
                    strokeWidth="3"
                  />
                  <path
                    d="M135 83 Q154 95 169 79 Q188 95 205 82 L202 66 Q183 46 160 56 Q140 62 135 83 Z"
                    fill="#7E1518"
                  />
                  <circle cx="155" cy="101" r="3.5" fill="#241718" />
                  <circle cx="184" cy="101" r="3.5" fill="#241718" />
                  <path
                    d="M158 116 Q170 128 183 116"
                    stroke="#7E1518"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="146" cy="112" r="5" fill="#D98F83" opacity=".7" />
                  <circle cx="193" cy="112" r="5" fill="#D98F83" opacity=".7" />
                  <path
                    d="M147 143 L140 164 L164 154 L177 164 L197 143"
                    fill="#7E1518"
                    stroke="#7E1518"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M133 151 L119 177 M202 151 L217 176"
                    stroke="#7E1518"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M121 176 L112 168 M216 176 L225 168"
                    stroke="#D6A13A"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <path
                    d="M148 149 L168 160 L189 149"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute bottom-[12%] left-[7%] rotate-[-9deg] rounded-lg bg-white px-4 py-3 shadow-sm">
                  <p className="font-serif text-sm font-bold text-[#7E1518]">
                    Keep exploring!
                  </p>
                  <p className="mt-1 text-[10px] text-[#897A75]">
                    Your next chapter awaits.
                  </p>
                </div>

                <div className="absolute bottom-[19%] right-[8%] flex h-12 w-12 rotate-[10deg] items-center justify-center rounded-full bg-[#7E1518] text-xl text-white shadow-sm">
                  ?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
;
