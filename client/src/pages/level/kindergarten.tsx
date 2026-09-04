import { asset } from "../../data/site";
import LevelPage from "./LevelPage";

export default function Kindergarten() {
  return (
    <LevelPage
      title="Kindergarten"
      heroImage={asset("Kindergarten.jpg")}
      intro="The early years program supports curiosity, language, social confidence, and joyful independence through play-based inquiry."
      ageRange="Age 2 - 6"
      focus="Early language, sensory exploration, foundational numeracy, movement, care routines, and friendship skills."
      tableRows={[
        ["Language", "Listening and early expression", "Stories, songs, conversation, and guided vocabulary routines"],
        ["Inquiry", "Observation and wondering", "Hands-on provocations, nature walks, and simple projects"],
        ["Wellbeing", "Security and independence", "Care rhythms, movement, rest, and social-emotional practice"],
      ]}
      activities={[
        { title: "Play-Based Inquiry", image: asset("Kindergarten.jpg") },
        { title: "Early Language Circles", image: asset("Kindergarten.jpg") },
        { title: "Creative Exploration", image: asset("Kindergarten.jpg") },
      ]}
    />
  );
}
