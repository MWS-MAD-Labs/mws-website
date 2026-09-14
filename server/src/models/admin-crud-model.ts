import { z } from "zod";

const trimmed = (max?: number) => {
  const schema = z.string().trim().min(1);
  return max ? schema.max(max) : schema;
};

const optionalText = (max?: number) => trimmed(max).nullable().optional();
const uuid = z.string().trim().uuid();
const optionalUuid = uuid.nullable().optional();
const requiredJson = z.custom<unknown>((value) => value !== undefined, {
  message: "Required",
});
const optionalJson = z.unknown().nullable().optional();
const dateValue = z.coerce.date();
const optionalDate = dateValue.nullable().optional();
const decimalValue = z
  .union([z.string().trim().min(1), z.number()])
  .transform((value) => String(value));
const optionalDecimal = decimalValue.nullable().optional();
const bigIntValue = z
  .union([z.string().trim().regex(/^\d+$/), z.number().int().nonnegative()])
  .transform((value) => BigInt(value));
const optionalBigInt = bigIntValue.nullable().optional();

const createHeroSlideSchema = z.strictObject({
  image: trimmed(),
  alt: trimmed(255),
  headline: optionalText(180),
  caption: optionalText(),
  sortOrder: z.number().int().optional(),
});

const createMediaAssetSchema = z.strictObject({
  ownerId: optionalUuid,
  url: trimmed(),
  filename: optionalText(255),
  mimeType: optionalText(100),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  sizeBytes: optionalBigInt,
  altText: optionalText(512),
  metadata: optionalJson,
});

const createCampusSchema = z.strictObject({
  name: trimmed(200),
  slug: trimmed(200),
  address: optionalText(),
  phone: optionalText(50),
  email: trimmed(255).email().nullable().optional(),
  mapEmbed: optionalText(),
  heroImageId: optionalUuid,
});

const createAcademicProgramSchema = z.strictObject({
  campusId: optionalUuid,
  name: trimmed(150),
  slug: trimmed(150),
  level: optionalText(50),
  ageRange: optionalText(50),
  summary: optionalText(),
  content: optionalJson,
  thumbnailId: optionalUuid,
  published: z.boolean().optional(),
  orderIndex: z.number().int().nullable().optional(),
});

const createNewsCategorySchema = z.strictObject({
  name: trimmed(100),
  slug: trimmed(100),
  description: optionalText(),
});

const createNewsTagSchema = z.strictObject({
  name: trimmed(100),
  slug: trimmed(100),
});

export const createNewsPostSchema = z.strictObject({
  authorId: optionalUuid,
  categoryId: optionalUuid,
  title: trimmed(500),
  slug: trimmed(500),
  excerpt: optionalText(),
  content: requiredJson,
  heroMediaId: optionalUuid,
  status: trimmed(50).optional(),
  publishedAt: optionalDate,
  featured: z.boolean().optional(),
  meta: optionalJson,
  tagIds: z.array(uuid).optional(),
});

const createTestimonialSchema = z.strictObject({
  authorName: trimmed(255),
  role: optionalText(100),
  grade: optionalText(100),
  quote: optionalText(),
  videoMediaId: optionalUuid,
  posterMediaId: optionalUuid,
  visible: z.boolean().optional(),
  sortOrder: z.number().int().nullable().optional(),
  metadata: optionalJson,
});

const createFaqItemSchema = z.strictObject({
  question: trimmed(500),
  answer: trimmed(),
  category: optionalText(100),
  orderIndex: z.number().int().nullable().optional(),
  visible: z.boolean().optional(),
});

const createInquirySchema = z.strictObject({
  type: trimmed(50).optional(),
  parentName: trimmed(255),
  email: trimmed(255).email(),
  phone: optionalText(50),
  childLevel: optionalText(100),
  preferredDate: optionalDate,
  message: optionalText(),
  campusId: optionalUuid,
  status: trimmed(50).optional(),
  assignedTo: optionalUuid,
  handledAt: optionalDate,
});

const createApplicationSchema = z.strictObject({
  applicantParentId: optionalUuid,
  childName: trimmed(255),
  childDob: optionalDate,
  programId: optionalUuid,
  applicationStatus: trimmed(50).optional(),
  submittedAt: dateValue.optional(),
  assignedOfficerId: optionalUuid,
  notes: optionalText(),
  metadata: optionalJson,
});

const createApplicationDocumentSchema = z.strictObject({
  applicationId: uuid,
  mediaId: uuid,
  docType: trimmed(100),
  uploadedAt: dateValue.optional(),
  visible: z.boolean().optional(),
});

const createTuitionFeeSchema = z.strictObject({
  campusId: optionalUuid,
  programId: optionalUuid,
  academicYear: trimmed(20),
  feeCurrency: trimmed(10).optional(),
  feeItems: requiredJson,
  totalAmount: optionalDecimal,
  published: z.boolean().optional(),
  effectiveFrom: optionalDate,
});

const createEventSchema = z.strictObject({
  campusId: optionalUuid,
  title: trimmed(255),
  description: optionalText(),
  startAt: dateValue,
  endAt: optionalDate,
  allDay: z.boolean().optional(),
  location: optionalText(255),
  relatedProgramId: optionalUuid,
  createdBy: optionalUuid,
});

const createCmsPageSchema = z.strictObject({
  slug: trimmed(255),
  title: trimmed(500),
  body: requiredJson,
  template: optionalText(100),
  meta: optionalJson,
  status: optionalText(50),
  publishedAt: optionalDate,
  createdBy: optionalUuid,
});

const createSettingSchema = z.strictObject({
  key: trimmed(255),
  value: optionalJson,
  scope: optionalText(100),
});

const withAtLeastOneField = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export type AdminCrudResource =
  | "hero-slides"
  | "media-assets"
  | "campuses"
  | "academic-programs"
  | "news-categories"
  | "news-tags"
  | "news-posts"
  | "testimonials"
  | "faq-items"
  | "inquiries"
  | "applications"
  | "application-documents"
  | "tuition-fees"
  | "events"
  | "cms-pages"
  | "settings";

export type AdminCrudModel = {
  resource: AdminCrudResource;
  label: string;
  delegate: string;
  createSchema: z.ZodTypeAny;
  updateSchema: z.ZodTypeAny;
  defaultOrderBy: unknown;
  include?: unknown;
  softDelete: boolean;
  timestamps: boolean;
};

export const adminCrudModels: Record<AdminCrudResource, AdminCrudModel> = {
  "hero-slides": {
    resource: "hero-slides",
    label: "Hero slide",
    delegate: "heroSlide",
    createSchema: createHeroSlideSchema,
    updateSchema: withAtLeastOneField(createHeroSlideSchema),
    defaultOrderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    softDelete: true,
    timestamps: false,
  },
  "media-assets": {
    resource: "media-assets",
    label: "Media asset",
    delegate: "mediaAsset",
    createSchema: createMediaAssetSchema,
    updateSchema: withAtLeastOneField(createMediaAssetSchema),
    defaultOrderBy: { createdAt: "desc" },
    include: { owner: { select: { id: true, email: true, fullName: true } } },
    softDelete: true,
    timestamps: true,
  },
  campuses: {
    resource: "campuses",
    label: "Campus",
    delegate: "campus",
    createSchema: createCampusSchema,
    updateSchema: withAtLeastOneField(createCampusSchema),
    defaultOrderBy: { name: "asc" },
    include: { heroImage: true },
    softDelete: true,
    timestamps: true,
  },
  "academic-programs": {
    resource: "academic-programs",
    label: "Academic program",
    delegate: "academicProgram",
    createSchema: createAcademicProgramSchema,
    updateSchema: withAtLeastOneField(createAcademicProgramSchema),
    defaultOrderBy: [{ orderIndex: "asc" }, { name: "asc" }],
    include: { campus: true, thumbnail: true },
    softDelete: true,
    timestamps: true,
  },
  "news-categories": {
    resource: "news-categories",
    label: "News category",
    delegate: "newsCategory",
    createSchema: createNewsCategorySchema,
    updateSchema: withAtLeastOneField(createNewsCategorySchema),
    defaultOrderBy: { name: "asc" },
    softDelete: true,
    timestamps: true,
  },
  "news-tags": {
    resource: "news-tags",
    label: "News tag",
    delegate: "newsTag",
    createSchema: createNewsTagSchema,
    updateSchema: withAtLeastOneField(createNewsTagSchema),
    defaultOrderBy: { name: "asc" },
    softDelete: true,
    timestamps: true,
  },
  "news-posts": {
    resource: "news-posts",
    label: "News post",
    delegate: "newsPost",
    createSchema: createNewsPostSchema,
    updateSchema: withAtLeastOneField(createNewsPostSchema),
    defaultOrderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { id: true, email: true, fullName: true } },
      category: true,
      heroMedia: true,
      postTags: { include: { tag: true } },
    },
    softDelete: true,
    timestamps: true,
  },
  testimonials: {
    resource: "testimonials",
    label: "Testimonial",
    delegate: "testimonial",
    createSchema: createTestimonialSchema,
    updateSchema: withAtLeastOneField(createTestimonialSchema),
    defaultOrderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { videoMedia: true, posterMedia: true },
    softDelete: true,
    timestamps: true,
  },
  "faq-items": {
    resource: "faq-items",
    label: "FAQ item",
    delegate: "faqItem",
    createSchema: createFaqItemSchema,
    updateSchema: withAtLeastOneField(createFaqItemSchema),
    defaultOrderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    softDelete: true,
    timestamps: true,
  },
  inquiries: {
    resource: "inquiries",
    label: "Inquiry",
    delegate: "inquiry",
    createSchema: createInquirySchema,
    updateSchema: withAtLeastOneField(createInquirySchema),
    defaultOrderBy: { createdAt: "desc" },
    include: {
      campus: true,
      assignee: { select: { id: true, email: true, fullName: true } },
    },
    softDelete: true,
    timestamps: true,
  },
  applications: {
    resource: "applications",
    label: "Application",
    delegate: "application",
    createSchema: createApplicationSchema,
    updateSchema: withAtLeastOneField(createApplicationSchema),
    defaultOrderBy: { submittedAt: "desc" },
    include: {
      applicantParent: { select: { id: true, email: true, fullName: true } },
      program: true,
      assignedOfficer: { select: { id: true, email: true, fullName: true } },
      documents: { include: { media: true } },
    },
    softDelete: true,
    timestamps: true,
  },
  "application-documents": {
    resource: "application-documents",
    label: "Application document",
    delegate: "applicationDocument",
    createSchema: createApplicationDocumentSchema,
    updateSchema: withAtLeastOneField(createApplicationDocumentSchema),
    defaultOrderBy: { uploadedAt: "desc" },
    include: { application: true, media: true },
    softDelete: false,
    timestamps: false,
  },
  "tuition-fees": {
    resource: "tuition-fees",
    label: "Tuition fee",
    delegate: "tuitionFee",
    createSchema: createTuitionFeeSchema,
    updateSchema: withAtLeastOneField(createTuitionFeeSchema),
    defaultOrderBy: [{ academicYear: "desc" }, { createdAt: "desc" }],
    include: { campus: true, program: true },
    softDelete: true,
    timestamps: true,
  },
  events: {
    resource: "events",
    label: "Event",
    delegate: "event",
    createSchema: createEventSchema,
    updateSchema: withAtLeastOneField(createEventSchema),
    defaultOrderBy: { startAt: "desc" },
    include: {
      campus: true,
      relatedProgram: true,
      creator: { select: { id: true, email: true, fullName: true } },
    },
    softDelete: true,
    timestamps: true,
  },
  "cms-pages": {
    resource: "cms-pages",
    label: "CMS page",
    delegate: "cmsPage",
    createSchema: createCmsPageSchema,
    updateSchema: withAtLeastOneField(createCmsPageSchema),
    defaultOrderBy: { updatedAt: "desc" },
    include: { creator: { select: { id: true, email: true, fullName: true } } },
    softDelete: true,
    timestamps: true,
  },
  settings: {
    resource: "settings",
    label: "Setting",
    delegate: "setting",
    createSchema: createSettingSchema,
    updateSchema: withAtLeastOneField(createSettingSchema),
    defaultOrderBy: { key: "asc" },
    softDelete: false,
    timestamps: true,
  },
};

export const adminCrudResourceNames = Object.keys(
  adminCrudModels,
) as AdminCrudResource[];
