import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';

export function EmptyNegotiation({ participants }) {
  return (
    <div className="empty-negotiation">
      <div className="network-visual" aria-hidden="true">
        <div className="network-ring" />
        {participants.slice(0, 5).map((participant, index) => (
          <div
            className={`network-person network-person-${index + 1}`}
            key={participant.id}
          >
            <Avatar name={participant.name} index={index} small />
          </div>
        ))}
        <div className="mediator-node">
          <Icon name="spark" size={24} />
        </div>
      </div>
      <span className="eyebrow">Sala de negociación</span>
      <h2>Los agentes aún no han hablado</h2>
      <p>
        Completa el pacto y los perfiles. Cada Gemini defenderá a una persona y
        el mediador buscará un punto de encuentro.
      </p>
      <div className="empty-steps">
        <span><b>1</b> Posiciones privadas</span>
        <span><b>2</b> Mediación neutral</span>
        <span><b>3</b> Aprobación humana</span>
      </div>
    </div>
  );
}
