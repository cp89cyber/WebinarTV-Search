import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="state-card">
        <p className="state-card__eyebrow">404</p>
        <h1>This page doesn't exist in the WebinarTV catalog</h1>
        <p>Use the homepage to search the public webinar feed and reopen a valid detail page.</p>
        <Link className="button-link" to="/">
          Return to search
        </Link>
      </section>
    </main>
  );
}
