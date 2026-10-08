export const asset = (fileName: string) => `/assets-mws/${fileName}`;

export const logoUrl = '/Millennia-World-School-Logo-Only.svg';

export const pageLinks = [
  {
    label: 'About MWS',
    path: '/our-school',
  },
  {
    label: 'Admission',
    path: '/admission',
  },
  {
    label: 'Community Stories',
    path: '/community-stories',
  },
  {
    label: 'FAQ',
    path: '/admission/faq',
  },
];

export const academicLinks = [
  {
    label: 'Kindergarten',
    path: '/academic/kindergarten',
    description: 'Early years learning',
  },
  {
    label: 'Elementary',
    path: '/academic/elementary',
    description: 'Primary inquiry and foundations',
  },
  {
    label: 'Junior High',
    path: '/academic/junior-high',
    description: 'Middle years exploration',
  },
];

export const programCards = [
  {
    id: "kindergarten",
    title: "Kindergarten",
    age: "Age 2 - 6",
    text: "Quam pariatur eleifend odio nisi labore vestibulum.",
    image: asset("Kindergarten.jpg"),
    path: "/academic/kindergarten",
  },
  {
    id: "elementary",
    title: "Elementary",
    age: "Age 6 - 12",
    text: "Qui lacus ut proident officia enim aute.",
    image: asset("Elementary.jpg"),
    path: "/academic/elementary",
  },
  {
    id: "high-school",
    title: "High School",
    age: "Age 12 - 15",
    text: "Ante voluptate duis cillum eu ex sunt.",
    image: asset("JH.jpg"),
    path: "/academic/high-school",
  },
];

export const newsPosts = [
  {
    category: "School Life",
    badgeClass: "badge-school",
    date: "Aug 18, 2026",
    author: "MWS Editorial",
    title: "A New Academic Year Begins With Community and Curiosity",
    text: "Curae incididunt posuere consequat, vitae reprehenderit euismod tempor. Students returned to campus with assemblies, buddy activities, and classroom orientation.",
    image: asset("_DSC4760.jpg"),
    readTime: "4 min read",
  },
  {
    category: "Academics",
    badgeClass: "badge-academic",
    date: "Aug 10, 2026",
    author: "Academic Team",
    title: "Inquiry Projects Bring STEAM Learning Into Everyday Classrooms",
    text: "Lacus aliquip culpa laboris voluptate aute excepteur. Elementary and secondary learners explored science, art, ecology, and design.",
    image: asset("_DSC7101.jpg"),
    readTime: "5 min read",
  },
  {
    category: "Milestone",
    badgeClass: "badge-milestone",
    date: "Jul 28, 2026",
    author: "MWS Community",
    title: "Families Gather for a Morning of Stories, Music, and Food",
    text: "Veniam esse ea officia sint ex odio id. Parents, students, and teachers shared a warm celebration of school culture.",
    image: asset("DSC04079.jpg"),
    readTime: "3 min read",
  },
];
