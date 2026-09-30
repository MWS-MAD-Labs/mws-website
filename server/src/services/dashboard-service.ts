import { getPrisma } from "../lib/prisma";

const ACADEMIC_LABELS: Record<string, string> = {
  kindergarten: "Kindergarten",
  elementary: "Elementary",
  "high-school": "High School",
};

export type RecentUpdate = {
  type: "news" | "page" | "academic" | "hero";
  title: string;
  status: string;
  updatedAt: Date;
  /** CMS route that edits this item. */
  editPath: string;
};

/**
 * What an editor needs when opening the CMS: how much content exists, what is
 * waiting (drafts, scheduled posts, unpublished academic changes, slides
 * without media) and what changed most recently.
 */
export class DashboardService {
  static async contentSummary(options: { includeUsers: boolean }, now = new Date()) {
    const prisma = getPrisma();

    const [
      newsByStatus,
      scheduledNews,
      recentNews,
      heroSlides,
      galleryCount,
      imageCount,
      videoCount,
      academicPages,
      ourSchool,
      communityStories,
      contactPage,
      pendingInvitations,
      activeUsers,
    ] = await Promise.all([
      prisma.newsPost.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.newsPost.count({ where: { status: "PUBLISHED", publishedAt: { gt: now } } }),
      prisma.newsPost.findMany({
        select: { id: true, title: true, status: true, publishedAt: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.heroSlide.findMany({
        select: { id: true, title: true, isActive: true, mediaPath: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.gallery.count(),
      prisma.galleryImage.count(),
      prisma.galleryVideo.count(),
      prisma.academicLevelPage.findMany({
        select: {
          levelKey: true,
          status: true,
          isPublished: true,
          updatedAt: true,
          program: { select: { title: true } },
        },
      }),
      prisma.ourSchool.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: "desc" } }),
      prisma.communityStoriesPage.findFirst({
        select: { updatedAt: true, isPublished: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.cmsPage.findFirst({
        where: { slug: "contact", deletedAt: null },
        select: { updatedAt: true },
      }),
      options.includeUsers
        ? prisma.cmsUserInvitation.count({
            where: {
              status: "PENDING",
              OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
          })
        : Promise.resolve(null),
      options.includeUsers
        ? prisma.cmsUser.count({ where: { isActive: true } })
        : Promise.resolve(null),
    ]);

    const statusCount = (status: string) =>
      newsByStatus.find((row) => row.status === status)?._count._all ?? 0;

    const academic = academicPages.map((page) => ({
      levelKey: page.levelKey,
      title: ACADEMIC_LABELS[page.levelKey] ?? page.program.title,
      // A draft saved on top of a published page: the live page is unchanged.
      hasUnpublishedChanges: page.status === "DRAFT" && page.isPublished,
      isPublished: page.isPublished,
      updatedAt: page.updatedAt,
    }));

    const recentUpdates: RecentUpdate[] = [
      ...recentNews.map((post) => ({
        type: "news" as const,
        title: post.title,
        status:
          post.status === "PUBLISHED" && post.publishedAt && post.publishedAt > now
            ? "SCHEDULED"
            : post.status,
        updatedAt: post.updatedAt,
        editPath: `/admin/news/${post.id}/edit`,
      })),
      ...academic.map((page) => ({
        type: "academic" as const,
        title: `Academic · ${page.title}`,
        status: page.hasUnpublishedChanges ? "DRAFT" : "PUBLISHED",
        updatedAt: page.updatedAt,
        editPath: `/admin/academic/${page.levelKey}`,
      })),
      ...(heroSlides[0]
        ? [
            {
              type: "hero" as const,
              title: "Home hero",
              status: "PUBLISHED",
              updatedAt: heroSlides[0].updatedAt,
              editPath: "/admin/content/home",
            },
          ]
        : []),
      ...(ourSchool
        ? [{ type: "page" as const, title: "Our School", status: "PUBLISHED", updatedAt: ourSchool.updatedAt, editPath: "/admin/content/our-school" }]
        : []),
      ...(communityStories
        ? [
            {
              type: "page" as const,
              title: "Community Stories",
              status: communityStories.isPublished ? "PUBLISHED" : "HIDDEN",
              updatedAt: communityStories.updatedAt,
              editPath: "/admin/content/community-stories",
            },
          ]
        : []),
      ...(contactPage
        ? [{ type: "page" as const, title: "Contact", status: "PUBLISHED", updatedAt: contactPage.updatedAt, editPath: "/admin/content/contact" }]
        : []),
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 8);

    const activeSlides = heroSlides.filter((slide) => slide.isActive);

    return {
      news: {
        published: statusCount("PUBLISHED") - scheduledNews,
        scheduled: scheduledNews,
        drafts: statusCount("DRAFT"),
        archived: statusCount("ARCHIVED"),
      },
      hero: {
        total: heroSlides.length,
        active: activeSlides.length,
        missingMedia: activeSlides.filter((slide) => !slide.mediaPath).length,
      },
      gallery: { galleries: galleryCount, images: imageCount, videos: videoCount },
      academic,
      users:
        options.includeUsers && activeUsers !== null
          ? { active: activeUsers, pendingInvitations: pendingInvitations ?? 0 }
          : null,
      recentUpdates,
    };
  }
}
