import { PERSON_COLORS } from '../../config';

export function Avatar({ name, index, small = false }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <span
      className={`avatar ${small ? 'avatar-small' : ''}`}
      style={{ '--avatar-color': PERSON_COLORS[index % PERSON_COLORS.length] }}
    >
      {initials}
    </span>
  );
}
