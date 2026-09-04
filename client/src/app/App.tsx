import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import Academic from "../pages/Academic";
import Admission from "../pages/admission";
import CommunityStories from "../pages/community-stories";
import Contact from "../pages/contact";
import Home from "../pages/home";
import Kurikulum from "../pages/kurikulum";
import OurSchool from "../pages/our-school";
import SchoolCalendar from "../pages/school-calendar";
import Elementary from "../pages/level/elementary";
import HighSchool from "../pages/level/high-school";
import Kindergarten from "../pages/level/kindergarten";
import NewsDetail from "../pages/news/news-detail";
import SchoolNews from "../pages/news/school-news";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route index element={<Home />} />
          <Route path="our-school" element={<OurSchool />} />
          <Route path="admission" element={<Admission />} />
          <Route path="academic" element={<Academic />} />
          <Route path="academic/kindergarten" element={<Kindergarten />} />
          <Route path="academic/elementary" element={<Elementary />} />
          <Route path="academic/high-school" element={<HighSchool />} />
          <Route path="academic/junior-high" element={<HighSchool />} />
          <Route path="kindergarten" element={<Navigate to="/academic/kindergarten" replace />} />
          <Route path="elementary" element={<Navigate to="/academic/elementary" replace />} />
          <Route path="high-school" element={<Navigate to="/academic/high-school" replace />} />
          <Route path="junior-high" element={<Navigate to="/academic/junior-high" replace />} />
          <Route path="kurikulum" element={<Kurikulum />} />
          <Route path="school-calendar" element={<SchoolCalendar />} />
          <Route path="news" element={<SchoolNews />} />
          <Route path="school-news" element={<Navigate to="/news" replace />} />
          <Route path="news/detail" element={<NewsDetail />} />
          <Route path="news-detail" element={<Navigate to="/news/detail" replace />} />
          <Route path="community-stories" element={<CommunityStories />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
