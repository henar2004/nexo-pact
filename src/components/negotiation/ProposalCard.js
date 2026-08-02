import { MAX_ROUNDS } from '../../config';
import { Avatar } from '../common/Avatar';
import { Icon } from '../common/Icon';
import { PositionCard } from './PositionCard';

export function ProposalCard({
  result,
  participants,
  votes,
  feedback,
  onVote,
  onFeedback,
  onNextRound,
  onReset,
  onCopy,
}) {
  const { mediation, positions, round, meta } = result;
  const proposal = mediation.proposal;
  const allVoted = participants.every((participant) => votes[participant.id]);
  const allAccepted =
    allVoted &&
    participants.every((participant) => votes[participant.id] === 'accept');
  const hasRejection = Object.values(votes).some((vote) => vote === 'reject');

  return (
    <div className="result-stack">
      <div className="round-summary">
        <div>
          <span className="eyebrow">Conversación pública</span>
          <h2>Ronda {round} de {MAX_ROUNDS}</h2>
        </div>
        <span className="round-meta">
          {meta?.calls || positions.length + 1} llamadas · {meta?.model || 'Gemini'}
        </span>
      </div>

      <div className="positions-grid">
        {positions.map((position) => {
          const index = participants.findIndex(
            (participant) => participant.id === position.participantId
          );
          const participant = participants[index] || {
            name: position.participantName,
          };
          return (
            <PositionCard
              index={Math.max(index, 0)}
              key={position.participantId}
              participant={participant}
              position={position}
            />
          );
        })}
      </div>

      <article className="proposal-card">
        <div className="proposal-topline">
          <span className="mediator-mark"><Icon name="spark" size={18} /></span>
          <span>Mediador neutral</span>
          <span className="consensus-pill">
            {mediation.consensusScore}% de encaje
          </span>
        </div>
        <h2>{proposal.headline}</h2>
        <p className="proposal-description">{proposal.description}</p>

        <div className="proposal-facts">
          <div>
            <span>Cuándo</span>
            <strong>{proposal.when}</strong>
          </div>
          <div>
            <span>Dónde</span>
            <strong>{proposal.where}</strong>
          </div>
          <div>
            <span>Coste</span>
            <strong>{proposal.estimatedCost}</strong>
          </div>
        </div>

        {proposal.steps?.length > 0 && (
          <div className="proposal-section">
            <h3>El plan</h3>
            <ol>
              {proposal.steps.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="proposal-columns">
          <div>
            <h3>Por qué puede funcionar</h3>
            <ul className="check-list">
              {proposal.whyItWorks?.map((item, index) => (
                <li key={`${item}-${index}`}><Icon name="check" size={15} />{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Compromisos</h3>
            <ul>
              {proposal.compromises?.length ? (
                proposal.compromises.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))
              ) : (
                <li>No se han detectado compromisos importantes.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mediator-message">
          <Icon name="spark" size={16} />
          {mediation.mediatorMessage}
        </div>
      </article>

      <section className={`vote-panel ${allAccepted ? 'vote-panel-success' : ''}`}>
        <div className="vote-heading">
          <div>
            <span className="eyebrow">
              {allAccepted ? 'Pacto cerrado' : 'Decisión humana'}
            </span>
            <h2>
              {allAccepted
                ? 'Todos han aceptado'
                : '¿Acepta cada persona esta propuesta?'}
            </h2>
          </div>
          {allAccepted && <span className="success-seal"><Icon name="check" size={22} /></span>}
        </div>

        <div className="vote-list">
          {participants.map((participant, index) => (
            <div className="vote-row" key={participant.id}>
              <div className="vote-person">
                <Avatar name={participant.name} index={index} small />
                <strong>{participant.name}</strong>
              </div>
              {!allAccepted && (
                <div className="vote-actions">
                  <button
                    className={votes[participant.id] === 'accept' ? 'selected accept' : ''}
                    onClick={() => onVote(participant.id, 'accept')}
                    type="button"
                  >
                    Acepta
                  </button>
                  <button
                    className={votes[participant.id] === 'reject' ? 'selected reject' : ''}
                    onClick={() => onVote(participant.id, 'reject')}
                    type="button"
                  >
                    Quiere cambios
                  </button>
                </div>
              )}
              {allAccepted && <span className="accepted-label"><Icon name="check" size={14} /> Aceptado</span>}
              {votes[participant.id] === 'reject' && !allAccepted && (
                <input
                  aria-label={`Cambios solicitados por ${participant.name}`}
                  onChange={(event) => onFeedback(participant.id, event.target.value)}
                  placeholder="¿Qué debería cambiar su agente?"
                  value={feedback[participant.id] || ''}
                />
              )}
            </div>
          ))}
        </div>

        <div className="vote-footer">
          {allAccepted ? (
            <>
              <button className="secondary-button" onClick={onCopy} type="button">
                <Icon name="copy" size={16} /> Copiar acuerdo
              </button>
              <button className="primary-button" onClick={onReset} type="button">
                Crear otro pacto <Icon name="arrow" size={17} />
              </button>
            </>
          ) : (
            <>
              <span>
                {allVoted
                  ? hasRejection
                    ? 'Los agentes pueden intentar una nueva propuesta.'
                    : 'La propuesta está lista para cerrarse.'
                  : 'Faltan decisiones por registrar.'}
              </span>
              {allVoted && hasRejection && round < MAX_ROUNDS && (
                <button className="primary-button" onClick={onNextRound} type="button">
                  Negociar otra ronda <Icon name="refresh" size={17} />
                </button>
              )}
              {allVoted && hasRejection && round >= MAX_ROUNDS && (
                <button className="secondary-button" onClick={onReset} type="button">
                  Replantear el pacto
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
