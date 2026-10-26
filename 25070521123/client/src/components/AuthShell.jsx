import { MusicIcon, SparklesIcon, HeadphonesIcon, StarIcon } from './Icons';

/**
 * Split-screen layout used by both the Login and Register pages.
 */
export default function AuthShell({ badge, title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <div className="auth__brand">
          <span className="brand__logo">
            <MusicIcon size={22} />
          </span>
          <span className="brand__text">
            Melody<span className="brand__dot">.</span>
          </span>
        </div>

        <div className="auth__pitch">
          <span className="eyebrow">
            <SparklesIcon size={14} /> Your personal music library
          </span>
          <h1>
            Every track you love,
            <br />
            <span className="grad-text">beautifully organised.</span>
          </h1>
          <p>
            Add songs, rate them, build favourites and keep your whole collection in one
            calm, fast workspace.
          </p>

          <ul className="auth__points">
            <li>
              <HeadphonesIcon size={18} /> Create, edit and delete tracks
            </li>
            <li>
              <StarIcon size={18} /> Rate and favourite your best finds
            </li>
            <li>
              <SparklesIcon size={18} /> Live stats that update instantly
            </li>
          </ul>
        </div>

        <div className="auth__vinyl" aria-hidden="true">
          <span className="auth__vinyl-label" />
        </div>

        <p className="auth__foot">
          Full Stack Web Development &middot; CA3
        </p>
      </aside>

      <main className="auth__panel">
        <div className="auth__card">
          <span className="chip chip--soft">{badge}</span>
          <h2>{title}</h2>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
          <div className="auth__switch">{footer}</div>
        </div>
      </main>
    </div>
  );
}
