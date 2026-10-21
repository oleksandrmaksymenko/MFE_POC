import { useState } from 'react';
import type { ProfileState } from './types';

export function App({ userId, name, email, bio, renderedAt }: ProfileState) {
  const [expanded, setExpanded] = useState(false);
  const [likes, setLikes] = useState(0);

  return (
    <section className="card">
      <h2>Profile</h2>
      <p className="meta">
        user <b>{userId}</b>SSR at {renderedAt}
      </p>
      <div className="row">
        <div className="avatar">{name[0]}</div>
        <div>
          <div className="name">{name}</div>
          <div className="email">{email}</div>
        </div>
      </div>
      <button data-testid="toggle-bio" onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Hide bio' : 'Show bio'}
      </button>
      <button data-testid="like" onClick={() => setLikes((n) => n + 1)}>
        heart(s) {likes}
      </button>
      {expanded && <p className="bio">{bio}</p>}
    </section>
  );
}
