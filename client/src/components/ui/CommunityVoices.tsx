import { useState } from "react";
import { Link } from "react-router-dom";
import { communityVoices } from "../../data/site";

type Voice = (typeof communityVoices)[number];

export default function CommunityVoices({ showFooterLink = true }) {
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);

  return (
    <>
      <section className="community-voices wrap reveal" id="community-voices">
        <div className="community-header">
          <h2>Voices of our community.</h2>
          <p>Augue vel ea in arcu aliquip vitae curae quis praesent augue esse.</p>
        </div>

        <div className="voices-grid">
          {communityVoices.map((voice) => (
            <article
              key={voice.name}
              className="voice-card"
              onClick={() => setSelectedVoice(voice)}
            >
              <div className="voice-media">
                <img src={voice.image} alt={`${voice.role} Voice`} />
                <div className="play-btn">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="voice-info">
                <span className="voice-role">{voice.role}</span>
                <h3 className="voice-name">{voice.name}</h3>
              </div>
            </article>
          ))}
        </div>

        {showFooterLink && (
          <div className="community-footer-link">
            <Link to="/community-stories" className="btn-secondary">
              Read all community stories <span>&rarr;</span>
            </Link>
          </div>
        )}
      </section>

      <div
        className={`voice-modal ${selectedVoice ? "active" : ""}`}
        aria-hidden={!selectedVoice}
      >
        <div className="modal-overlay" onClick={() => setSelectedVoice(null)} />
        <div className="modal-container">
          <button
            className="modal-close"
            type="button"
            aria-label="Close modal"
            onClick={() => setSelectedVoice(null)}
          >
            &times;
          </button>

          <div className="modal-body">
            <div className="modal-video-wrapper">
              {selectedVoice && <img src={selectedVoice.image} alt="" />}
            </div>
            <div className="modal-caption-wrapper">
              <span className="modal-role">{selectedVoice?.role ?? "Role"}</span>
              <blockquote>
                {selectedVoice ? `"${selectedVoice.quote}"` : '"Quote text goes here..."'}
              </blockquote>
              <div className="modal-author">
                <h4>{selectedVoice?.name ?? "Author Name"}</h4>
                <p>{selectedVoice?.grade ?? "Sub-info / Grade"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
