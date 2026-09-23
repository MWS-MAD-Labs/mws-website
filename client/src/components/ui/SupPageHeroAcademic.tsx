import { Link, useLocation } from 'react-router-dom';

type SupPageHeroAcademicProps = {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
};

const academicItems = [
  {
    label: 'Kindergarten',
    path: '/academic/kindergarten',
  },
  {
    label: 'Elementary',
    path: '/academic/elementary',
  },
  {
    label: 'Junior High',
    path: '/academic/junior-high',
  },
];

export default function SupPageHeroAcademic({
  image,
  imageAlt,
  title,
  description,
}: SupPageHeroAcademicProps) {
  const { pathname } = useLocation();

  return (
    <section className="w-full">
      {/* Hero */}
      <div className="relative h-[520px] w-full overflow-hidden md:h-[550px]">
        <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute inset-0 bg-black/15" />

        {/* Hero content */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto w-full max-w-[1400px] px-6 pb-16 md:px-10 md:pb-20">
            <div className="max-w-[980px] border-t border-white/70 pt-8">
              <div className="grid gap-8 md:grid-cols-[250px_1fr] md:gap-10">
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                    {title}
                  </h1>
                </div>

                <div className="max-w-[560px]">
                  <p className="text-base leading-7 text-white md:text-lg md:leading-8">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic navigation */}
      <nav className="w-full border-b border-gray-200 bg-white">
        <div className="flex w-full">
          {/* Section label */}
          <div className="flex shrink-0 items-center border-r border-gray-200 px-8 md:min-w-[205px] md:px-10">
            <Link
              to="/academic"
              className={[
                'flex items-center gap-4 py-5 text-sm font-semibold',
                'transition-colors duration-200',
                pathname === '/academic'
                  ? 'text-[var(--burgundy)]'
                  : 'text-[var(--charcoal)] hover:text-[var(--burgundy)]',
              ].join(' ')}
            >
              <span>Academics</span>
              <span className="text-lg leading-none">→</span>
            </Link>
          </div>

          {/* Program links */}
          <div className="min-w-0 flex-1 overflow-x-auto">
            <div className="flex min-w-max">
              {academicItems.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={[
                      'relative flex items-center whitespace-nowrap px-7 py-5',
                      'border-r border-gray-100',
                      'text-sm transition-colors duration-200',
                      isActive
                        ? 'font-medium text-[var(--burgundy)]'
                        : 'text-[var(--charcoal)] hover:text-[var(--burgundy)]',
                    ].join(' ')}
                  >
                    {item.label}

                    {isActive && (
                      <span className="absolute inset-x-6 bottom-0 h-[2px] bg-[var(--burgundy)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </section>
  );
}
