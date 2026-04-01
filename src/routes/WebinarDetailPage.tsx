import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { ApiError } from "../lib/api/client";
import { useWebinarDetail } from "../hooks/useWebinarDetail";
import { buildWebinarCtas, formatProviderHost, formatStatusLabel, formatWebinarSchedule, getHeroImage } from "../lib/webinars";

interface DetailLocationState {
  fromSearch?: string;
}

function splitDescription(value: string): string[] {
  return value
    .split(/\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function WebinarDetailPage() {
  const params = useParams();
  const location = useLocation();
  const state = location.state as DetailLocationState | null;
  const webinarQuery = useWebinarDetail(params.id ?? "");
  const webinar = webinarQuery.data;
  const backHref = state?.fromSearch ? `/${state.fromSearch}` : "/";

  useEffect(() => {
    document.title = webinar ? `${webinar.topic} | WebinarTV Search` : "Webinar detail | WebinarTV Search";
  }, [webinar]);

  if (webinarQuery.isPending) {
    return (
      <main className="page-shell detail-page">
        <section className="state-card">
          <p className="state-card__eyebrow">Loading webinar</p>
          <h1>Pulling the detail view together</h1>
          <p>The page is requesting the full webinar record from the catalog API.</p>
        </section>
      </main>
    );
  }

  if (webinarQuery.isError) {
    const isNotFound = webinarQuery.error instanceof ApiError && webinarQuery.error.status === 404;

    return (
      <main className="page-shell detail-page">
        <section className="state-card state-card--error">
          <p className="state-card__eyebrow">{isNotFound ? "Not found" : "Request problem"}</p>
          <h1>{isNotFound ? "That webinar is no longer in the catalog" : "The detail view could not be loaded"}</h1>
          <p>
            {isNotFound
              ? "The requested webinar ID did not resolve to an item in the public WebinarTV feed."
              : "The API request failed before the detailed record could be rendered."}
          </p>
          <div className="detail-page__actions">
            <Link className="button-link" to={backHref}>
              Back to search
            </Link>
            <Link className="button-link button-link--secondary" to="/">
              Browse homepage
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!webinar) {
    return null;
  }

  const heroImage = getHeroImage(webinar);
  const ctas = buildWebinarCtas(webinar);
  const descriptionSegments = splitDescription(webinar.description);

  return (
    <main className="page-shell detail-page">
      <header className="detail-hero">
        <div className="detail-hero__media">
          {heroImage ? (
            <img src={heroImage} alt="" />
          ) : (
            <div className="detail-hero__placeholder" aria-hidden="true">
              <span>WebinarTV</span>
              <strong>{webinar.category}</strong>
            </div>
          )}
        </div>
        <div className="detail-hero__content">
          <Link className="detail-hero__back-link" to={backHref}>
            Back to search
          </Link>
          <div className="detail-hero__badges">
            <span className={`badge badge--${webinar.status}`}>{formatStatusLabel(webinar.status)}</span>
            <span className="badge badge--neutral">{webinar.category}</span>
            {webinar.hasRecording ? <span className="badge badge--neutral">Recording available</span> : null}
          </div>
          <h1>{webinar.topic}</h1>
          <p className="detail-hero__schedule">{formatWebinarSchedule(webinar)}</p>
          <p className="detail-hero__lede">
            Hosted via {formatProviderHost(webinar.providerHost)} with source coverage from {webinar.sourceMeta.variantCount} catalog
            {webinar.sourceMeta.variantCount === 1 ? " entry" : " entries"}.
          </p>
          <div className="detail-page__actions">
            {ctas.map((cta, index) => (
              <a
                key={cta.href}
                className={`button-link ${index > 0 ? "button-link--secondary" : ""}`}
                href={cta.href}
                target="_blank"
                rel="noreferrer"
              >
                {cta.label}
              </a>
            ))}
            {ctas.length === 0 ? <span className="detail-hero__cta-note">No external registration or playback link is available.</span> : null}
          </div>
        </div>
      </header>

      <section className="detail-grid">
        <article className="detail-panel">
          <p className="detail-panel__eyebrow">Overview</p>
          <h2>About this webinar</h2>
          {descriptionSegments.length > 0 ? (
            descriptionSegments.map((segment) => <p key={segment}>{segment}</p>)
          ) : (
            <p>No description was provided for this webinar.</p>
          )}
        </article>

        <aside className="detail-sidebar">
          <section className="detail-panel">
            <p className="detail-panel__eyebrow">Event details</p>
            <dl className="detail-list">
              <div>
                <dt>Status</dt>
                <dd>{formatStatusLabel(webinar.status)}</dd>
              </div>
              <div>
                <dt>Provider</dt>
                <dd>{formatProviderHost(webinar.providerHost)}</dd>
              </div>
              <div>
                <dt>Host</dt>
                <dd>{webinar.host.name ?? "Host TBD"}</dd>
              </div>
              <div>
                <dt>Schedule</dt>
                <dd>{formatWebinarSchedule(webinar)}</dd>
              </div>
              <div>
                <dt>Register required</dt>
                <dd>{webinar.isRegisterRequired ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-panel">
            <p className="detail-panel__eyebrow">Catalog context</p>
            <dl className="detail-list">
              <div>
                <dt>Category</dt>
                <dd>{webinar.category}</dd>
              </div>
              <div>
                <dt>Source buckets</dt>
                <dd>{webinar.sourceBuckets.join(", ")}</dd>
              </div>
              <div>
                <dt>Score</dt>
                <dd>{webinar.score ?? "Unknown"}</dd>
              </div>
              <div>
                <dt>Trending</dt>
                <dd>{webinar.trending ?? "Unknown"}</dd>
              </div>
              <div>
                <dt>Catalog ID</dt>
                <dd className="detail-list__mono">{webinar.id}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </section>
    </main>
  );
}
