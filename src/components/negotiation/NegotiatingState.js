import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';

export function NegotiatingState({ participants, round }) {
  return (
    <div className="negotiating-state">
      <div className="negotiating-orbit">
        <span className="orbit-center"><Icon name="spark" size={24} /></span>
        <span className="orbit-dot orbit-dot-one" />
        <span className="orbit-dot orbit-dot-two" />
        <span className="orbit-dot orbit-dot-three" />
      </div>
      <span className="eyebrow">Ronda {round}</span>
      <h2>Los agentes están negociando</h2>
      <p>Preparan posiciones públicas sin revelar las notas privadas.</p>
      <div className="agent-progress-list">
        {participants.map((participant, index) => (
          <div className="agent-progress" key={participant.id}>
            <Avatar name={participant.name} index={index} small />
            <span>Agente de {participant.name}</span>
            <i />
          </div>
        ))}
        <div className="agent-progress mediator-progress">
          <span className="mini-mediator"><Icon name="spark" size={14} /></span>
          <span>Mediador</span>
          <i />
        </div>
      </div>
    </div>
  );
}
