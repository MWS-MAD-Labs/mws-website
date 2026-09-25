import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, Image as ImageIcon, Save, Upload } from 'lucide-react';

import { adminApi, type AcademicLevelData, type AcademicLevelKey } from '@/admin/api/adminApi';
import Tiptap from '@/admin/components/Tiptap';
import AppShell from '@/admin/components/layout/AppShell';
import { publicAssetUrl } from '@/lib/api';

type PageStatus = 'DRAFT' | 'PUBLISHED';
type ImageField = 'hero' | 'intro' | 'learning' | 'independence';

type ProgramMeta = AcademicLevelData['program'];

const levelConfig: Record<AcademicLevelKey, { title: string; previewPath: string }> = {
  kindergarten: { title: 'Kindergarten', previewPath: '/academic/kindergarten' },
  elementary: { title: 'Elementary', previewPath: '/academic/elementary' },
  'high-school': { title: 'High School', previewPath: '/academic/high-school' },
};

function parseLevelKey(pathname: string): AcademicLevelKey {
  if (pathname.includes('/academic/elementary')) return 'elementary';
  if (pathname.includes('/academic/high-school')) return 'high-school';
  return 'kindergarten';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toEditorHtml(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
  }
  if (!value) return '<p></p>';
  return value;
}

function filenameFromPath(path: string | null) {
  if (!path) return '';
  const clean = decodeURIComponent(path.split('?')[0].split('#')[0]);
  return clean.split('/').pop() || clean;
}

export default function AcademicLevelEditorPage() {
  const location = useLocation();
  const levelKey = parseLevelKey(location.pathname);
  const levelTitle = levelConfig[levelKey].title;

  const [status, setStatus] = useState<PageStatus>('DRAFT');
  const [isSaving, setIsSaving] = useState(false);
  const [loadedLevelKey, setLoadedLevelKey] = useState<AcademicLevelKey | null>(null);
  const [programMeta, setProgramMeta] = useState<ProgramMeta | null>(null);

  const [heroTitle, setHeroTitle] = useState(levelTitle);

  const [heroDescription, setHeroDescription] = useState(
    'The early years program supports curiosity, language, social confidence, and joyful independence through play-based inquiry.',
  );

  const [heroImage, setHeroImage] = useState('/assets-mws/Kindergarten.jpg');

  const [introTitle, setIntroTitle] = useState('Growing Through Discovery');

  const [introText, setIntroText] = useState(
    '<p>The early years are a time of wonder, curiosity, and rapid growth. At Millennia World School, children are encouraged to explore their surroundings, ask questions, and build meaningful relationships in a warm and supportive environment.</p>',
  );

  const [introImage, setIntroImage] = useState('/assets-mws/Kindergarten.jpg');

  const [curriculumTitle, setCurriculumTitle] = useState('Our Curriculum');

  const [curriculumText, setCurriculumText] = useState(
    '<p>Our Kindergarten curriculum provides a balance of guided learning and open-ended exploration. Children develop early literacy and numeracy skills while learning to communicate, collaborate, solve problems, and make sense of the world around them.</p>',
  );

  const [curriculumFile, setCurriculumFile] = useState<string | null>(null);
  const [curriculumLabel, setCurriculumLabel] = useState('Kindergarten Curriculum');

  const [learningTitle, setLearningTitle] = useState('Learning Through Play');

  const [learningText, setLearningText] = useState(
    '<p>Play is an important part of how young children make sense of the world. Through purposeful play, children develop language, early mathematical thinking, creativity, coordination, and social skills while learning to make choices and solve simple problems.</p>',
  );

  const [learningImage, setLearningImage] = useState('/assets-mws/Kindergarten.jpg');

  const [independenceTitle, setIndependenceTitle] = useState('Growing Independence');

  const [independenceText, setIndependenceText] = useState(
    '<p>Daily routines give children opportunities to take responsibility for themselves and their learning. From caring for personal belongings to working with friends and expressing their ideas, children gradually develop confidence, independence, and a sense of responsibility.</p>',
  );

  const [independenceImage, setIndependenceImage] = useState('/assets-mws/_DSC7101.jpg');

  const [closingText, setClosingText] = useState(
    '<p>Every experience in Kindergarten is designed to help young learners become curious learners, confident communicators, and caring members of their community.</p>',
  );

  function hydrateFromData(data: AcademicLevelData) {
    const learning = data.page.sections[0];
    const independence = data.page.sections[1];

    setStatus(data.status ?? (data.page.isPublished ? 'PUBLISHED' : 'DRAFT'));
    setProgramMeta(data.program);
    setHeroTitle(data.page.hero.title);
    setHeroDescription(data.page.hero.description);
    setHeroImage(data.page.hero.image);
    setIntroTitle(data.page.overview.introTitle);
    setIntroText(toEditorHtml(data.page.overview.intro));
    setIntroImage(data.page.overview.introImage);
    setCurriculumTitle(data.page.overview.curriculumTitle);
    setCurriculumText(toEditorHtml(data.page.overview.curriculumDescription));
    setCurriculumFile(data.page.overview.curriculumFile ?? null);
    setCurriculumLabel(data.page.overview.curriculumLabel ?? `${data.page.hero.title} Curriculum`);
    setLearningTitle(learning?.title ?? 'Learning Through Play');
    setLearningText(toEditorHtml(learning?.text));
    setLearningImage(learning?.image ?? data.page.hero.image);
    setIndependenceTitle(independence?.title ?? 'Growing Independence');
    setIndependenceText(toEditorHtml(independence?.text));
    setIndependenceImage(independence?.image ?? data.page.hero.image);
    setClosingText(toEditorHtml(data.page.overview.closingText));
  }

  useEffect(() => {
    let cancelled = false;

    adminApi
      .academicLevel(levelKey)
      .then((data) => {
        if (cancelled) return;
        hydrateFromData(data);
        setLoadedLevelKey(levelKey);
      })
      .catch(() => {
        if (!cancelled) setLoadedLevelKey(levelKey);
      });

    return () => {
      cancelled = true;
    };
  }, [levelKey]);

  function buildPayload(nextStatus: PageStatus): AcademicLevelData {
    const meta = programMeta;

    return {
      levelKey,
      status: nextStatus,
      program: {
        title: heroTitle,
        age: meta?.age ?? null,
        description: heroDescription,
        image: heroImage,
        imageAlt: meta?.imageAlt ?? `${heroTitle} program image`,
        path: meta?.path ?? levelConfig[levelKey].previewPath,
        sortOrder: meta?.sortOrder ?? 0,
        isActive: meta?.isActive ?? true,
      },
      page: {
        isPublished: nextStatus === 'PUBLISHED',
        galleryId: null,
        hero: {
          title: heroTitle,
          description: heroDescription,
          image: heroImage,
          imageAlt: `${heroTitle} hero image`,
        },
        overview: {
          introTitle,
          intro: introText,
          introImage,
          introImageAlt: `${introTitle} image`,
          curriculumTitle,
          curriculumDescription: curriculumText,
          curriculumFile,
          curriculumLabel,
          closingText,
        },
        sections: [
          {
            title: learningTitle,
            text: learningText,
            image: learningImage,
            imageAlt: `${learningTitle} image`,
            imagePosition: 'right',
          },
          {
            title: independenceTitle,
            text: independenceText,
            image: independenceImage,
            imageAlt: `${independenceTitle} image`,
            imagePosition: 'left',
          },
        ],
        faq: [],
      },
    };
  }

  async function persist(nextStatus: PageStatus) {
    const saved = await adminApi.updateAcademicLevel(levelKey, buildPayload(nextStatus));
    hydrateFromData(saved);
    setStatus(nextStatus);
    return saved;
  }

  const handleSaveDraft = async () => {
    setIsSaving(true);

    try {
      await persist('DRAFT');
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);

    try {
      await persist('PUBLISHED');
      setStatus('PUBLISHED');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    const previewWindow = window.open('about:blank', '_blank', 'noopener,noreferrer');
    const saved = await handleSaveDraft();
    if (!saved) return;

    const previewUrl = `${levelConfig[levelKey].previewPath}?preview=draft`;
    if (previewWindow) {
      previewWindow.location.href = previewUrl;
    } else {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  async function uploadImage(field: ImageField, file: File) {
    const uploaded = await adminApi.uploadAcademicLevelAsset(levelKey, {
      file,
      type: 'image',
    });

    if (field === 'hero') setHeroImage(uploaded.path);
    if (field === 'intro') setIntroImage(uploaded.path);
    if (field === 'learning') setLearningImage(uploaded.path);
    if (field === 'independence') setIndependenceImage(uploaded.path);
  }

  async function uploadCurriculum(file: File) {
    const uploaded = await adminApi.uploadAcademicLevelAsset(levelKey, {
      file,
      type: 'document',
    });
    setCurriculumFile(uploaded.path);
    setCurriculumLabel(uploaded.filename);
  }

  function imageInput(field: ImageField) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      void uploadImage(field, file);
    };
  }

  const isLoading = loadedLevelKey !== levelKey;

  return (
    <AppShell title={`Academic / ${levelTitle}`}>
      <div className="bg-[#f5f4f1]">
        {/* Toolbar */}
        <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
          <div className="flex min-h-[68px] items-center justify-between gap-4 px-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="truncate text-lg font-semibold text-[var(--charcoal)]">
                  Academic / {levelTitle}
                </h1>

                <span
                  className={[
                    'shrink-0 px-2.5 py-1 text-[11px] font-medium',
                    status === 'PUBLISHED'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700',
                  ].join(' ')}
                >
                  {status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-[var(--charcoal-muted)]">
                {isLoading ? 'Loading content...' : 'Edit the page content directly below.'}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handlePreview}
                disabled={isSaving || isLoading}
                className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--burgundy)] hover:text-[var(--burgundy)] disabled:opacity-50"
              >
                <Eye size={16} strokeWidth={1.8} />
                Preview Live
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving || isLoading}
                className="inline-flex items-center gap-2 border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--burgundy)] hover:text-[var(--burgundy)] disabled:opacity-50"
              >
                <Save size={16} strokeWidth={1.8} />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving || isLoading}
                className="inline-flex items-center gap-2 bg-[var(--burgundy)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>
        </header>

        {/* Page editor */}
        <main className="bg-white">
          <section className="w-full">
            <div className="relative h-[520px] w-full overflow-hidden md:h-[550px]">
              <img src={publicAssetUrl(heroImage)} alt="" className="absolute inset-0 h-full w-full object-cover" />

              <div className="absolute inset-0 bg-black/15" />

              <div className="absolute inset-x-0 bottom-0">
                <div className="mx-auto w-full max-w-[1400px] px-6 pb-16 md:px-10 md:pb-20">
                  <div className="max-w-[980px] border-t border-white/70 pt-8">
                    <div className="grid gap-8 md:grid-cols-[250px_1fr] md:gap-10">
                      <div>
                        <input
                          value={heroTitle}
                          onChange={(event) => setHeroTitle(event.target.value)}
                          className="w-full bg-transparent text-4xl font-semibold tracking-tight text-white outline-none md:text-5xl"
                        />
                      </div>

                      <div className="max-w-[560px]">
                        <textarea
                          value={heroDescription}
                          onChange={(event) => setHeroDescription(event.target.value)}
                          rows={4}
                          className="w-full resize-none bg-transparent text-base leading-7 text-white outline-none md:text-lg md:leading-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute right-6 top-6">
                <label className="inline-flex cursor-pointer items-center gap-2 bg-white px-4 py-2.5 text-sm font-medium text-[var(--charcoal)] shadow-sm transition-colors hover:text-[var(--burgundy)]">
                  <ImageIcon size={16} strokeWidth={1.8} />
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={imageInput('hero')}
                  />
                </label>
              </div>
            </div>

            {/* Academic navigation */}
            <nav className="w-full border-b border-gray-200 bg-white">
              <div className="flex w-full">
                <div className="flex shrink-0 items-center border-r border-gray-200 px-8 md:min-w-[205px] md:px-10">
                  <span className="flex items-center gap-4 py-5 text-sm font-semibold text-[var(--charcoal)]">
                    <span>Academics</span>
                    <span className="text-lg leading-none">→</span>
                  </span>
                </div>

                <div className="min-w-0 flex-1 overflow-x-auto">
                  <div className="flex min-w-max">
                    <span className="relative flex items-center whitespace-nowrap border-r border-gray-100 px-7 py-5 text-sm font-medium text-[var(--burgundy)]">
                      {levelTitle}
                      <span className="absolute inset-x-6 bottom-0 h-[2px] bg-[var(--burgundy)]" />
                    </span>

                    {Object.entries(levelConfig)
                      .filter(([key]) => key !== levelKey)
                      .map(([key, item]) => (
                        <span
                          className="flex items-center whitespace-nowrap border-r border-gray-100 px-7 py-5 text-sm text-[var(--charcoal)]"
                          key={key}
                        >
                          {item.title}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </nav>
          </section>
          <section className="subpage-section">
            <div className="wrap">
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                <div className="subpage-body">
                  <textarea
                    value={introTitle}
                    onChange={(event) => setIntroTitle(event.target.value)}
                    rows={2}
                    className="w-full resize-none bg-transparent text-3xl font-semibold leading-tight text-[var(--charcoal)] outline-none md:text-4xl"
                  />
                  <div className="mt-5">
                    <Tiptap value={introText} onChange={setIntroText} />
                  </div>
                </div>
                <div className="overflow-hidden">
                  <img
                    src={publicAssetUrl(introImage)}
                    alt=""
                    className="block h-full max-h-[420px] w-full object-cover"
                  />

                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--burgundy)]">
                    <Upload size={15} strokeWidth={1.8} />
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={imageInput('intro')}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="subpage-section pt-0">
            <div className="wrap">
              <div className="subpage-body max-w-none">
                <textarea
                  value={curriculumTitle}
                  onChange={(event) => setCurriculumTitle(event.target.value)}
                  rows={2}
                  className="w-full resize-none bg-transparent text-3xl font-semibold leading-tight text-[var(--charcoal)] outline-none md:text-4xl"
                />

                <div className="mt-5">
                  <Tiptap value={curriculumText} onChange={setCurriculumText} />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  {curriculumFile ? (
                    <a
                      href={publicAssetUrl(curriculumFile)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 border border-[var(--burgundy)] px-5 py-2.5 text-sm font-medium text-[var(--burgundy)]"
                    >
                      {curriculumLabel || filenameFromPath(curriculumFile)}
                    </a>
                  ) : null}
                  <label className="inline-flex cursor-pointer items-center gap-2 border border-[var(--burgundy)] px-5 py-2.5 text-sm font-medium text-[var(--burgundy)]">
                    <Upload size={15} strokeWidth={1.8} />
                    Upload Brochure
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (!file) return;
                        void uploadCurriculum(file);
                      }}
                    />
                  </label>
                  {curriculumFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCurriculumFile(null);
                        setCurriculumLabel('');
                      }}
                      className="inline-flex items-center gap-2 border border-black/10 px-5 py-2.5 text-sm font-medium text-[var(--charcoal)]"
                    >
                      Remove File
                    </button>
                  ) : null}
                </div>

                <div className="mt-8 border-t border-gray-300" />
              </div>
            </div>
          </section>

          <section className="subpage-section pt-0">
            <div className="wrap">
              <div className="space-y-14">
                {/* Learning Through Play */}
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                  <div className="subpage-body lg:order-1">
                    <textarea
                      value={learningTitle}
                      onChange={(event) => setLearningTitle(event.target.value)}
                      rows={2}
                      className="w-full resize-none bg-transparent text-3xl font-semibold leading-tight text-[var(--charcoal)] outline-none md:text-4xl"
                    />

                    <div className="mt-5">
                      <Tiptap value={learningText} onChange={setLearningText} />
                    </div>
                  </div>

                  <div className="overflow-hidden lg:order-2">
                    <img
                      src={publicAssetUrl(learningImage)}
                      alt=""
                      className="block aspect-[4/3] w-full object-cover"
                    />

                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--burgundy)]">
                      <Upload size={15} strokeWidth={1.8} />
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={imageInput('learning')}
                      />
                    </label>
                  </div>
                </article>
                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                  <div className="overflow-hidden lg:order-1">
                    <img
                      src={publicAssetUrl(independenceImage)}
                      alt=""
                      className="block aspect-[4/3] w-full object-cover"
                    />

                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[var(--burgundy)]">
                      <Upload size={15} strokeWidth={1.8} />
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={imageInput('independence')}
                      />
                    </label>
                  </div>

                  <div className="subpage-body lg:order-2">
                    <textarea
                      value={independenceTitle}
                      onChange={(event) => setIndependenceTitle(event.target.value)}
                      rows={2}
                      className="w-full resize-none bg-transparent text-3xl font-semibold leading-tight text-[var(--charcoal)] outline-none md:text-4xl"
                    />

                    <div className="mt-5">
                      <Tiptap value={independenceText} onChange={setIndependenceText} />
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
          <section className="subpage-section pt-0">
            <div className="wrap">
              <div className="mx-auto max-w-4xl border-t border-black/10 pt-8 text-center">
                <Tiptap value={closingText} onChange={setClosingText} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </AppShell>
  );
}
