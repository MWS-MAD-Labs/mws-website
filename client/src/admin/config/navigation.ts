import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  Files,
  FolderOpen,
  Handshake,
  Images,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Newspaper,
  PanelTop,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
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
    label: "Dashboard",
    href: "/admin",
    Icon: LayoutDashboard,
    enabled: true,
  },

  {
    label: "Content",
    Icon: Files,
    enabled: true,
    children: [
      {
        label: "Pages",
        href: "/admin/pages",
        Icon: Files,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "News",
        href: "/admin/news",
        Icon: Newspaper,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Programs",
        href: "/admin/programs",
        Icon: BookOpen,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        Icon: MessageSquare,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "FAQs",
        href: "/admin/faqs",
        Icon: CircleHelp,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Affiliations",
        href: "/admin/affiliations",
        Icon: Handshake,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },

  {
    label: "Admissions",
    Icon: Megaphone,
    enabled: true,
    children: [
      {
        label: "Inquiries",
        href: "/admin/admissions/inquiries",
        Icon: MessageSquare,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Applications",
        href: "/admin/admissions/applications",
        Icon: Files,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Applicants",
        href: "/admin/admissions/applicants",
        Icon: Users,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },

  {
    label: "Events",
    href: "/admin/events",
    Icon: CalendarDays,
    enabled: true,
    requiredPermission: "content:manage",
  },

  {
    label: "Tuition & Finance",
    Icon: WalletCards,
    enabled: true,
    children: [
      {
        label: "Tuition Fees",
        href: "/admin/finance/tuition",
        Icon: WalletCards,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Invoices & Payments",
        href: "/admin/finance/payments",
        Icon: WalletCards,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },

  {
    label: "Media",
    Icon: Images,
    enabled: true,
    children: [
      {
        label: "Media Library",
        href: "/admin/media",
        Icon: FolderOpen,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Bulk Uploads",
        href: "/admin/media/uploads",
        Icon: Images,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },

  {
    label: "Site Navigation",
    href: "/admin/navigation",
    Icon: PanelTop,
    enabled: true,
    requiredPermission: "content:manage",
  },

  {
    label: "Users & Permissions",
    Icon: ShieldCheck,
    enabled: true,
    children: [
      {
        label: "Users",
        href: "/admin/users",
        Icon: Users,
        enabled: true,
        requiredPermission: "users:manage",
      },
      {
        label: "Roles & Permissions",
        href: "/admin/permissions",
        Icon: ShieldCheck,
        enabled: true,
        requiredPermission: "users:manage",
      },
    ],
  },

  {
    label: "Chat / AI",
    Icon: MessageSquare,
    enabled: true,
    children: [
      {
        label: "Chat Sessions",
        href: "/admin/chat/sessions",
        Icon: MessageSquare,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Bot Settings",
        href: "/admin/chat/settings",
        Icon: Settings,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },

  {
    label: "Reports & Logs",
    Icon: ChartNoAxesCombined,
    enabled: true,
    children: [
      {
        label: "Activity Logs",
        href: "/admin/logs/activity",
        Icon: Files,
        enabled: true,
        requiredPermission: "content:manage",
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        Icon: BarChart3,
        enabled: true,
      },
      {
        label: "Error & Integration Logs",
        href: "/admin/logs/errors",
        Icon: Files,
        enabled: true,
        requiredPermission: "content:manage",
      },
    ],
  },

  {
    label: "Settings",
    href: "/admin/settings",
    Icon: Settings,
    enabled: true,
    requiredPermission: "content:manage",
  },

  {
    label: "Help & Docs",
    href: "/admin/help",
    Icon: CircleHelp,
    enabled: true,
  },
];

export default menuItems;
