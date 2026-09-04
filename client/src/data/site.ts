export const asset = (fileName: string) => `/assets-mws/${fileName}`;

export const logoUrl =
  "https://millenniaws.sch.id/wp-content/uploads/2021/11/Millennia-World-School-Logo-Only.svg";

export const pageLinks = [
  { label: "Our School", path: "/our-school" },
  { label: "Admission", path: "/admission" },
  { label: "School Calendar", path: "/school-calendar" },
  { label: "School News", path: "/news" },
  { label: "Community Stories", path: "/community-stories" },
  { label: "Contact", path: "/contact" },
];

export const academicLinks = [
  {
    label: "Kindergarten",
    path: "/academic/kindergarten",
    description: "Early years learning",
  },
  {
    label: "Elementary",
    path: "/academic/elementary",
    description: "Primary inquiry and foundations",
  },
  {
    label: "High School",
    path: "/academic/high-school",
    description: "Secondary readiness and leadership",
  },
  {
    label: "Junior High",
    path: "/academic/junior-high",
    description: "Middle years exploration",
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

export const communityVoices = [
  {
    role: "Student",
    name: "Kianna A.",
    grade: "Grade 7 Student",
    image: asset("_DSC4760.jpg"),
    quote:
      "MWS gave me the confidence to speak up in front of people and explore my love for science projects.",
  },
  {
    role: "Parent",
    name: "Sarah & David M.",
    grade: "Parents of Grade 2 & 5",
    image: asset("Elementary.jpg"),
    quote:
      "Finding a school that values character as much as academics was essential for us. MWS exceeds every expectation.",
  },
  {
    role: "Educator",
    name: "Mr. Hendra",
    grade: "Primary Homeroom Teacher",
    image: asset("DSC04079.jpg"),
    quote:
      "Teaching here means watching children transform from curious thinkers into independent, compassionate leaders.",
  },
  {
    role: "Staff",
    name: "Ms. Maya",
    grade: "Head of Student Care",
    image: asset("_DSC4760.jpg"),
    quote:
      "Every child is known by name and supported individually so they feel safe to grow at their own pace.",
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
