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

export type MenuSection = {
  label: string;
  items: MenuItem[];
};

export const menuSections: MenuSection[] = [
  {
    label: "Dashboard",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        Icon: LayoutDashboard,
        enabled: true,
        requiredPermission: "dashboard:read",
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Home Hero",
        href: "/admin/hero-slides",
        Icon: LucideHome,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Admissions",
        href: "/admin/programs/admissions",
        Icon: Files,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Our School",
        href: "/admin/our-school",
        Icon: School,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Community Stories",
        href: "/admin/community-stories",
        Icon: Images,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Contact Page",
        href: "/admin/contact",
        Icon: MessageSquare,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },
  {
    label: "Academic",
    items: [
      {
        label: "Kindergarten",
        href: "/admin/academic/kindergarten",
        Icon: School,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Elementary",
        href: "/admin/academic/elementary",
        Icon: School,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "High School",
        href: "/admin/academic/high-school",
        Icon: BookOpen,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },
  {
    label: "News",
    items: [
      {
        label: "Posts",
        href: "/admin/news",
        Icon: Newspaper,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Categories",
        href: "/admin/news/categories",
        Icon: Files,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Tags",
        href: "/admin/news/tags",
        Icon: Tags,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },
  {
    label: "Media",
    items: [
      {
        label: "Gallery Library",
        href: "/admin/gallery",
        Icon: Images,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "CMS Users",
        href: "/admin/users",
        Icon: Users,
        enabled: true,
        requiredPermission: "users:manage",
      },
    ],
  },
];

export default menuSections;
