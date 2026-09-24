# Graph Report - mws-website  (2026-09-24)

## Corpus Check
- 277 files · ~379,335 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: .tmpl 27, (none) 6, .lock 2)

## Summary
- 1671 nodes · 3526 edges · 107 communities (85 shown, 22 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `18a4bcdb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- admin-crud-model.ts
- hono
- sections.ts
- server/package.json
- response-error.ts
- ContactEditorFields.tsx
- ResponseError
- asset
- home.tsx
- Login.ts
- our-school-service.ts
- adminApi.ts
- CreateUpdateNews
- admin-page-editor-service.ts
- getPrisma
- PlaceholderPage.tsx
- NewsController
- news-service.ts
- client/package.json
- cms-auth-service.ts
- ref_admin
- CreateUpdateNews.tsx
- lucide-react
- Galleries.ts
- public-news-service.ts
- hero-slide-service.ts
- devDependencies
- compilerOptions
- cms-auth-service.test.ts
- central-client.ts
- compilerOptions
- our-school.tsx
- page-data-service.ts
- news-repository.ts
- react-router-dom
- toJsonSafe
- gallery-service.ts
- GalleryDetailPage.tsx
- HeroSlidesPage.tsx
- compilerOptions
- contact-page-service.ts
- Backend Review: Public News & News Detail
- react
- ref_features
- useGalleryDetail
- PageDataService
- page-data-repository.ts
- GalleryRepository
- CommunityStoriesPage.tsx
- useGalleryDetail.ts
- pageApi.ts
- MWS Website
- minio.ts
- NewsCategories.tsx
- newsData.ts
- GalleryAssetPreviewModal.tsx
- NewsTags.tsx
- requireUuid
- SidebarMenu.tsx
- newsUtils.ts
- dependencies
- admin/app/App.tsx
- Tiptap.tsx
- GalleryListPage.tsx
- NewsTags
- our-school/OurSchoolPage.tsx
- school-calendar.tsx
- GalleryService
- getErrorMessage
- UploadVidio.tsx
- NewsCategories
- ProgramAcademic.tsx
- AdminOurSchoolController
- GalleryAssetPickerModal.tsx
- api.ts
- galleryResponse
- ref_lib
- UploadImages
- auth.ts
- MWS Website Backend
- scripts
- admissions/AdmissionsPage.tsx
- CoverImagePickerModal.tsx
- src/App.tsx
- .uploadVideo
- newsListModel.ts
- vite.config.ts
- React + TypeScript + Vite
- SupPageHeroAcademic.tsx
- env.ts
- heroData.ts
- Prioritas perbaikan sebelum frontend diintegrasikan
- AuthScreen.tsx
- Field.tsx
- Modal.tsx
- Panel.tsx
- SearchInput.tsx
- StatusMessage.tsx
- LoginPage.tsx
- client/tsconfig.json
- AGENTS.md
- CLAUDE.md
- NewsPostMedia

## God Nodes (most connected - your core abstractions)
1. `ResponseError` - 118 edges
2. `getPrisma()` - 86 edges
3. `react` - 55 edges
4. `toJsonSafe()` - 46 edges
5. `hono` - 43 edges
6. `SessionVariables` - 37 edges
7. `NewsRepository` - 33 edges
8. `react-router-dom` - 32 edges
9. `lucide-react` - 26 edges
10. `NewsService` - 26 edges

## Surprising Connections (you probably didn't know these)
- `5. Response JSON` --references--> `toJsonSafe()`  [INFERRED]
  REVIEW.md → server/src/lib/json-response.ts
- `6. Konflik dengan implementasi News lama` --references--> `NewsPost`  [INFERRED]
  REVIEW.md → client/src/admin/api/adminApi.ts
- `Dua sumber status publikasi` --references--> `NewsPost`  [INFERRED]
  REVIEW.md → client/src/admin/api/adminApi.ts
- `Kesimpulan` --references--> `NewsPost`  [INFERRED]
  REVIEW.md → client/src/admin/api/adminApi.ts
- `Scope yang diperiksa` --references--> `NewsPost`  [INFERRED]
  REVIEW.md → client/src/admin/api/adminApi.ts

## Import Cycles
- None detected.

## Communities (107 total, 22 thin omitted)

### Community 0 - "admin-crud-model.ts"
Cohesion: 0.05
Nodes (50): AdminCrudController, idFromParam(), readJsonBody(), AdminCrudModel, adminCrudModels, AdminCrudResource, adminCrudResourceNames, bigIntValue (+42 more)

### Community 1 - "hono"
Cohesion: 0.12
Nodes (28): hono, 4. Controller, route, dan autentikasi, AdminContactPageController, DashboardController, userName(), MultipartBody, MultipartValue, AdminAdmissionsController (+20 more)

### Community 2 - "sections.ts"
Cohesion: 0.07
Nodes (32): PageEditorCanvas(), PageEditorCanvasProps, PagesTable(), PagesTableProps, PageActions(), PageActionsProps, PageStatusBadge(), PageStatusBadgeProps (+24 more)

### Community 3 - "server/package.json"
Cohesion: 0.05
Nodes (39): dotenv, ioredis, minio, pg, prisma, @prisma/adapter-pg, rate-limiter-flexible, @types/bun (+31 more)

### Community 4 - "response-error.ts"
Cohesion: 0.13
Nodes (17): ref_bun_test, app, port, jwtSecret(), SessionPayload, signSession(), adminRoute, apiRoute (+9 more)

### Community 5 - "ContactEditorFields.tsx"
Cohesion: 0.12
Nodes (25): ContactEditorFields(), ContactEditorFieldsProps, ContactPagePreview(), ContactPagePreviewProps, CampusInfo(), TextAreaField(), TextAreaFieldProps, TextField() (+17 more)

### Community 6 - "ResponseError"
Cohesion: 0.17
Nodes (11): 3. Service dan validation, ResponseError, assertTagsExist(), derivePublication(), handleDatabaseError(), isUploadedNewsImage(), NewsService, parse() (+3 more)

### Community 7 - "asset"
Cohesion: 0.10
Nodes (18): SubpageHero(), SubpageHeroProps, asset(), ContactPageViewProps, Admission(), programs, defaultCommunityStories, Kurikulum() (+10 more)

### Community 8 - "home.tsx"
Cohesion: 0.07
Nodes (24): AdmissionsCta(), AdmissionsCtaProps, CtaAction, Affiliations(), AffiliationsProps, Background(), BackgroundProps, CampusSpotlight() (+16 more)

### Community 9 - "Login.ts"
Cohesion: 0.12
Nodes (18): cookieOptions(), frontendOrigin(), LoginController, oauthStateCookieOptions(), RESPONSE_ERROR_CODES, exchangeCodeForIdToken(), GoogleAuth, googleClientId() (+10 more)

### Community 10 - "our-school-service.ts"
Cohesion: 0.11
Nodes (19): galleryInclude, OurSchoolCreateData, ourSchoolInclude, OurSchoolRepository, OurSchoolUpdateData, OurSchoolWithGallery, handleDatabaseError(), imageResponse() (+11 more)

### Community 11 - "adminApi.ts"
Cohesion: 0.06
Nodes (31): AdminAdmissionProgram, AdminAdmissionsData, adminApi, AdminCommunityStoriesData, AdminCommunityStoriesPage, AdminCommunityStoriesPagePayload, AdminDashboardData, AdminNewsPayload (+23 more)

### Community 12 - "CreateUpdateNews"
Cohesion: 0.10
Nodes (25): CreateUpdateNews(), handleAddArticlePhoto(), handleArticlePhotoSelection(), handleCoverFile(), handleRemoveCover(), handleSlugChange(), handleTitleChange(), load() (+17 more)

### Community 13 - "admin-page-editor-service.ts"
Cohesion: 0.13
Nodes (16): AdminCommunityStoriesController, readJson(), AdminPageEditorService, adminProgramResponse(), admissionProgramSchema, admissionsPayloadSchema, communityNewsResponse(), communityStoriesPayloadSchema (+8 more)

### Community 14 - "getPrisma"
Cohesion: 0.13
Nodes (3): getPrisma(), NewsRepository, publishedPostWhere()

### Community 16 - "NewsController"
Cohesion: 0.14
Nodes (5): firstFormValue(), NewsController, ok(), readImageUpload(), readJson()

### Community 17 - "news-service.ts"
Cohesion: 0.10
Nodes (23): zod, deleteMinioObject(), newsCategorySchema, newsPostMediaSchema, newsPostSchema, newsTagSchema, optionalUuid, uuid (+15 more)

### Community 18 - "client/package.json"
Cohesion: 0.09
Nodes (24): @types/node, typescript, name, private, type, version, autoprefixer, @babel/core (+16 more)

### Community 19 - "cms-auth-service.ts"
Cohesion: 0.15
Nodes (17): CmsUsersController, ActiveCentralEmployee, assertActiveCentralEmployee(), CentralIdentitySnapshot, CmsAuthService, DEFAULT_ROLE_PERMISSIONS, permissionsForRole(), ROLE_LABELS (+9 more)

### Community 20 - "ref_admin"
Cohesion: 0.10
Nodes (9): AuthContext, AuthContextValue, GalleryPickerModal(), GalleryPickerModalProps, GalleryThumb(), GalleryThumbProps, GalleryListProps, CmsUsersState (+1 more)

### Community 21 - "CreateUpdateNews.tsx"
Cohesion: 0.16
Nodes (9): ArticlePhotosSection(), ArticlePhotosSectionProps, ArticleSection(), CoverImageSection(), CoverImageSectionProps, EditorSection(), NewsEditorHeader(), NewsEditorMessage() (+1 more)

### Community 22 - "lucide-react"
Cohesion: 0.09
Nodes (5): AppShellProps, SelectProps, MenuItem, menuItems, lucide-react

### Community 23 - "Galleries.ts"
Cohesion: 0.14
Nodes (11): AdminGalleriesController, AdminGalleryImagesController, fileField(), firstFormValue(), MultipartBody, MultipartValue, readJson(), readMultipartImage() (+3 more)

### Community 24 - "public-news-service.ts"
Cohesion: 0.15
Nodes (14): PublicNewsController, newsMediaFileUrl(), PublicNewsPostFilters, findCoverMedia(), articleMedia(), authorDisplayName(), listItem(), listQuerySchema (+6 more)

### Community 25 - "hero-slide-service.ts"
Cohesion: 0.15
Nodes (11): heroOrder, HeroSlideCreateData, HeroSlideRepository, HeroSlideUpdateData, handleDatabaseError(), heroSlideResponse(), heroSlideSchema, heroSlideUpdateSchema (+3 more)

### Community 26 - "devDependencies"
Cohesion: 0.10
Nodes (21): devDependencies, autoprefixer, @babel/core, babel-plugin-react-compiler, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+13 more)

### Community 27 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 28 - "cms-auth-service.test.ts"
Cohesion: 0.17
Nodes (16): clearMadLabsUnitIdCacheForTest(), getUserUnitId(), isMadLabsUser(), MAD_LABS_UNIT_NAMES, madLabsUnitId(), normalizedUnitName(), resolveMadLabsUnitId(), unitNameOf() (+8 more)

### Community 29 - "central-client.ts"
Cohesion: 0.18
Nodes (18): centralBaseUrl(), CentralPage, centralToken(), listActiveEmployees(), listPage(), lookup(), namedRefIdOf(), namedRefNameOf() (+10 more)

### Community 30 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, allowJs, jsx, lib, module, moduleDetection, moduleResolution (+12 more)

### Community 31 - "our-school.tsx"
Cohesion: 0.13
Nodes (13): BreadcrumbItem, ContentBreadcrumb(), ContentBreadcrumbProps, EditorialFeature(), EditorialFeatureProps, EditorialSplit(), EditorialSplitProps, EditorialText() (+5 more)

### Community 32 - "page-data-service.ts"
Cohesion: 0.15
Nodes (18): 6. Konflik dengan implementasi News lama, asset(), defaultCommunityStoriesContent, defaultCommunityVoices, defaultGalleryImages, defaultHeroSlides, defaultInfoCards, defaultOurSchoolContent (+10 more)

### Community 33 - "news-repository.ts"
Cohesion: 0.12
Nodes (16): mediaOrderBy, NewsCategoryData, NewsCategoryWithCount, NewsMediaData, NewsPostData, NewsPostFilters, NewsPostWithRelations, NewsTagData (+8 more)

### Community 34 - "react-router-dom"
Cohesion: 0.18
Nodes (13): Footer(), cx(), MenuKey, Navbar(), CommunityVoices(), CommunityVoicesProps, Voice, academicLinks (+5 more)

### Community 35 - "toJsonSafe"
Cohesion: 0.18
Nodes (7): AdminHeroSlidesController, readJson(), PublicHeroSlidesController, isPlainObject(), toJsonSafe(), publicHeroSlideRoute, HeroSlideService

### Community 36 - "gallery-service.ts"
Cohesion: 0.14
Nodes (17): GalleryCreateData, GalleryImageCreateData, GalleryImageUpdateData, galleryInclude, GalleryUpdateData, GalleryVideoCreateData, GalleryVideoUpdateData, GalleryWithMedia (+9 more)

### Community 37 - "GalleryDetailPage.tsx"
Cohesion: 0.16
Nodes (11): GalleryAssetTabs(), GalleryAssetTabsProps, GalleryDetailHeader(), GalleryDetailHeaderProps, GallerySelectionBar(), GallerySelectionBarProps, ImageList(), ImageListProps (+3 more)

### Community 38 - "HeroSlidesPage.tsx"
Cohesion: 0.20
Nodes (14): emptyForm, formFromSlide(), FormState, HeroSlidesPage(), deleteSlide(), editSlide(), loadSlides(), saveSlide() (+6 more)

### Community 39 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 40 - "contact-page-service.ts"
Cohesion: 0.17
Nodes (9): PublicPagesController, publicPageRoute, ContactPageContent, contactPageContentSchema, ContactPageService, defaultContactPageContent, pageResponse(), parseContent() (+1 more)

### Community 41 - "Backend Review: Public News & News Detail"
Cohesion: 0.16
Nodes (15): NewsPost, 1. Database dan Prisma schema, 2. Repository, 5. Response JSON, 7. Kebutuhan frontend News saat ini, Backend Review: Public News & News Detail, Blocker: migration penambahan News tidak aman untuk data lama, Dua sumber status publikasi (+7 more)

### Community 42 - "react"
Cohesion: 0.14
Nodes (9): GoogleLoginButton(), Chatbot(), getBotReply(), initialMessages, Message, FaqAccordionProps, FaqItem, ref_config (+1 more)

### Community 43 - "ref_features"
Cohesion: 0.13
Nodes (7): ContactPage, ContactPageContent, defaultContactPageContent, RelatedNewsSectionProps, ref_api, ref_data, ref_features

### Community 44 - "useGalleryDetail"
Cohesion: 0.22
Nodes (13): GalleryDetailPage(), useGalleryDetail(), clearSelection(), createYoutubeVideo(), deleteAsset(), deletePreviewAsset(), deleteSelectedAssets(), goToPreviewAsset() (+5 more)

### Community 45 - "PageDataService"
Cohesion: 0.20
Nodes (4): PageDataRepository, asStringArray(), ourSchoolContent(), PageDataService

### Community 46 - "page-data-repository.ts"
Cohesion: 0.15
Nodes (12): @prisma/client, CreateCmsUserInput, UpdateCmsUserInput, communityPageInclude, CommunityStoriesPageRecord, galleryInclude, newsInclude, NewsPostWithGallery (+4 more)

### Community 47 - "GalleryRepository"
Cohesion: 0.20
Nodes (4): GalleryRepository, deleteImageObject(), parseImageMetadata(), validateImageFile()

### Community 48 - "CommunityStoriesPage.tsx"
Cohesion: 0.24
Nodes (13): CommunityStoriesPage(), deleteNews(), loadData(), saveNews(), savePage(), emptyNewsForm, NewsForm, newsPayload() (+5 more)

### Community 49 - "useGalleryDetail.ts"
Cohesion: 0.20
Nodes (10): GalleryAssetToolbar(), GalleryAssetToolbarProps, GalleryDeleteConfirmModal(), GalleryDeleteConfirmModalProps, CreateYoutubeVideoData, UploadAssetData, GalleryAssetSort, GalleryConfirmDeleteState (+2 more)

### Community 50 - "pageApi.ts"
Cohesion: 0.14
Nodes (12): AdmissionProgramData, AdmissionsPageData, CommunityGalleryImageData, CommunityNewsData, CommunityStoriesPageData, CommunityVoiceData, HeroSlideData, HomePageData (+4 more)

### Community 51 - "MWS Website"
Cohesion: 0.14
Nodes (13): 1. Jalankan Frontend, 2. Build Frontend, 3. Lint Frontend, 4. Jalankan Server, Arah Implementasi dari Mockup, Catatan Development, Client, Gambaran Project (+5 more)

### Community 52 - "minio.ts"
Cohesion: 0.31
Nodes (12): ref_node_stream, ensureMinioBucket(), getMinioClient(), getMinioConfig(), getMinioObjectBuffer(), MinioConfig, optionalEnv(), putMinioObject() (+4 more)

### Community 53 - "NewsCategories.tsx"
Cohesion: 0.15
Nodes (5): CategoryFormErrors, CategoryFormState, updateName(), slugify(), validateCategoryForm()

### Community 54 - "newsData.ts"
Cohesion: 0.17
Nodes (9): newsApi, newsContentParagraphs(), NewsFilters, PublicNewsCategory, PublicNewsContent, PublicNewsDetail, PublicNewsList, PublicNewsListItem (+1 more)

### Community 55 - "GalleryAssetPreviewModal.tsx"
Cohesion: 0.36
Nodes (10): assetName(), GalleryAssetPreviewModal(), GalleryAssetPreviewModalProps, renderPreview(), assetTitle(), fileNameFromPath(), filterAndSortAssets(), imagePreviewName() (+2 more)

### Community 56 - "NewsTags.tsx"
Cohesion: 0.17
Nodes (4): updateName(), slugify(), TagFormErrors, TagFormState

### Community 57 - "requireUuid"
Cohesion: 0.23
Nodes (3): AdminGalleryVideosController, parseVideoMetadata(), requireUuid()

### Community 58 - "SidebarMenu.tsx"
Cohesion: 0.27
Nodes (7): AuthUser, hasActiveChild(), isMenuItemVisible(), SidebarMenu(), SidebarMenuItem(), Button(), ButtonProps

### Community 59 - "newsUtils.ts"
Cohesion: 0.18
Nodes (6): dateFormatter, EMPTY_NEWS_RESULT, NEWS_LIST_PATH, NEWS_LIST_RETURN_KEY, NEWS_PAGE_SIZE, NEWS_STATUS_OPTIONS

### Community 60 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, dompurify, lucide-react, react, react-dom, react-router-dom, tailwindcss, @tiptap/pm (+2 more)

### Community 62 - "Tiptap.tsx"
Cohesion: 0.24
Nodes (5): TiptapProps, TiptapToolbar(), TiptapToolbarProps, @tiptap/react, @tiptap/starter-kit

### Community 63 - "GalleryListPage.tsx"
Cohesion: 0.31
Nodes (7): GalleryList(), GalleryListPage(), createGallery(), deleteGallery(), loadGalleries(), optionalText(), GallerySort

### Community 64 - "NewsTags"
Cohesion: 0.29
Nodes (7): createEmptyForm(), NewsTags(), closeForm(), openCreateForm(), resetForm(), submitForm(), validateTagForm()

### Community 65 - "our-school/OurSchoolPage.tsx"
Cohesion: 0.31
Nodes (8): emptyForm, FormState, optionalText(), OurSchoolPage(), deleteItem(), loadData(), resetForm(), saveItem()

### Community 66 - "school-calendar.tsx"
Cohesion: 0.29
Nodes (9): buildCells(), CalendarEvent, dateKey(), events, EventType, monthNames, padZ(), SchoolCalendar() (+1 more)

### Community 67 - "GalleryService"
Cohesion: 0.22
Nodes (3): PublicGalleryMediaController, publicGalleryMediaRoute, GalleryService

### Community 68 - "getErrorMessage"
Cohesion: 0.39
Nodes (9): NewsCategoriesRoute(), createCategory(), deleteCategory(), updateCategory(), NewsTagsRoute(), createTag(), deleteTag(), updateTag() (+1 more)

### Community 69 - "UploadVidio.tsx"
Cohesion: 0.31
Nodes (8): Mode, optionalText(), UploadVidio(), chooseFile(), handleDrop(), handleFileChange(), handleSubmit(), UploadVidioProps

### Community 70 - "NewsCategories"
Cohesion: 0.33
Nodes (6): createEmptyForm(), NewsCategories(), closeForm(), openCreateForm(), resetForm(), submitForm()

### Community 71 - "ProgramAcademic.tsx"
Cohesion: 0.28
Nodes (6): DecorativeDoodles(), ProgramAcademic(), ProgramAcademicItem, ProgramAcademicProps, programCards, Academic()

### Community 73 - "GalleryAssetPickerModal.tsx"
Cohesion: 0.32
Nodes (6): GalleryAssetKind, GalleryAssetPickerModal(), GalleryAssetPickerModalProps, GalleryAssetSelection, imageSelection(), videoSelection()

### Community 74 - "api.ts"
Cohesion: 0.39
Nodes (6): ApiError, apiRequest(), ApiRequestOptions, getErrorMessage(), isJsonBody(), readPayload()

### Community 75 - "galleryResponse"
Cohesion: 0.29
Nodes (4): galleryResponse(), imageResponse(), parseGalleryUpdate(), videoResponse()

### Community 76 - "ref_lib"
Cohesion: 0.29
Nodes (4): authApi, contactPageApi, heroApi, ref_lib

### Community 77 - "UploadImages"
Cohesion: 0.38
Nodes (5): UploadImages(), chooseFile(), handleDrop(), handleFileChange(), UploadImagesProps

### Community 78 - "auth.ts"
Cohesion: 0.29
Nodes (5): AuthUser, CmsPermission, CmsRole, CmsRoleName, EmployeeIdentity

### Community 79 - "MWS Website Backend"
Cohesion: 0.29
Nodes (6): Admin CRUD API, Database Commands, Development, MWS Website Backend, Scripts, Setup

### Community 80 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, typecheck

### Community 81 - "admissions/AdmissionsPage.tsx"
Cohesion: 0.47
Nodes (4): AdmissionsPage(), saveAdmissions(), optionalText(), updateProgramField()

### Community 82 - "CoverImagePickerModal.tsx"
Cohesion: 0.33
Nodes (3): CoverImagePickerModal(), CoverImagePickerModalProps, PickerMode

### Community 83 - "src/App.tsx"
Cohesion: 0.40
Nodes (4): RootApp(), client_src_index, ref_app, react-dom

### Community 86 - "vite.config.ts"
Cohesion: 0.40
Nodes (4): ref_node_url, @rolldown/plugin-babel, vite, @vitejs/plugin-react

### Community 87 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 90 - "heroData.ts"
Cohesion: 0.50
Nodes (3): HeroSlideMediaType, HeroSlideSourceType, ResolvedHeroSlide

### Community 91 - "Prioritas perbaikan sebelum frontend diintegrasikan"
Cohesion: 0.50
Nodes (4): P0 — wajib sebelum integrasi, P1 — dibutuhkan agar kedua halaman lengkap, P2 — penguatan dan optimasi, Prioritas perbaikan sebelum frontend diintegrasikan

## Knowledge Gaps
- **494 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+489 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 648 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `NewsPost` connect `Backend Review: Public News & News Detail` to `page-data-service.ts`, `adminApi.ts`?**
  _High betweenness centrality (0.238) - this node is a cross-community bridge._
- **Why does `ResponseError` connect `ResponseError` to `admin-crud-model.ts`, `hono`, `response-error.ts`, `Login.ts`, `our-school-service.ts`, `admin-page-editor-service.ts`, `NewsController`, `news-service.ts`, `cms-auth-service.ts`, `Galleries.ts`, `public-news-service.ts`, `hero-slide-service.ts`, `news-repository.ts`, `toJsonSafe`, `gallery-service.ts`, `contact-page-service.ts`, `PageDataService`, `GalleryRepository`, `minio.ts`, `requireUuid`, `AdminOurSchoolController`, `galleryResponse`, `.uploadVideo`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Why does `3. Service dan validation` connect `ResponseError` to `Backend Review: Public News & News Detail`, `NewsPostMedia`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _494 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `admin-crud-model.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0546583850931677 - nodes in this community are weakly interconnected._
- **Should `hono` be split into smaller, more focused modules?**
  _Cohesion score 0.11538461538461539 - nodes in this community are weakly interconnected._
- **Should `sections.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0708245243128964 - nodes in this community are weakly interconnected._