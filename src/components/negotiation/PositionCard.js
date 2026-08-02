import { Avatar } from '../common/Avatar';

const statusLabels = {
  open: 'Abierto',
  cautious: 'Con reservas',
  blocked: 'Bloqueado',
};

export function PositionCard({ position, participant, index }) {
  return (
    <article className={`position-card position-${position.status}`}>
      <div className="position-head">
        <Avatar name={participant.name} index={index} small />
        <div>
          <h4>Agente de {participant.name}</h4>
          <span>{statusLabels[position.status]}</span>
        </div>
        <strong>{position.compatibilityScore}%</strong>
      </div>
      <p>“{position.publicMessage}”</p>
      {position.concessions?.length > 0 && (
        <div className="position-foot">
          Puede ceder: {position.concessions.slice(0, 2).join(' · ')}
        </div>
      )}
    </article>
  );
}
