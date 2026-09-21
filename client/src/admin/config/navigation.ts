import {
  BookOpen,
  CircleHelp,
  Files,
  Handshake,
  Images,
  LayoutDashboard,
  LucideHome,
  MessageSquare,
  Newspaper,
  School,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { CmsPermission } from "@/admin/types/auth";

export type MenuItem = {
  label: string;
  href?: string;
  Icon: LucideIcon;
  enabled: boolean;
  requiredPermission?: CmsPermission;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    Icon: LayoutDashboard,
    enabled: true,
    requiredPermission: 'dashboard:read',
  },

  {
    label: 'Website Pages',
    Icon: Files,
    enabled: true,
    children: [
      {
        label: 'Home Hero',
        href: '/admin/hero-slides',
        Icon: LucideHome,
        enabled: true,
        requiredPermission: 'content:manage',
      },

      {
        label: 'Admissions',
        href: '/admin/programs/admissions',
        Icon: Files,
        enabled: true,
        requiredPermission: 'content:manage',
      },

      {
        label: 'Our School',
        href: '/admin/our-school',
        Icon: School,
        enabled: true,
        requiredPermission: 'content:manage',
      },

      {
        label: 'Community Stories',
        href: '/admin/community-stories',
        Icon: Images,
        enabled: true,
        requiredPermission: 'content:manage',
      },

      {
        label: 'Contact',
        href: '/admin/contact',
        Icon: MessageSquare,
        enabled: true,
        requiredPermission: 'content:manage',
      },
    ],
  },

  {
    label: 'Academic Pages',
    Icon: BookOpen,
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
        label: 'Junior High',
        href: '/admin/academic/junior-high',
        Icon: School,
        enabled: true,
        requiredPermission: 'content:manage',
      },
    ],
  },

  {
    label: 'Program Content',
    Icon: BookOpen,
    enabled: true,
    requiredPermission: 'content:manage',
    children: [
      {
        label: 'Campus Tour',
        href: '/admin/programs/campus-tour',
        Icon: School,
        enabled: true,
        requiredPermission: 'content:manage',
      },
      {
        label: 'Curriculum',
        href: '/admin/programs/curriculum',
        Icon: BookOpen,
        enabled: true,
        requiredPermission: 'content:manage',
      },
      {
        label: 'Affiliations',
        href: '/admin/programs/affiliations',
        Icon: Handshake,
        enabled: true,
        requiredPermission: 'content:manage',
      },
    ],
  },

  {
    label: 'News',
    href: '/admin/news',
    Icon: Newspaper,
    enabled: true,
    requiredPermission: 'content:manage',
  },

  {
    label: 'Gallery Library',
    href: '/admin/gallery',
    Icon: Images,
    enabled: true,
    requiredPermission: 'content:manage',
  },

  {
    label: 'Administration',
    Icon: ShieldCheck,
    enabled: true,
    children: [
      {
        label: 'CMS Users',
        href: '/admin/users',
        Icon: Users,
        enabled: true,
        requiredPermission: 'users:manage',
      },
      {
        label: 'Roles & Permissions',
        href: '/admin/permissions',
        Icon: ShieldCheck,
        enabled: true,
        requiredPermission: 'users:manage',
      },
      {
        label: 'Audit Logs',
        href: '/admin/audit-logs',
        Icon: Files,
        enabled: true,
      },
    ],
  },

  {
    label: 'Help & Docs',
    href: '/admin/help',
    Icon: CircleHelp,
    enabled: true,
  },
];

export default menuItems;
