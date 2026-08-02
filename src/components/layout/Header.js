import { GITHUB_URL } from '../../config';
import { ConnectionBadge } from '../common/ConnectionBadge';
import { Icon } from '../common/Icon';

export function Header({ connection }) {
  return (
    <header className="topbar">
      <a className="brand" href="#inicio" aria-label="Nexo Pact, inicio">
        <span className="brand-mark">
          <span />
          <span />
          <span />
        </span>
        <span>
          <strong>Nexo</strong>
          <small>Pact</small>
        </span>
      </a>
      <div className="topbar-actions">
        <ConnectionBadge connection={connection} />
        <a
          className="github-link"
          href={GITHUB_URL}
          rel="noreferrer"
          target="_blank"
        >
          <Icon name="github" size={18} />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
}
