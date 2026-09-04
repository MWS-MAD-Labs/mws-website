import CommunityVoices from "../components/ui/CommunityVoices";
import SubpageHero from "../components/ui/SubpageHero";
import { asset } from "../data/site";

export default function CommunityStories() {
  return (
    <main>
      <SubpageHero
        title="Community Stories"
        image={asset("Elementary.jpg")}
        imageAlt="MWS School Community Stories"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Community Stories" },
        ]}
      />

      <section className="subpage-section">
        <div className="wrap">
          <p
            className="lede"
            style={{ margin: "0 auto 60px", maxWidth: 800, textAlign: "center" }}
          >
            Nostrud tempor ultrices voluptate orci arcu, mollit excepteur curae.
            Pariatur veniam elit quis fugiat, officia ea vitae. Occaecat quam
            lacus qui commodo ipsum.
          </p>
        </div>
      </section>

      <CommunityVoices showFooterLink={false} />
    </main>
  );
}
