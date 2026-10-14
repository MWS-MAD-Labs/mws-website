
import {
  Baby,
  BookOpen,
  CalendarDays,
  Files,
  GalleryVerticalEnd,
  GraduationCap,
  Images,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Newspaper,
  School,
  Tags,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';

import type { CmsPermission } from '@/admin/types/auth';

export type MenuItem = {
  label: string;
  href?: string;
  Icon: LucideIcon;
  enabled: boolean;
  requiredPermission?: CmsPermission;
  children?: MenuItem[];
};

export type MenuSection = {
  items: MenuItem[];
};

const contentPermission = 'content:manage' satisfies CmsPermission;

const contentPages: MenuItem[] = [
  {
    label: 'Home',
    href: '/admin/content/home',
    Icon: LayoutDashboard,
    enabled: true,
    requiredPermission: contentPermission,
  },
  {
    label: 'Quotes',
    href: '/admin/content/Quotes',
    Icon: LayoutDashboard,
    enabled: true,
    requiredPermission: contentPermission,
  },
  {
    label: 'Admissions',
    href: '/admin/content/admissions',
    Icon: Files,
    enabled: true,
    requiredPermission: contentPermission,
  },
  // {
  //   label: 'Admission Guidelines',
  //   href: '/admin/content/admission-guidelines',
  //   Icon: Files,
  //   enabled: true,
  //   requiredPermission: contentPermission,
  // },
  {
    label: 'About MWS',
    href: '/admin/content/about-mws',
    Icon: School,
    enabled: true,
    requiredPermission: contentPermission,
  },
  {
    label: 'Contact',
    href: '/admin/content/contact',
    Icon: MessageSquare,
    enabled: true,
    requiredPermission: contentPermission,
  },
];

export const menuSections: MenuSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        Icon: LayoutDashboard,
        enabled: true,
        requiredPermission: 'dashboard:read',
      },
      {
        label: 'Inquiries',
        href: '/admin/inquiries',
        Icon: Inbox,
        enabled: true,
        requiredPermission: contentPermission,
      },
    ],
  },
  {
    items: [
      {
        label: 'Content',
        Icon: Files,
        enabled: true,
        requiredPermission: contentPermission,
        children: [
          {
            label: 'Pages',
            Icon: Files,
            enabled: true,
            requiredPermission: contentPermission,
            children: contentPages,
          },
          {
            label: 'Community',
            Icon: Users,
            enabled: true,
            requiredPermission: contentPermission,
            children: [
              {
                label: 'Community Stories',
                href: '/admin/content/community-stories',
                Icon: Images,
                enabled: true,
                requiredPermission: contentPermission,
              },
              {
                label: 'Community Voices',
                href: '/admin/content/community-voices',
                Icon: MessageSquare,
                enabled: true,
                requiredPermission: contentPermission,
              },
            ],
          },
          {
            label: 'Promotions',
            Icon: Megaphone,
            href: '/admin/content/popup-promoted',
            enabled: true,
            requiredPermission: contentPermission,
          },
        ],
      },
      {
        label: 'Academic',
        Icon: GraduationCap,
        enabled: true,
        requiredPermission: contentPermission,
        children: [
          {
            label: 'Overview',
            href: '/admin/academic',
            Icon: LayoutDashboard,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'Kindergarten',
            href: '/admin/academic/kindergarten',
            Icon: Baby,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'Elementary',
            href: '/admin/academic/elementary',
            Icon: BookOpen,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'High School',
            href: '/admin/academic/high-school',
            Icon: GraduationCap,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'FAQ',
            href: '/admin/academic/faqs',
            Icon: MessageSquare,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'Partners',
            href: '/admin/academic/partners',
            Icon: Users,
            enabled: true,
            requiredPermission: contentPermission,
          },
        ],
      },
      {
        label: 'News',
        Icon: Newspaper,
        enabled: true,
        requiredPermission: contentPermission,
        children: [
          {
            label: 'Posts',
            href: '/admin/news',
            Icon: Newspaper,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'Categories',
            href: '/admin/news/categories',
            Icon: Files,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'Tags',
            href: '/admin/news/tags',
            Icon: Tags,
            enabled: true,
            requiredPermission: contentPermission,
          },
        ],
      },
      {
        label: 'Gallery',
        Icon: GalleryVerticalEnd,
        enabled: true,
        requiredPermission: contentPermission,
        children: [
          {
            label: 'Gallery Library',
            href: '/admin/gallery',
            Icon: GalleryVerticalEnd,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'Gallery Images',
            href: '/admin/gallery/images',
            Icon: Images,
            enabled: true,
            requiredPermission: contentPermission,
          },
          {
            label: 'Gallery Videos',
            href: '/admin/gallery/videos',
            Icon: Video,
            enabled: true,
            requiredPermission: contentPermission,
          },
        ],
      },
      {
        label: 'Calendar',
        href: '/admin/calendar',
        Icon: CalendarDays,
        enabled: true,
        requiredPermission: contentPermission,
      },
      {
        label: 'CMS Users',
        href: '/admin/users',
        Icon: Users,
        enabled: true,
        requiredPermission: 'users:manage',
      },
      {
        label: 'Audit Logs',
        href: '/admin/audit-logs',
        Icon: Files,
        enabled: true,
        requiredPermission: 'users:manage',
      },
    ],
  },
];

export default menuSections;
;
