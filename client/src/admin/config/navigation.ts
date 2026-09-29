import {
  BookOpen,
  Files,
  Images,
  LayoutDashboard,
  LucideHome,
  MessageSquare,
  Newspaper,
  School,
  Tags,
  Users,
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
    ],
  },

  {
    items: [
      {
        label: 'Content',
        href: '/admin/content',
        Icon: Files,
        enabled: true,
        requiredPermission: 'content:manage',
        children: [
          {
            label: 'Home',
            href: '/admin/content/home',
            Icon: LucideHome,
            enabled: true,
            requiredPermission: 'content:manage',
          },
          {
            label: 'Admissions',
            href: '/admin/content/admissions',
            Icon: Files,
            enabled: true,
            requiredPermission: 'content:manage',
          },
          {
            label: 'Our School',
            href: '/admin/content/our-school',
            Icon: School,
            enabled: true,
            requiredPermission: 'content:manage',
          },
          {
            label: 'Community Stories',
            href: '/admin/content/community-stories',
            Icon: Images,
            enabled: true,
            requiredPermission: 'content:manage',
          },
          {
            label: 'Contact',
            href: '/admin/content/contact',
            Icon: MessageSquare,
            enabled: true,
            requiredPermission: 'content:manage',
          },
        ],
      },
      {
        label: 'Academic',
        Icon: School,
        enabled: true,
        requiredPermission: 'content:manage',
        children: [
          {
            label: 'Kindergarten',
            href: '/admin/academic/kindergarten',
            Icon: School,
            enabled: true,
            requiredPermission: 'content:manage',
          },
          {
            label: 'Elementary',
            href: '/admin/academic/elementary',
            Icon: School,
            enabled: true,
            requiredPermission: 'content:manage',
          },
          {
            label: 'High School',
            href: '/admin/academic/high-school',
            Icon: BookOpen,
            enabled: true,
            requiredPermission: 'content:manage',
          },
        ],
      },
      {
        label: 'News',
        Icon: Newspaper,
        enabled: true,
        requiredPermission: 'content:manage',
        children: [
          {
            label: 'Posts',
            href: '/admin/news',
            Icon: Newspaper,
            enabled: true,
            requiredPermission: 'content:manage',
          },
          {
            label: 'Categories',
            href: '/admin/news/categories',
            Icon: Files,
            enabled: true,
            requiredPermission: 'content:manage',
          },
          {
            label: 'Tags',
            href: '/admin/news/tags',
            Icon: Tags,
            enabled: true,
            requiredPermission: 'content:manage',
          },
        ],
      },
      {
        label: 'Gallery Library',
        href: '/admin/gallery',
        Icon: Images,
        enabled: true,
        requiredPermission: 'content:manage',
      },
      {
        label: 'CMS Users',
        href: '/admin/users',
        Icon: Users,
        enabled: true,
        requiredPermission: 'users:manage',
      },
    ],
  },
];

export default menuSections;
