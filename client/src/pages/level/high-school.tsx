import { asset } from "../../data/site";
import LevelPage from "./LevelPage";

export default function HighSchool() {
  return (
    <LevelPage
      title="High School"
      heroImage={asset("JH.jpg")}
      intro="The secondary pathway helps students strengthen academic confidence, leadership, and readiness for more independent learning."
      ageRange="Age 12 - 15"
      focus="Subject depth, inquiry projects, communication, leadership, wellbeing, and preparation for the next academic stage."
      tableRows={[
        ["Academics", "Depth and discipline", "Subject-based projects, seminars, assessment practice, and reflection"],
        ["Leadership", "Voice and responsibility", "Peer collaboration, presentations, service, and student-led initiatives"],
        ["Readiness", "Independent learning habits", "Planning routines, mentoring, and progress conversations"],
      ]}
      activities={[
        { title: "Secondary Inquiry", image: asset("_DSC7101.jpg") },
        { title: "Leadership Practice", image: asset("JH.jpg") },
        { title: "Project Exhibition", image: asset("_DSC7101.jpg") },
      ]}
    />
  );
}
