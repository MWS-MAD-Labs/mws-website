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

type MenuItem = {
  label: string;
  href?: string;
  Icon: LucideIcon;
  enabled: boolean;
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
      },
      {
        label: "News",
        href: "/admin/news",
        Icon: Newspaper,
        enabled: true,
      },
      {
        label: "Programs",
        href: "/admin/programs",
        Icon: BookOpen,
        enabled: true,
      },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        Icon: MessageSquare,
        enabled: true,
      },
      {
        label: "FAQs",
        href: "/admin/faqs",
        Icon: CircleHelp,
        enabled: true,
      },
      {
        label: "Affiliations",
        href: "/admin/affiliations",
        Icon: Handshake,
        enabled: true,
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
      },
      {
        label: "Applications",
        href: "/admin/admissions/applications",
        Icon: Files,
        enabled: true,
      },
      {
        label: "Applicants",
        href: "/admin/admissions/applicants",
        Icon: Users,
        enabled: true,
      },
    ],
  },

  {
    label: "Events",
    href: "/admin/events",
    Icon: CalendarDays,
    enabled: true,
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
      },
      {
        label: "Invoices & Payments",
        href: "/admin/finance/payments",
        Icon: WalletCards,
        enabled: true,
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
      },
      {
        label: "Bulk Uploads",
        href: "/admin/media/uploads",
        Icon: Images,
        enabled: true,
      },
    ],
  },

  {
    label: "Site Navigation",
    href: "/admin/navigation",
    Icon: PanelTop,
    enabled: true,
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
      },
      {
        label: "Roles & Permissions",
        href: "/admin/permissions",
        Icon: ShieldCheck,
        enabled: true,
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
      },
      {
        label: "Bot Settings",
        href: "/admin/chat/settings",
        Icon: Settings,
        enabled: true,
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
      },
    ],
  },

  {
    label: "Settings",
    href: "/admin/settings",
    Icon: Settings,
    enabled: true,
  },

  {
    label: "Help & Docs",
    href: "/admin/help",
    Icon: CircleHelp,
    enabled: true,
  },
];

export default menuItems;
