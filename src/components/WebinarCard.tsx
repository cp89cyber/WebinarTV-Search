import { Link } from "react-router-dom";

import type { WebinarSummary } from "../lib/api/schemas";
import {
  createDescriptionExcerpt,
  formatProviderHost,
  formatStatusLabel,
  formatWebinarSchedule,
  getPosterHue,
  getWebinarSignal
} from "../lib/webinars";

interface WebinarCardProps {
  webinar: WebinarSummary;
  fromSearch: string;
}

export function WebinarCard({ webinar, fromSearch }: WebinarCardProps) {
  return (
    <article className="card" style={{ "--card-hue": String(getPosterHue(`${webinar.category}:${webinar.id}`)) } as React.CSSProperties}>
      <div className="card__poster" aria-hidden="true">
        <span>{webinar.category}</span>
        <strong>{webinar.topic.slice(0, 2).toUpperCase()}</strong>
        <p>{formatProviderHost(webinar.providerHost)}</p>
      </div>
      <div className="card__body">
        <div className="card__meta">
          <span className={`badge badge--${webinar.status}`}>{formatStatusLabel(webinar.status)}</span>
          <span>{formatWebinarSchedule(webinar)}</span>
        </div>
        <h3>
          <Link
            to={`/webinars/${encodeURIComponent(webinar.id)}`}
            state={{ fromSearch }}
            className="card__title-link"
          >
            {webinar.topic}
          </Link>
        </h3>
        <p className="card__description">{createDescriptionExcerpt(webinar.description)}</p>
        <dl className="card__facts">
          <div>
            <dt>Provider</dt>
            <dd>{formatProviderHost(webinar.providerHost)}</dd>
          </div>
          <div>
            <dt>Signal</dt>
            <dd>{getWebinarSignal(webinar)}</dd>
          </div>
        </dl>
        <div className="card__footer">
          <span className="card__category-chip">{webinar.category}</span>
          <span className="card__cta">View details</span>
        </div>
      </div>
    </article>
  );
}
