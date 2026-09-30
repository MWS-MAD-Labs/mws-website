import AppShell from '@/admin/components/layout/AppShell';
import HeaderHero from './components/layouts/HeaderHero';

export default function HeroSlidesPage() {
  return (
    <AppShell title="Home Hero">
      <div className="p-6">
        <HeaderHero />

        <div className="mt-6">{/* Hero slides content */}</div>
      </div>
    </AppShell>
  );
}
